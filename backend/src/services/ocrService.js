const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const pdf2pic = require('pdf2pic');

class OCRService {
  constructor() {
    this.languages = process.env.OCR_LANGUAGES || 'eng';
    this.confidenceThreshold = parseFloat(process.env.OCR_CONFIDENCE_THRESHOLD) || 0.7;
    this.tempDir = path.join(__dirname, '../../temp');
    this.ensureTempDir();
  }

  async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Error creating temp directory:', error);
    }
  }

  // Check if OCR is enabled
  isEnabled() {
    return process.env.ENABLE_OCR === 'true';
  }

  // Check if Tesseract is properly initialized
  async checkTesseractHealth() {
    try {
      // Create a simple test image using Sharp instead of raw buffer
      const tempPath = path.join(this.tempDir, 'health_check.png');
      
      // Create a simple 100x50 white image with black text
      await sharp({
        create: {
          width: 100,
          height: 50,
          channels: 3,
          background: { r: 255, g: 255, b: 255 }
        }
      })
      .png()
      .toFile(tempPath);
      
      // Test OCR with a timeout
      const worker = await Tesseract.createWorker('eng', 1, {
        logger: () => {} // Disable logging for health check
      });
      
      const { data } = await worker.recognize(tempPath);
      await worker.terminate();
      
      await this.cleanupFile(tempPath);
      
      return true;
    } catch (error) {
      console.warn('Tesseract health check failed (this is normal on first run):', error.message);
      return false; // Return false but don't throw - OCR might still work
    }
  }

  // Extract text from image file (simplified version)
  async extractTextFromImage(imageBuffer, options = {}) {
    if (!this.isEnabled()) {
      throw new Error('OCR is not enabled');
    }

    const {
      language = this.languages,
      enhanceImage = true
    } = options;

    const tempImagePath = path.join(this.tempDir, `${uuidv4()}.png`);

    try {
      // Save image buffer to temp file
      await fs.writeFile(tempImagePath, imageBuffer);

      // Enhance image if requested
      let processedImagePath = tempImagePath;
      if (enhanceImage) {
        processedImagePath = await this.enhanceImageForOCR(tempImagePath);
      }

      // Perform OCR
      const ocrResult = await this.performOCR(processedImagePath, language);

      return {
        text: ocrResult.text,
        confidence: ocrResult.confidence,
        pageCount: 1,
        pages: [{
          page: 1,
          text: ocrResult.text,
          confidence: ocrResult.confidence,
          words: ocrResult.words
        }],
        language: language
      };

    } finally {
      // Clean up temp files
      await this.cleanupFile(tempImagePath);
      if (processedImagePath !== tempImagePath) {
        await this.cleanupFile(processedImagePath);
      }
    }
  }

  // Extract text from PDF using OCR
  async extractTextFromPDF(pdfBuffer, options = {}) {
    if (!this.isEnabled()) {
      throw new Error('OCR is not enabled');
    }

    const {
      language = this.languages,
      enhanceImage = true,
      maxPages = 50 // Limit pages for performance
    } = options;

    const tempPdfPath = path.join(this.tempDir, `${uuidv4()}.pdf`);
    const tempImagesDir = path.join(this.tempDir, `images_${uuidv4()}`);

    try {
      // Save PDF buffer to temp file
      await fs.writeFile(tempPdfPath, pdfBuffer);
      await fs.mkdir(tempImagesDir, { recursive: true });

      // Convert PDF to images
      const convert = pdf2pic.fromPath(tempPdfPath, {
        density: 200, // DPI
        saveFilename: 'page',
        savePath: tempImagesDir,
        format: 'png',
        width: 2000,
        height: 2000
      });

      // Get PDF page count first
      const firstPage = await convert(1, { responseType: 'image' });
      if (!firstPage) {
        throw new Error('Failed to convert PDF to images');
      }

      // Process pages (limit for performance)
      const pages = [];
      let totalText = '';
      let totalConfidence = 0;
      let processedPages = 0;

      for (let pageNum = 1; pageNum <= Math.min(maxPages, 100); pageNum++) {
        try {
          const pageImage = await convert(pageNum, { responseType: 'image' });
          if (!pageImage) break; // No more pages

          let imagePath = pageImage.path;

          // Enhance image if requested
          if (enhanceImage) {
            imagePath = await this.enhanceImageForOCR(pageImage.path);
          }

          // Perform OCR on this page
          const ocrResult = await this.performOCR(imagePath, language);

          pages.push({
            page: pageNum,
            text: ocrResult.text,
            confidence: ocrResult.confidence,
            words: ocrResult.words
          });

          totalText += ocrResult.text + '\n\n';
          totalConfidence += ocrResult.confidence;
          processedPages++;

          // Clean up enhanced image if different from original
          if (imagePath !== pageImage.path) {
            await this.cleanupFile(imagePath);
          }

        } catch (pageError) {
          console.warn(`Error processing page ${pageNum}:`, pageError);
          // Continue with next page
        }
      }

      const avgConfidence = processedPages > 0 ? totalConfidence / processedPages : 0;

      return {
        text: totalText.trim(),
        confidence: avgConfidence,
        pageCount: processedPages,
        pages: pages,
        language: language
      };

    } catch (error) {
      console.error('Error in PDF OCR:', error);
      throw new Error('PDF OCR processing failed: ' + error.message);
    } finally {
      // Clean up temp files
      await this.cleanupFile(tempPdfPath);
      try {
        // Clean up images directory
        const files = await fs.readdir(tempImagesDir);
        for (const file of files) {
          await this.cleanupFile(path.join(tempImagesDir, file));
        }
        await fs.rmdir(tempImagesDir);
      } catch (cleanupError) {
        console.warn('Error cleaning up temp images:', cleanupError);
      }
    }
  }

  // Enhance image for better OCR results
  async enhanceImageForOCR(imagePath) {
    const enhancedPath = path.join(this.tempDir, `enhanced_${uuidv4()}.png`);

    try {
      await sharp(imagePath)
        .grayscale() // Convert to grayscale
        .normalize() // Normalize contrast
        .sharpen() // Sharpen the image
        .threshold(128) // Apply threshold for better text contrast
        .png()
        .toFile(enhancedPath);

      return enhancedPath;
    } catch (error) {
      console.error('Error enhancing image:', error);
      return imagePath; // Return original if enhancement fails
    }
  }

  // Perform OCR on a single image
  async performOCR(imagePath, language) {
    try {
      const { data } = await Tesseract.recognize(imagePath, language, {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      // Filter words by confidence
      const highConfidenceWords = data.words.filter(
        word => word.confidence > this.confidenceThreshold * 100
      );

      return {
        text: data.text,
        confidence: data.confidence / 100, // Convert to 0-1 scale
        words: highConfidenceWords.map(word => ({
          text: word.text,
          confidence: word.confidence / 100,
          bbox: word.bbox
        }))
      };
    } catch (error) {
      console.error('Error in Tesseract OCR:', error);
      throw new Error('OCR processing failed');
    }
  }

  // Clean up temporary files
  async cleanupFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore cleanup errors
      console.warn('Could not clean up file:', filePath);
    }
  }

  // Clean up old temp files (call periodically)
  async cleanupTempFiles(maxAge = 3600000) { // 1 hour default
    try {
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await this.cleanupFile(filePath);
        }
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }

  // Get supported languages
  getSupportedLanguages() {
    return {
      'eng': 'English',
      'spa': 'Spanish',
      'fra': 'French',
      'deu': 'German',
      'ita': 'Italian',
      'por': 'Portuguese',
      'rus': 'Russian',
      'chi_sim': 'Chinese (Simplified)',
      'chi_tra': 'Chinese (Traditional)',
      'jpn': 'Japanese',
      'kor': 'Korean',
      'ara': 'Arabic',
      'hin': 'Hindi'
    };
  }
}

module.exports = new OCRService();