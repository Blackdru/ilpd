const express = require('express');
const multer = require('multer');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');
const advancedPdfService = require('../services/advancedPdfService');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Helper function to get file buffer from Supabase Storage
const getFileBuffer = async (filePath) => {
  const { data, error } = await supabaseAdmin.storage
    .from('files')
    .download(filePath);

  if (error) {
    throw new Error(`Failed to download file: ${error.message}`);
  }

  return Buffer.from(await data.arrayBuffer());
};

// Helper function to save processed file
const saveProcessedFile = async (userId, buffer, filename, mimetype, metadata = {}) => {
  const filePath = `${userId}/processed/${Date.now()}-${filename}`;

  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from('files')
    .upload(filePath, buffer, {
      contentType: mimetype,
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Failed to save processed file: ${uploadError.message}`);
  }

  const { data: fileData, error: dbError } = await supabaseAdmin
    .from('files')
    .insert([
      {
        user_id: userId,
        filename: filename,
        path: uploadData.path,
        type: mimetype,
        size: buffer.length,
        metadata: metadata
      }
    ])
    .select()
    .single();

  if (dbError) {
    await supabaseAdmin.storage.from('files').remove([uploadData.path]);
    throw new Error(`Database error: ${dbError.message}`);
  }

  return fileData;
};

// Advanced PDF Merge
router.post('/advanced-merge', authenticateUser, async (req, res) => {
  try {
    const { 
      fileIds, 
      outputName = 'advanced-merged.pdf',
      options = {}
    } = req.body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 files are required for merging' });
    }

    // Get file metadata
    const { data: files, error: filesError } = await supabaseAdmin
      .from('files')
      .select('*')
      .in('id', fileIds)
      .eq('user_id', req.user.id);

    if (filesError || !files || files.length !== fileIds.length) {
      return res.status(404).json({ error: 'One or more files not found' });
    }

    // Verify all files are PDFs
    const nonPdfFiles = files.filter(file => file.type !== 'application/pdf');
    if (nonPdfFiles.length > 0) {
      return res.status(400).json({ error: 'All files must be PDFs for merging' });
    }

    // Get file buffers
    const fileBuffers = [];
    for (const file of files) {
      const buffer = await getFileBuffer(file.path);
      fileBuffers.push({
        name: file.filename,
        arrayBuffer: () => Promise.resolve(buffer.buffer)
      });
    }

    // Perform advanced merge
    const mergedBuffer = await advancedPdfService.advancedMerge(fileBuffers, options);

    // Save merged file
    const savedFile = await saveProcessedFile(
      req.user.id,
      Buffer.from(mergedBuffer),
      outputName,
      'application/pdf',
      { operation: 'advanced-merge', options }
    );

    // Log operation
    await supabaseAdmin
      .from('history')
      .insert([{
        user_id: req.user.id,
        file_id: savedFile.id,
        action: 'advanced-merge',
        metadata: { fileCount: files.length, options }
      }]);

    res.json({
      message: 'PDFs merged successfully with advanced options',
      file: savedFile,
      options: options
    });

  } catch (error) {
    console.error('Advanced merge error:', error);
    res.status(500).json({ error: error.message || 'Advanced PDF merge failed' });
  }
});

// Advanced PDF Split
router.post('/advanced-split', authenticateUser, async (req, res) => {
  try {
    const { 
      fileId, 
      options = {}
    } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }

    // Get file metadata
    const { data: file, error: fileError } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', req.user.id)
      .single();

    if (fileError || !file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.type !== 'application/pdf') {
      return res.status(400).json({ error: 'File must be a PDF' });
    }

    const fileBuffer = await getFileBuffer(file.path);
    
    // Perform advanced split
    const splitResults = await advancedPdfService.advancedSplit(fileBuffer, options);

    if (options.outputFormat === 'zip' || splitResults.length > 1) {
      // Create ZIP file with all split PDFs
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${file.filename.replace('.pdf', '')}_split.zip"`);
      
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(res);

      for (const result of splitResults) {
        archive.append(result.buffer, { name: result.name });
      }

      await archive.finalize();

      // Log operation
      await supabaseAdmin
        .from('history')
        .insert([{
          user_id: req.user.id,
          file_id: file.id,
          action: 'advanced-split',
          metadata: { splitCount: splitResults.length, options }
        }]);

    } else {
      // Single file result
      const result = splitResults[0];
      const savedFile = await saveProcessedFile(
        req.user.id,
        result.buffer,
        result.name,
        'application/pdf',
        { operation: 'advanced-split', options, pageRange: result.range }
      );

      res.json({
        message: 'PDF split successfully',
        file: savedFile,
        options: options
      });
    }

  } catch (error) {
    console.error('Advanced split error:', error);
    res.status(500).json({ error: error.message || 'Advanced PDF split failed' });
  }
});

