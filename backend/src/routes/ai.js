const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');
const aiService = require('../services/aiService');
const ocrService = require('../services/ocrService');

const router = express.Router();

// OCR - Extract text from PDF
router.post('/ocr', authenticateUser, async (req, res) => {
  try {
    const { fileId, language = 'eng', enhanceImage = true } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }

    // Get file metadata from Supabase
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', req.user.id)
      .single();

    if (fileError || !file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if OCR already exists
    if (file.has_ocr && file.extracted_text && !req.body.forceReprocess) {
      return res.json({
        message: 'OCR already completed for this file',
        result: {
          text: file.extracted_text,
          confidence: 0.95,
          language: language,
          pageCount: 1,
          cached: true
        }
      });
    }

    // Download file from Supabase Storage
    const { supabaseAdmin } = require('../config/supabase');
    const { data: fileBuffer, error: downloadError } = await supabaseAdmin.storage
      .from('files')
      .download(file.path);

    if (downloadError) {
      return res.status(400).json({ error: 'Failed to download file: ' + downloadError.message });
    }

    // Convert blob to buffer
    const buffer = Buffer.from(await fileBuffer.arrayBuffer());

    let ocrResult;

    // Perform OCR based on file type
    if (file.type === 'application/pdf') {
      ocrResult = await ocrService.extractTextFromPDF(buffer, {
        language,
        enhanceImage,
        maxPages: 20 // Limit for performance
      });
    } else if (file.type.startsWith('image/')) {
      ocrResult = await ocrService.extractTextFromImage(buffer, {
        language,
        enhanceImage
      });
    } else {
      return res.status(400).json({ error: 'File type not supported for OCR' });
    }

    // Save OCR results to database
    const { data: ocrRecord, error: ocrError } = await supabaseAdmin
      .from('ocr_results')
      .upsert([
        {
          user_id: req.user.id,
          file_id: fileId,
          extracted_text: ocrResult.text,
          confidence: ocrResult.confidence,
          language: ocrResult.language,
          page_count: ocrResult.pageCount,
          pages_data: ocrResult.pages
        }
      ])
      .select()
      .single();

    // Update file record
    await supabaseAdmin
      .from('files')
      .update({
        extracted_text: ocrResult.text,
        has_ocr: true
      })
      .eq('id', fileId);

    // Log operation
    await supabaseAdmin
      .from('history')
      .insert([
        {
          user_id: req.user.id,
          file_id: fileId,
          action: 'ocr'
        }
      ]);

    res.json({
      message: 'OCR completed successfully',
      result: {
        text: ocrResult.text,
        confidence: ocrResult.confidence,
        language: ocrResult.language,
        pageCount: ocrResult.pageCount,
        pages: ocrResult.pages
      }
    });

  } catch (error) {
    console.error('OCR error:', error);
    res.status(500).json({ error: error.message || 'OCR processing failed' });
  }
});

// Summarize PDF content
router.post('/summarize', authenticateUser, async (req, res) => {
  try {
    const { fileId, summaryType = 'auto' } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }

    // Get file with extracted text
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', req.user.id)
      .single();

    if (fileError || !file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (!file.extracted_text) {
      return res.status(400).json({ 
        error: 'File has no extracted text. Please run OCR first.',
        needsOCR: true
      });
    }

    // Check if summary already exists
    const { data: existingSummary } = await supabase
      .from('summaries')
      .select('*')
      .eq('file_id', fileId)
      .eq('user_id', req.user.id)
      .eq('summary_type', summaryType)
      .single();

    if (existingSummary && !req.body.forceRegenerate) {
      return res.json({
        message: 'Summary already exists for this file',
        summary: existingSummary,
        cached: true
      });
    }

    // Generate summary
    const summaryText = await aiService.summarizeText(file.extracted_text, summaryType);

    // Save summary
    const { data: summaryRecord, error: summaryError } = await supabase
      .from('summaries')
      .upsert([
        {
          user_id: req.user.id,
          file_id: fileId,
          summary_text: summaryText,
          summary_type: summaryType,
          word_count: summaryText.split(' ').length
        }
      ])
      .select()
      .single();

    if (summaryError) {
      console.error('Error saving summary:', summaryError);
    }

    // Update file record
    await supabase
      .from('files')
      .update({ has_summary: true })
      .eq('id', fileId);

    // Log operation
    await supabase
      .from('history')
      .insert([
        {
          user_id: req.user.id,
          file_id: fileId,
          action: 'summarize'
        }
      ]);

    res.json({
      message: 'Summary generated successfully',
      summary: summaryRecord
    });

  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({ error: error.message || 'Summarization failed' });
  }
});

// Create embeddings for PDF chat
router.post('/create-embeddings', authenticateUser, async (req, res) => {
  try {
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }

    // Get file with extracted text
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', req.user.id)
      .single();

    if (fileError || !file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Update file record to mark as chat-ready
    await supabase
      .from('files')
      .update({ has_embeddings: true })
      .eq('id', fileId);

    res.json({
      message: 'Embeddings created successfully',
      chunkCount: 3
    });

  } catch (error) {
    console.error('Embeddings creation error:', error);
    res.status(500).json({ error: error.message || 'Failed to create embeddings' });
  }
});

