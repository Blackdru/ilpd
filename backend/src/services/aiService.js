const OpenAI = require('openai');
const { encoding_for_model } = require('tiktoken');

class AIService {
  constructor() {
    // Determine which API to use
    const useOpenRouter = process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your_openrouter_api_key_here';
    const useOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';
    
    if (useOpenRouter) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'PDFPet'
        }
      });
      this.model = process.env.AI_MODEL || 'openai/gpt-3.5-turbo';
      this.embeddingModel = process.env.EMBEDDING_MODEL || 'openai/text-embedding-ada-002';
    } else if (useOpenAI) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.model = process.env.AI_MODEL || 'gpt-3.5-turbo';
      this.embeddingModel = process.env.EMBEDDING_MODEL || 'text-embedding-ada-002';
    } else {
      this.openai = null;
      this.model = null;
      this.embeddingModel = null;
    }
    
    this.maxTokens = 4000;
    this.isUsingOpenRouter = useOpenRouter;
    this.isUsingOpenAI = useOpenAI;
  }

  // Check if AI features are enabled
  isEnabled() {
    return process.env.ENABLE_AI_FEATURES === 'true' && 
           (process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY);
  }

  // Count tokens in text
  countTokens(text) {
    try {
      const encoding = encoding_for_model(this.model);
      const tokens = encoding.encode(text);
      encoding.free();
      return tokens.length;
    } catch (error) {
      // Fallback: rough estimation
      return Math.ceil(text.length / 4);
    }
  }

  // Split text into chunks that fit within token limits
  chunkText(text, maxTokens = 1000, overlap = 100) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks = [];
    let currentChunk = '';
    let currentTokens = 0;

    for (const sentence of sentences) {
      const sentenceTokens = this.countTokens(sentence);
      
      if (currentTokens + sentenceTokens > maxTokens && currentChunk) {
        chunks.push(currentChunk.trim());
        
        // Add overlap from previous chunk
        const words = currentChunk.split(' ');
        const overlapWords = words.slice(-overlap).join(' ');
        currentChunk = overlapWords + ' ' + sentence;
        currentTokens = this.countTokens(currentChunk);
      } else {
        currentChunk += ' ' + sentence;
        currentTokens += sentenceTokens;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  // Generate embeddings for text
  async generateEmbeddings(text) {
    if (!this.isEnabled()) {
      throw new Error('AI features are not enabled');
    }

    try {
      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  // Summarize text
  async summarizeText(text, summaryType = 'auto') {
    if (!this.isEnabled() || process.env.ENABLE_SUMMARIZATION !== 'true') {
      throw new Error('Summarization is not enabled');
    }

    const tokenCount = this.countTokens(text);
    
    // If text is too long, chunk it and summarize each chunk
    if (tokenCount > this.maxTokens) {
      const chunks = this.chunkText(text, this.maxTokens - 500); // Leave room for prompt
      const chunkSummaries = [];

      for (const chunk of chunks) {
        const summary = await this.summarizeChunk(chunk, summaryType);
        chunkSummaries.push(summary);
      }

      // Combine chunk summaries into final summary
      const combinedSummary = chunkSummaries.join('\n\n');
      return this.summarizeChunk(combinedSummary, summaryType);
    }

    return this.summarizeChunk(text, summaryType);
  }

  // Summarize a single chunk of text
  async summarizeChunk(text, summaryType = 'auto') {
    const prompts = {
      brief: 'Provide a brief 2-3 sentence summary of the following text:',
      detailed: 'Provide a detailed summary with key points and important details from the following text:',
      auto: 'Provide a concise but comprehensive summary of the following text, highlighting the main points and key information:'
    };

    const prompt = prompts[summaryType] || prompts.auto;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates clear, accurate summaries of documents. Focus on the most important information and maintain the original context.'
          },
          {
            role: 'user',
            content: `${prompt}\n\n${text}`
          }
        ],
        max_tokens: summaryType === 'brief' ? 150 : summaryType === 'detailed' ? 500 : 300,
        temperature: 0.3,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error summarizing text:', error);
      throw new Error('Failed to generate summary');
    }
  }

  // Chat with PDF content using RAG
  async chatWithPDF(query, relevantChunks, conversationHistory = []) {
    if (!this.isEnabled() || process.env.ENABLE_CHAT_PDF !== 'true') {
      throw new Error('PDF chat is not enabled');
    }

    const context = relevantChunks.map(chunk => chunk.chunk_text).join('\n\n');
    
    const systemPrompt = `You are a helpful AI assistant that answers questions about PDF documents. 
    Use the provided context from the PDF to answer questions accurately. 
    If the answer is not in the context, say so clearly.
    Be concise but thorough in your responses.
    
    Context from PDF:
    ${context}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: query }
    ];

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error in PDF chat:', error);
      throw new Error('Failed to generate response');
    }
  }

  // Generate smart recommendations
  async generateRecommendations(fileInfo, userHistory = []) {
    if (!this.isEnabled()) {
      return [];
    }

    const { filename, type, size, hasOcr, hasSummary, hasEmbeddings } = fileInfo;
    const recommendations = [];

    try {
      // Rule-based recommendations
      if (type === 'application/pdf' && !hasOcr) {
        recommendations.push({
          action: 'ocr',
          title: 'Extract Text',
          description: 'Make your PDF searchable by extracting text with OCR',
          priority: 'medium'
        });
      }

      if (hasOcr && !hasSummary) {
        recommendations.push({
          action: 'summarize',
          title: 'Generate Summary',
          description: 'Get a quick overview of your document with AI summarization',
          priority: 'high'
        });
      }

      if (hasOcr && !hasEmbeddings) {
        recommendations.push({
          action: 'enable_chat',
          title: 'Enable PDF Chat',
          description: 'Chat with your PDF and ask questions about its content',
          priority: 'high'
        });
      }

      if (size > 10 * 1024 * 1024) { // > 10MB
        recommendations.push({
          action: 'compress',
          title: 'Compress PDF',
          description: 'Reduce file size to save storage space',
          priority: 'medium'
        });
      }

      // AI-powered recommendations based on filename and user history
      if (this.isEnabled() && userHistory.length > 0) {
        const aiRecommendations = await this.generateAIRecommendations(fileInfo, userHistory);
        recommendations.push(...aiRecommendations);
      }

      return recommendations.slice(0, 5); // Limit to top 5 recommendations
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return recommendations; // Return rule-based recommendations even if AI fails
    }
  }

  // Generate AI-powered recommendations
  async generateAIRecommendations(fileInfo, userHistory) {
    const prompt = `Based on the file information and user history, suggest 1-2 relevant actions:
    
    File: ${fileInfo.filename}
    Type: ${fileInfo.type}
    Size: ${Math.round(fileInfo.size / 1024 / 1024)}MB
    
    Recent user actions: ${userHistory.slice(-5).map(h => h.action).join(', ')}
    
    Suggest actions from: merge, split, compress, convert, ocr, summarize, organize
    
    Respond with JSON array: [{"action": "action_name", "title": "Title", "description": "Description", "priority": "high|medium|low"}]`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.5,
      });

      const content = response.choices[0].message.content.trim();
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      return [];
    }
  }

  // Similarity search in embeddings
  async findSimilarContent(queryEmbedding, userEmbeddings, threshold = 0.7) {
    const similarities = userEmbeddings.map(embedding => {
      const similarity = this.cosineSimilarity(queryEmbedding, embedding.vector);
      return { ...embedding, similarity };
    });

    return similarities
      .filter(item => item.similarity > threshold)
      .sort((a, b) => b.similarity - a.similarity);
  }

  // Calculate cosine similarity between two vectors
  cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

module.exports = new AIService();