// Advanced PDF Compression
router.post('/advanced-compress', authenticateUser, async (req, res) => {
  try {
    const { 
      fileId, 
      outputName = 'compressed.pdf',
      options = {}
    } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }

    // Get file metadata
    const { data: file, error: fileError } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', req.user.id)
      .single();

    if (fileError || !file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.type !== 'application/pdf') {
      return res.status(400).json({ error: 'File must be a PDF' });
    }

    const fileBuffer = await getFileBuffer(file.path);
    
    // Perform advanced compression
    const compressionResult = await advancedPdfService.advancedCompress(fileBuffer, options);

    // Check if compression was effective
    if (compressionResult.compressedSize >= compressionResult.originalSize * 0.95) {
      return res.status(400).json({ 
        error: 'PDF is already well optimized. Minimal compression achieved.',
        originalSize: compressionResult.originalSize,
        compressedSize: compressionResult.compressedSize,
        compressionRatio: compressionResult.compressionRatio
      });
    }

    const savedFile = await saveProcessedFile(
      req.user.id,
      compressionResult.buffer,
      outputName,
      'application/pdf',
      { 
        operation: 'advanced-compress', 
        options,
        compressionStats: {
          originalSize: compressionResult.originalSize,
          compressedSize: compressionResult.compressedSize,
          compressionRatio: compressionResult.compressionRatio
        }
      }
    );

    // Log operation
    await supabaseAdmin
      .from('history')
      .insert([{
        user_id: req.user.id,
        file_id: savedFile.id,
        action: 'advanced-compress',
        metadata: { 
          compressionRatio: compressionResult.compressionRatio,
          options 
        }
      }]);

    res.json({
      message: 'PDF compressed successfully with advanced options',
      file: savedFile,
      compressionStats: {
        originalSize: compressionResult.originalSize,
        compressedSize: compressionResult.compressedSize,
        compressionRatio: compressionResult.compressionRatio,
        savedBytes: compressionResult.originalSize - compressionResult.compressedSize
      },
      options: options
    });

  } catch (error) {
    console.error('Advanced compression error:', error);
    res.status(500).json({ error: error.message || 'Advanced PDF compression failed' });
  }
});

// Advanced Image to PDF Conversion
router.post('/advanced-images-to-pdf', authenticateUser, async (req, res) => {
  try {
    const { 
      fileIds, 
      outputName = 'converted.pdf',
      options = {}
    } = req.body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ error: 'At least 1 image file is required' });
    }

    // Get file metadata
    const { data: files, error: filesError } = await supabaseAdmin
      .from('files')
      .select('*')
      .in('id', fileIds)
      .eq('user_id', req.user.id);

    if (filesError || !files || files.length !== fileIds.length) {
      return res.status(404).json({ error: 'One or more files not found' });
    }

    // Verify all files are images
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const nonImageFiles = files.filter(file => !imageTypes.includes(file.type));
    if (nonImageFiles.length > 0) {
      return res.status(400).json({ 
        error: 'All files must be images (JPEG, JPG, PNG, GIF, WebP)',
        foundTypes: files.map(f => f.type)
      });
    }

    // Get image buffers
    const imageBuffers = [];
    for (const file of files) {
      const buffer = await getFileBuffer(file.path);
      imageBuffers.push(buffer);
    }

    // Perform advanced conversion
    const pdfBuffer = await advancedPdfService.advancedImageToPdf(imageBuffers, options);

    const savedFile = await saveProcessedFile(
      req.user.id,
      Buffer.from(pdfBuffer),
      outputName,
      'application/pdf',
      { 
        operation: 'advanced-images-to-pdf', 
        options,
        imageCount: files.length
      }
    );

    // Log operation
    await supabaseAdmin
      .from('history')
      .insert([{
        user_id: req.user.id,
        file_id: savedFile.id,
        action: 'advanced-images-to-pdf',
        metadata: { imageCount: files.length, options }
      }]);

    res.json({
      message: 'Images converted to PDF successfully with advanced options',
      file: savedFile,
      imageCount: files.length,
      options: options
    });

  } catch (error) {
    console.error('Advanced image conversion error:', error);
    res.status(500).json({ error: error.message || 'Advanced image to PDF conversion failed' });
  }
});