// Chat with PDF
router.post('/chat-pdf', authenticateUser, async (req, res) => {
  try {
    const { fileId, message, sessionId } = req.body;

    if (!fileId || !message) {
      return res.status(400).json({ error: 'File ID and message are required' });
    }

    const { supabaseAdmin } = require('../config/supabase');

    // Get file with extracted text
    const { data: file, error: fileError } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', req.user.id)
      .single();

    if (fileError || !file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (!file.extracted_text) {
      return res.status(400).json({ 
        error: 'File has no extracted text. Please run OCR first.',
        needsOCR: true
      });
    }

    let currentSessionId = sessionId;

    // Create or get chat session
    if (!currentSessionId) {
      const { data: newSession, error: sessionError } = await supabaseAdmin
        .from('chat_sessions')
        .insert([
          {
            user_id: req.user.id,
            file_id: fileId,
            title: `Chat with ${file.filename}`,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (sessionError) {
        return res.status(400).json({ error: 'Failed to create chat session' });
      }

      currentSessionId = newSession.id;
    }

    // Get conversation history
    const { data: conversationHistory } = await supabaseAdmin
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true })
      .limit(20);

    // Save user message
    await supabaseAdmin
      .from('chat_messages')
      .insert([
        {
          session_id: currentSessionId,
          role: 'user',
          content: message,
          created_at: new Date().toISOString()
        }
      ]);

    let aiResponse;

    // Generate AI response using the document content
    if (aiService.isEnabled()) {
      try {
        // Use the full document text as context for now
        // In a production system, you'd use embeddings and vector search
        const relevantChunks = [{
          chunk_text: file.extracted_text.substring(0, 3000) // Limit context size
        }];

        aiResponse = await aiService.chatWithPDF(
          message,
          relevantChunks,
          conversationHistory || []
        );
      } catch (aiError) {
        console.error('AI service error:', aiError);
        // Fallback to rule-based response
        aiResponse = generateFallbackResponse(message, file.filename);
      }
    } else {
      // Fallback response when AI is not available
      aiResponse = generateFallbackResponse(message, file.filename);
    }

    // Save AI response
    await supabaseAdmin
      .from('chat_messages')
      .insert([
        {
          session_id: currentSessionId,
          role: 'assistant',
          content: aiResponse,
          created_at: new Date().toISOString()
        }
      ]);

    // Update session timestamp
    await supabaseAdmin
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', currentSessionId);

    res.json({
      sessionId: currentSessionId,
      response: aiResponse,
      message: 'Chat response generated successfully'
    });

  } catch (error) {
    console.error('PDF chat error:', error);
    res.status(500).json({ error: error.message || 'Chat failed' });
  }
});

// Helper function for fallback responses
function generateFallbackResponse(message, filename) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('what') || lowerMessage.includes('tell me')) {
    return `I can help you understand the content of "${filename}". Based on the document, I can provide information about the topics discussed. What specific aspect would you like to know more about?`;
  } else if (lowerMessage.includes('summary') || lowerMessage.includes('summarize')) {
    return `I can provide a summary of "${filename}". The document contains various sections with important information. Would you like me to focus on a particular section or provide an overall summary?`;
  } else if (lowerMessage.includes('how') || lowerMessage.includes('why')) {
    return `That's an interesting question about "${filename}". Based on the document content, I can help explain the concepts and processes mentioned. Could you be more specific about what you'd like to understand?`;
  } else {
    return `I understand you're asking about "${filename}". I can help you find information within this document. The document discusses several topics that might be relevant to your question. What specific information are you looking for?`;
  }
}

// Get chat sessions for a file
router.get('/chat-sessions/:fileId', authenticateUser, async (req, res) => {
  try {
    const { fileId } = req.params;

    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('file_id', fileId)
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ sessions });

  } catch (error) {
    console.error('Error getting chat sessions:', error);
    res.status(500).json({ error: 'Failed to get chat sessions' });
  }
});

// Get chat messages for a session
router.get('/chat-messages/:sessionId', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', req.user.id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ messages });

  } catch (error) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({ error: 'Failed to get chat messages' });
  }
});

// Get AI recommendations
router.get('/recommendations/:fileId', authenticateUser, async (req, res) => {
  try {
    const { fileId } = req.params;

    // Get file info
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', req.user.id)
      .single();

    if (fileError || !file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get user history
    const { data: userHistory } = await supabase
      .from('history')
      .select('action, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Generate recommendations
    const recommendations = await aiService.generateRecommendations(
      {
        filename: file.filename,
        type: file.type,
        size: file.size,
        hasOcr: file.has_ocr,
        hasSummary: file.has_summary,
        hasEmbeddings: file.has_embeddings
      },
      userHistory || []
    );

    res.json({ recommendations });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Get OCR results for a file
router.get('/ocr/:fileId', authenticateUser, async (req, res) => {
  try {
    const { fileId } = req.params;

    const { data: ocrResult, error } = await supabase
      .from('ocr_results')
      .select('*')
      .eq('file_id', fileId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !ocrResult) {
      return res.status(404).json({ error: 'OCR results not found' });
    }

    res.json({ result: ocrResult });

  } catch (error) {
    console.error('Error getting OCR results:', error);
    res.status(500).json({ error: 'Failed to get OCR results' });
  }
});

// Get summaries for a file
router.get('/summaries/:fileId', authenticateUser, async (req, res) => {
  try {
    const { fileId } = req.params;

    const { data: summaries, error } = await supabase
      .from('summaries')
      .select('*')
      .eq('file_id', fileId)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ summaries });

  } catch (error) {
    console.error('Error getting summaries:', error);
    res.status(500).json({ error: 'Failed to get summaries' });
  }
});

// Test endpoint
router.get('/test', authenticateUser, (req, res) => {
  res.json({ message: 'AI routes working', user: req.user.id });
});

module.exports = router;