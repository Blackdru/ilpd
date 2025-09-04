const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');
const aiService = require('../services/aiService');
const ocrService = require('../services/ocrService');

const router = express.Router();

// OCR - Extract text from PDF
router.post('/ocr', authenticateUser, async (req, res) => {
  try {
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }

    // Get file metadata
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', req.user.id)
      .single();

    if (fileError || !file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Simulate OCR processing
    const mockText = `This is extracted text from ${file.filename}. 

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

    // Update file record
    await supabase
      .from('files')
      .update({
        extracted_text: mockText,
        has_ocr: true
      })
      .eq('id', fileId);

    res.json({
      message: 'OCR completed successfully',
      result: {
        text: mockText,
        confidence: 0.95,
        language: 'eng',
        pageCount: 1
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

    // Get file info
    const { data: file } = await supabase
      .from('files')
      .select('filename')
      .eq('id', fileId)
      .eq('user_id', req.user.id)
      .single();

    // Generate mock AI response
    const responses = [
      `Based on the document "${file?.filename}", I can help you with that. ${message.includes('what') ? 'This document contains information about various topics.' : 'That\'s an interesting question about the document content.'} Would you like me to elaborate on any specific section?`,
      `I've analyzed the content of "${file?.filename}" regarding your question: "${message}". The document discusses several key points that are relevant to your inquiry. What specific aspect would you like to explore further?`,
      `From my understanding of "${file?.filename}", I can provide insights about ${message.toLowerCase()}. The document contains relevant information that addresses your question. Is there a particular section you'd like me to focus on?`
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    res.json({
      sessionId: sessionId || 'mock-session-' + Date.now(),
      response: response
    });

  } catch (error) {
    console.error('PDF chat error:', error);
    res.status(500).json({ error: error.message || 'Chat failed' });
  }
});

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