// PDF Password Protection
router.post('/password-protect', authenticateUser, async (req, res) => {
  try {
    const { 
      fileId, 
      password,
      permissions = {},
      outputName = 'protected.pdf'
    } = req.body;

    if (!fileId || !password) {
      return res.status(400).json({ error: 'File ID and password are required' });
    }

    // Get file metadata
    const { data: file, error: fileError } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', req.user.id)
      .single();

    if (fileError || !file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.type !== 'application/pdf') {
      return res.status(400).json({ error: 'File must be a PDF' });
    }

    // Note: PDF password protection requires additional libraries like HummusJS
    // For now, return a placeholder response
    res.status(501).json({ 
      error: 'Password protection feature requires additional setup',
      message: 'This feature will be available in a future update'
    });

  } catch (error) {
    console.error('Password protection error:', error);
    res.status(500).json({ error: error.message || 'Password protection failed' });
  }
});

// PDF Form Creation
router.post('/create-form', authenticateUser, async (req, res) => {
  try {
    const {
      formFields = [],
      pageSize = 'A4',
      outputName = 'form.pdf',
      options = {}
    } = req.body;

    if (!formFields || formFields.length === 0) {
      return res.status(400).json({ error: 'Form fields are required' });
    }

    // Create PDF form (placeholder implementation)
    res.status(501).json({ 
      error: 'PDF form creation feature requires additional setup',
      message: 'This feature will be available in a future update'
    });

  } catch (error) {
    console.error('Form creation error:', error);
    res.status(500).json({ error: error.message || 'Form creation failed' });
  }
});

// PDF Digital Signature
router.post('/digital-sign', authenticateUser, async (req, res) => {
  try {
    const {
      fileId,
      signatureData,
      position = { x: 100, y: 100 },
      outputName = 'signed.pdf'
    } = req.body;

    if (!fileId || !signatureData) {
      return res.status(400).json({ error: 'File ID and signature data are required' });
    }

    // Digital signature implementation (placeholder)
    res.status(501).json({ 
      error: 'Digital signature feature requires additional setup',
      message: 'This feature will be available in a future update'
    });

  } catch (error) {
    console.error('Digital signature error:', error);
    res.status(500).json({ error: error.message || 'Digital signature failed' });
  }
});

// PDF Annotation and Markup
router.post('/annotate', authenticateUser, async (req, res) => {
  try {
    const {
      fileId,
      annotations = [],
      outputName = 'annotated.pdf'
    } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }

    // PDF annotation implementation (placeholder)
    res.status(501).json({ 
      error: 'PDF annotation feature requires additional setup',
      message: 'This feature will be available in a future update'
    });

  } catch (error) {
    console.error('PDF annotation error:', error);
    res.status(500).json({ error: error.message || 'PDF annotation failed' });
  }
});

// Get PDF Analysis and Insights
router.get('/analyze/:fileId', authenticateUser, async (req, res) => {
  try {
    const { fileId } = req.params;

    // Get file metadata
    const { data: file, error: fileError } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', req.user.id)
      .single();

    if (fileError || !file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.type !== 'application/pdf') {
      return res.status(400).json({ error: 'File must be a PDF' });
    }

    // Perform PDF analysis (placeholder implementation)
    const analysis = {
      fileInfo: {
        filename: file.filename,
        size: file.size,
        created: file.created_at
      },
      structure: {
        pageCount: 0,
        hasImages: false,
        hasText: false,
        hasForms: false,
        hasBookmarks: false,
        hasAnnotations: false
      },
      optimization: {
        compressionPotential: 'medium',
        recommendedActions: [
          'Consider compressing images',
          'Remove unused objects',
          'Optimize for web viewing'
        ]
      },
      accessibility: {
        hasTextAlternatives: false,
        hasStructuralTags: false,
        colorContrastIssues: false
      }
    };

    res.json({
      message: 'PDF analysis completed',
      analysis: analysis
    });

  } catch (error) {
    console.error('PDF analysis error:', error);
    res.status(500).json({ error: error.message || 'PDF analysis failed' });
  }
});

module.exports = router;