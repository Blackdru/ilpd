const express = require('express');
const multer = require('multer');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 
                         'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                         'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, Word, and Excel files are allowed.'));
    }
  }
});

// Upload single file
router.post('/upload', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const file = req.file;
    const fileName = `${req.user.id}/${Date.now()}-${file.originalname}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('files')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      return res.status(400).json({ error: uploadError.message });
    }

    // Save file metadata to database
    const { data: fileData, error: dbError } = await supabaseAdmin
      .from('files')
      .insert([
        {
          user_id: req.user.id,
          filename: file.originalname,
          path: uploadData.path,
          type: file.mimetype,
          size: file.size
        }
      ])
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabaseAdmin.storage.from('files').remove([uploadData.path]);
      return res.status(400).json({ error: dbError.message });
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      file: fileData
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Upload multiple files
router.post('/upload-multiple', authenticateUser, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const fileName = `${req.user.id}/${Date.now()}-${file.originalname}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('files')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed for ${file.originalname}: ${uploadError.message}`);
      }

      // Save file metadata to database
      const { data: fileData, error: dbError } = await supabaseAdmin
        .from('files')
        .insert([
          {
            user_id: req.user.id,
            filename: file.originalname,
            path: uploadData.path,
            type: file.mimetype,
            size: file.size
          }
        ])
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabaseAdmin.storage.from('files').remove([uploadData.path]);
        throw new Error(`Database error for ${file.originalname}: ${dbError.message}`);
      }

      return fileData;
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.status(201).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ error: error.message || 'File upload failed' });
  }
});

// Get user files
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, type } = req.query;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('files')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.ilike('filename', `%${search}%`);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      files: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Get file by ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({ file: data });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ error: 'Failed to fetch file' });
  }
});

// Download file
router.get('/:id/download', authenticateUser, async (req, res) => {
  try {
    // Get file metadata
    const { data: fileData, error: fileError } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (fileError || !fileData) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get file from storage
    const { data: fileBuffer, error: downloadError } = await supabaseAdmin.storage
      .from('files')
      .download(fileData.path);

    if (downloadError) {
      return res.status(400).json({ error: downloadError.message });
    }

    // Convert blob to buffer for Node.js
    const buffer = Buffer.from(await fileBuffer.arrayBuffer());

    res.set({
      'Content-Type': fileData.type,
      'Content-Disposition': `attachment; filename="${fileData.filename}"`,
      'Content-Length': buffer.length
    });

    res.send(buffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'File download failed' });
  }
});

// Delete file
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    // Get file metadata
    const { data: fileData, error: fileError } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (fileError || !fileData) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete from storage
    const { error: storageError } = await supabaseAdmin.storage
      .from('files')
      .remove([fileData.path]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error: dbError } = await supabaseAdmin
      .from('files')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (dbError) {
      return res.status(400).json({ error: dbError.message });
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'File deletion failed' });
  }
});

// Get file preview/thumbnail
router.get('/:id/preview', authenticateUser, async (req, res) => {
  try {
    // Get file metadata
    const { data: fileData, error: fileError } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (fileError || !fileData) {
      return res.status(404).json({ error: 'File not found' });
    }

    // For now, return file metadata for preview
    // In a full implementation, you would generate thumbnails for images/PDFs
    res.json({
      file: fileData,
      previewUrl: null, // Would contain thumbnail URL in full implementation
      canPreview: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(fileData.type)
    });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ error: 'Preview generation failed' });
  }
});

module.exports = router;