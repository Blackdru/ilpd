const express = require('express');
const { PDFDocument } = require('pdf-lib');
const PDFKit = require('pdfkit');
const sharp = require('sharp');
const archiver = require('archiver');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

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
const saveProcessedFile = async (userId, buffer, filename, mimetype) => {
  const filePath = `${userId}/processed/${Date.now()}-${filename}`;

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from('files')
    .upload(filePath, buffer, {
      contentType: mimetype,
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Failed to save processed file: ${uploadError.message}`);
  }

  // Save metadata to database
  const { data: fileData, error: dbError } = await supabaseAdmin
    .from('files')
    .insert([
      {
        user_id: userId,
        filename: filename,
        path: uploadData.path,
        type: mimetype,
        size: buffer.length
      }
    ])
    .select()
    .single();

  if (dbError) {
    // Clean up uploaded file if database insert fails
    await supabaseAdmin.storage.from('files').remove([uploadData.path]);
    throw new Error(`Database error: ${dbError.message}`);
  }

  return fileData;
};

// Helper function to log operation
const logOperation = async (userId, fileId, action) => {
  await supabaseAdmin
    .from('history')
    .insert([
      {
        user_id: userId,
        file_id: fileId,
        action: action
      }
    ]);
};

// Merge PDFs
router.post('/merge', authenticateUser, async (req, res) => {
  try {
    const { fileIds, outputName = 'merged.pdf' } = req.body;

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

    // Create merged PDF
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const fileBuffer = await getFileBuffer(file.path);
      const pdf = await PDFDocument.load(fileBuffer);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedBuffer = Buffer.from(await mergedPdf.save());

    // Save merged file
    const savedFile = await saveProcessedFile(
      req.user.id,
      mergedBuffer,
      outputName,
      'application/pdf'
    );

    // Log operation
    await logOperation(req.user.id, savedFile.id, 'merge');

    res.json({
      message: 'PDFs merged successfully',
      file: savedFile
    });
  } catch (error) {
    console.error('Merge error:', error);
    res.status(500).json({ error: error.message || 'PDF merge failed' });
  }
});

// Split PDF
router.post('/split', authenticateUser, async (req, res) => {
  try {
    const { fileId, pages, outputName = 'split.pdf' } = req.body;

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
    const pdf = await PDFDocument.load(fileBuffer);
    const totalPages = pdf.getPageCount();

    // If no specific pages provided, split into individual pages
    if (!pages || !Array.isArray(pages)) {
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${outputName.replace('.pdf', '')}_split.zip"`);
      
      archive.pipe(res);

      for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(page);

        const splitBuffer = Buffer.from(await newPdf.save());
        const fileName = `${outputName.replace('.pdf', '')}_page_${i + 1}.pdf`;
        
        archive.append(splitBuffer, { name: fileName });
      }

      // Log operation
      await logOperation(req.user.id, file.id, 'split');
      
      await archive.finalize();
      return;
    }

    // Split specific pages
    const validPages = pages.filter(p => p >= 1 && p <= totalPages);
    if (validPages.length === 0) {
      return res.status(400).json({ error: 'No valid page numbers provided' });
    }

    const newPdf = await PDFDocument.create();
    const pageIndices = validPages.map(p => p - 1); // Convert to 0-based index
    const copiedPages = await newPdf.copyPages(pdf, pageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    const splitBuffer = Buffer.from(await newPdf.save());
    const savedFile = await saveProcessedFile(
      req.user.id,
      splitBuffer,
      outputName,
      'application/pdf'
    );

    // Log operation
    await logOperation(req.user.id, savedFile.id, 'split');

    res.json({
      message: 'PDF split successfully',
      file: savedFile
    });
  } catch (error) {
    console.error('Split error:', error);
    res.status(500).json({ error: error.message || 'PDF split failed' });
  }
});

// Compress PDF (basic compression)
router.post('/compress', authenticateUser, async (req, res) => {
  try {
    const { fileId, quality = 0.7, outputName = 'compressed.pdf' } = req.body;

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
    const pdf = await PDFDocument.load(fileBuffer);

    // More aggressive compression settings
    const compressedBuffer = Buffer.from(await pdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
      updateFieldAppearances: false
    }));

    // Check if compression actually reduced size
    if (compressedBuffer.length >= fileBuffer.length) {
      return res.status(400).json({ 
        error: 'PDF is already optimized and cannot be compressed further',
        originalSize: file.size,
        attemptedSize: compressedBuffer.length
      });
    }

    const savedFile = await saveProcessedFile(
      req.user.id,
      compressedBuffer,
      outputName,
      'application/pdf'
    );

    // Log operation
    await logOperation(req.user.id, savedFile.id, 'compress');

    const compressionRatio = ((file.size - compressedBuffer.length) / file.size * 100).toFixed(1);

    res.json({
      message: 'PDF compressed successfully',
      file: savedFile,
      originalSize: file.size,
      compressedSize: compressedBuffer.length,
      compressionRatio: `${compressionRatio}%`
    });
  } catch (error) {
    console.error('Compress error:', error);
    res.status(500).json({ error: error.message || 'PDF compression failed' });
  }
});

// Convert images to PDF
router.post('/convert/images-to-pdf', authenticateUser, async (req, res) => {
  try {
    const { fileIds, outputName = 'converted.pdf' } = req.body;

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
      console.log('File types found:', files.map(f => ({ name: f.filename, type: f.type })));
      return res.status(400).json({ 
        error: 'All files must be images (JPEG, JPG, PNG, GIF, WebP)',
        foundTypes: files.map(f => f.type)
      });
    }

    const pdf = await PDFDocument.create();

    for (const file of files) {
      const imageBuffer = await getFileBuffer(file.path);
      
      // Process image with sharp to ensure compatibility
      let processedImage;
      let image;
      
      if (file.type === 'image/png') {
        processedImage = await sharp(imageBuffer)
          .png({ quality: 90 })
          .toBuffer();
        image = await pdf.embedPng(processedImage);
      } else {
        processedImage = await sharp(imageBuffer)
          .jpeg({ quality: 90 })
          .toBuffer();
        image = await pdf.embedJpg(processedImage);
      }

      const page = pdf.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
    }

    const pdfBuffer = Buffer.from(await pdf.save());

    const savedFile = await saveProcessedFile(
      req.user.id,
      pdfBuffer,
      outputName,
      'application/pdf'
    );

    // Log operation
    await logOperation(req.user.id, savedFile.id, 'convert');

    res.json({
      message: 'Images converted to PDF successfully',
      file: savedFile
    });
  } catch (error) {
    console.error('Convert images error:', error);
    res.status(500).json({ error: error.message || 'Image to PDF conversion failed' });
  }
});

// Get PDF info
router.get('/info/:fileId', authenticateUser, async (req, res) => {
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

    const fileBuffer = await getFileBuffer(file.path);
    const pdf = await PDFDocument.load(fileBuffer);

    const info = {
      pageCount: pdf.getPageCount(),
      title: pdf.getTitle() || 'Untitled',
      author: pdf.getAuthor() || 'Unknown',
      subject: pdf.getSubject() || '',
      creator: pdf.getCreator() || 'Unknown',
      producer: pdf.getProducer() || 'Unknown',
      creationDate: pdf.getCreationDate(),
      modificationDate: pdf.getModificationDate(),
      fileSize: file.size,
      filename: file.filename
    };

    res.json({
      file: file,
      info: info
    });
  } catch (error) {
    console.error('PDF info error:', error);
    res.status(500).json({ error: error.message || 'Failed to get PDF info' });
  }
});

module.exports = router;