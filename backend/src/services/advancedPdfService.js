const { PDFDocument, rgb, StandardFonts, PageSizes, degrees } = require('pdf-lib');
const PDFKit = require('pdfkit');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class AdvancedPdfService {
  constructor() {
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

  // Advanced PDF Merge with customization options
  async advancedMerge(files, options = {}) {
    const {
      outputName = 'merged.pdf',
      addBookmarks = false,
      addPageNumbers = false,
      pageNumberPosition = 'bottom-right',
      pageNumberStyle = 'arabic',
      addTitlePage = false,
      titlePageContent = {},
      pageOrder = null, // Custom page ordering
      removeBlankPages = false,
      optimizeForPrint = false,
      addWatermark = false,
      watermarkOptions = {}
    } = options;

    const mergedPdf = await PDFDocument.create();
    
    // Set PDF metadata
    if (titlePageContent.title) mergedPdf.setTitle(titlePageContent.title);
    if (titlePageContent.author) mergedPdf.setAuthor(titlePageContent.author);
    if (titlePageContent.subject) mergedPdf.setSubject(titlePageContent.subject);
    mergedPdf.setCreator('PDFPet Advanced Tools');
    mergedPdf.setProducer('PDFPet Advanced Tools');

    let bookmarks = [];
    let totalPages = 0;

    // Add title page if requested
    if (addTitlePage) {
      const titlePage = await this.createTitlePage(mergedPdf, titlePageContent);
      totalPages++;
    }

    // Process files in specified order or default order
    const orderedFiles = pageOrder ? this.reorderFiles(files, pageOrder) : files;

    for (let i = 0; i < orderedFiles.length; i++) {
      const file = orderedFiles[i];
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const pdf = await PDFDocument.load(fileBuffer);
      
      const pageIndices = pdf.getPageIndices();
      let validPages = pageIndices;

      // Remove blank pages if requested
      if (removeBlankPages) {
        validPages = await this.filterBlankPages(pdf, pageIndices);
      }

      const pages = await mergedPdf.copyPages(pdf, validPages);
      
      // Add bookmark for this file
      if (addBookmarks) {
        bookmarks.push({
          title: file.name || `Document ${i + 1}`,
          pageNumber: totalPages + 1
        });
      }

      pages.forEach((page, pageIndex) => {
        mergedPdf.addPage(page);
        totalPages++;

        // Add page numbers
        if (addPageNumbers) {
          this.addPageNumber(page, totalPages, pageNumberPosition, pageNumberStyle);
        }

        // Add watermark
        if (addWatermark) {
          this.addWatermarkToPage(page, watermarkOptions);
        }
      });
    }

    // Add bookmarks to PDF
    if (addBookmarks && bookmarks.length > 0) {
      await this.addBookmarksToPdf(mergedPdf, bookmarks);
    }

    // Optimize for print if requested
    if (optimizeForPrint) {
      await this.optimizeForPrint(mergedPdf);
    }

    return await mergedPdf.save();
  }

  // Advanced PDF Split with multiple options
  async advancedSplit(fileBuffer, options = {}) {
    const {
      splitType = 'pages', // 'pages', 'bookmarks', 'size', 'custom'
      pagesPerFile = 1,
      maxFileSize = null, // in MB
      customRanges = [], // [{start: 1, end: 5, name: 'Chapter 1'}]
      outputFormat = 'separate', // 'separate', 'zip'
      addMetadata = true,
      preserveBookmarks = true,
      optimizeOutput = false,
      passwordProtect = false,
      password = null
    } = options;

    const pdf = await PDFDocument.load(fileBuffer);
    const totalPages = pdf.getPageCount();
    const results = [];

    let splitRanges = [];

    switch (splitType) {
      case 'pages':
        splitRanges = this.createPageRanges(totalPages, pagesPerFile);
        break;
      case 'size':
        splitRanges = await this.createSizeBasedRanges(pdf, maxFileSize);
        break;
      case 'custom':
        splitRanges = customRanges;
        break;
      case 'bookmarks':
        splitRanges = await this.createBookmarkRanges(pdf);
        break;
    }

    for (let i = 0; i < splitRanges.length; i++) {
      const range = splitRanges[i];
      const newPdf = await PDFDocument.create();

      // Copy metadata if requested
      if (addMetadata) {
        this.copyMetadata(pdf, newPdf);
      }

      const pageIndices = [];
      for (let pageNum = range.start - 1; pageNum < range.end; pageNum++) {
        if (pageNum < totalPages) pageIndices.push(pageNum);
      }

      const pages = await newPdf.copyPages(pdf, pageIndices);
      pages.forEach(page => newPdf.addPage(page));

      // Preserve bookmarks if requested
      if (preserveBookmarks) {
        await this.preserveBookmarksInRange(pdf, newPdf, range);
      }

      // Optimize output if requested
      if (optimizeOutput) {
        await this.optimizePdf(newPdf);
      }

      let pdfBytes = await newPdf.save();

      // Password protect if requested
      if (passwordProtect && password) {
        pdfBytes = await this.passwordProtectPdf(pdfBytes, password);
      }

      results.push({
        name: range.name || `split_${i + 1}.pdf`,
        buffer: Buffer.from(pdfBytes),
        pageCount: pageIndices.length,
        range: range
      });
    }

    return results;
  }

  // Advanced PDF Compression with multiple algorithms
  async advancedCompress(fileBuffer, options = {}) {
    const {
      compressionLevel = 'medium', // 'low', 'medium', 'high', 'maximum'
      imageQuality = 85,
      removeMetadata = false,
      removeAnnotations = false,
      removeBookmarks = false,
      removeJavaScript = false,
      removeAttachments = false,
      optimizeImages = true,
      downsampleImages = false,
      maxImageDPI = 150,
      convertToGrayscale = false,
      removeUnusedObjects = true,
      compressStreams = true,
      linearize = false // Optimize for web viewing
    } = options;

    const pdf = await PDFDocument.load(fileBuffer);
    
    // Remove various elements if requested
    if (removeMetadata) {
      pdf.setTitle('');
      pdf.setAuthor('');
      pdf.setSubject('');
      pdf.setKeywords([]);
      pdf.setCreator('');
      pdf.setProducer('');
    }

    // Process images if optimization is enabled
    if (optimizeImages) {
      await this.optimizeImagesInPdf(pdf, {
        quality: imageQuality,
        downsample: downsampleImages,
        maxDPI: maxImageDPI,
        grayscale: convertToGrayscale
      });
    }

    // Set compression options based on level
    const compressionOptions = this.getCompressionOptions(compressionLevel);
    compressionOptions.useObjectStreams = compressStreams;
    compressionOptions.addDefaultPage = false;

    const compressedBytes = await pdf.save(compressionOptions);

    return {
      buffer: Buffer.from(compressedBytes),
      originalSize: fileBuffer.length,
      compressedSize: compressedBytes.length,
      compressionRatio: ((fileBuffer.length - compressedBytes.length) / fileBuffer.length * 100).toFixed(1)
    };
  }

  // Advanced Image to PDF conversion with layout options
  async advancedImageToPdf(imageBuffers, options = {}) {
    const {
      pageSize = 'A4', // A4, Letter, Legal, A3, A5, Custom
      customSize = null, // {width: 595, height: 842}
      orientation = 'portrait', // portrait, landscape
      margin = 50,
      imagesPerPage = 1,
      imageLayout = 'fit', // fit, fill, stretch, center
      backgroundColor = null,
      addBorder = false,
      borderWidth = 1,
      borderColor = '#000000',
      imageQuality = 95,
      addPageNumbers = false,
      addTimestamp = false,
      watermark = null,
      metadata = {}
    } = options;

    const pdf = await PDFDocument.create();

    // Set metadata
    if (metadata.title) pdf.setTitle(metadata.title);
    if (metadata.author) pdf.setAuthor(metadata.author);
    if (metadata.subject) pdf.setSubject(metadata.subject);

    // Get page dimensions
    const pageDimensions = this.getPageDimensions(pageSize, customSize, orientation);
    
    // Process images in batches based on imagesPerPage
    for (let i = 0; i < imageBuffers.length; i += imagesPerPage) {
      const page = pdf.addPage([pageDimensions.width, pageDimensions.height]);
      
      // Set background color if specified
      if (backgroundColor) {
        const color = this.hexToRgb(backgroundColor);
        page.drawRectangle({
          x: 0,
          y: 0,
          width: pageDimensions.width,
          height: pageDimensions.height,
          color: rgb(color.r / 255, color.g / 255, color.b / 255)
        });
      }

      const imagesOnThisPage = imageBuffers.slice(i, i + imagesPerPage);
      
      for (let j = 0; j < imagesOnThisPage.length; j++) {
        const imageBuffer = imagesOnThisPage[j];
        
        // Process image
        const processedImage = await this.processImageForPdf(imageBuffer, imageQuality);
        
        // Embed image
        let image;
        try {
          image = await pdf.embedJpg(processedImage);
        } catch {
          try {
            image = await pdf.embedPng(processedImage);
          } catch (error) {
            console.error('Failed to embed image:', error);
            continue;
          }
        }

        // Calculate image position and size
        const imagePosition = this.calculateImagePosition(
          image, 
          pageDimensions, 
          margin, 
          imagesPerPage, 
          j, 
          imageLayout
        );

        // Draw image
        page.drawImage(image, imagePosition);

        // Add border if requested
        if (addBorder) {
          const borderColorRgb = this.hexToRgb(borderColor);
          page.drawRectangle({
            x: imagePosition.x - borderWidth,
            y: imagePosition.y - borderWidth,
            width: imagePosition.width + (borderWidth * 2),
            height: imagePosition.height + (borderWidth * 2),
            borderColor: rgb(borderColorRgb.r / 255, borderColorRgb.g / 255, borderColorRgb.b / 255),
            borderWidth: borderWidth
          });
        }
      }

      // Add page number if requested
      if (addPageNumbers) {
        await this.addPageNumberToPdfKitPage(page, Math.floor(i / imagesPerPage) + 1);
      }

      // Add timestamp if requested
      if (addTimestamp) {
        await this.addTimestampToPage(page);
      }

      // Add watermark if specified
      if (watermark) {
        await this.addWatermarkToPage(page, watermark);
      }
    }

    return await pdf.save();
  }

  // PDF to Images conversion with advanced options
  async pdfToImages(fileBuffer, options = {}) {
    const {
      format = 'png', // png, jpg, webp
      quality = 95,
      dpi = 150,
      pageRange = null, // {start: 1, end: 5} or null for all
      backgroundColor = '#ffffff',
      trimWhitespace = false,
      addDropShadow = false,
      outputSize = null, // {width: 800, height: 600} or null for original
      watermark = null
    } = options;

    // This would require pdf2pic or similar library
    // For now, return a placeholder implementation
    throw new Error('PDF to Images conversion requires additional setup with pdf2pic library');
  }

  // Utility methods
  createPageRanges(totalPages, pagesPerFile) {
    const ranges = [];
    for (let i = 0; i < totalPages; i += pagesPerFile) {
      ranges.push({
        start: i + 1,
        end: Math.min(i + pagesPerFile, totalPages),
        name: `pages_${i + 1}_to_${Math.min(i + pagesPerFile, totalPages)}.pdf`
      });
    }
    return ranges;
  }

  getCompressionOptions(level) {
    const options = {
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
      updateFieldAppearances: false
    };

    switch (level) {
      case 'low':
        options.objectsPerTick = 100;
        break;
      case 'medium':
        options.objectsPerTick = 50;
        break;
      case 'high':
        options.objectsPerTick = 25;
        break;
      case 'maximum':
        options.objectsPerTick = 10;
        options.useObjectStreams = true;
        break;
    }

    return options;
  }

  getPageDimensions(pageSize, customSize, orientation) {
    let dimensions;

    if (pageSize === 'Custom' && customSize) {
      dimensions = customSize;
    } else {
      const sizes = {
        'A4': { width: 595, height: 842 },
        'Letter': { width: 612, height: 792 },
        'Legal': { width: 612, height: 1008 },
        'A3': { width: 842, height: 1191 },
        'A5': { width: 420, height: 595 }
      };
      dimensions = sizes[pageSize] || sizes['A4'];
    }

    if (orientation === 'landscape') {
      return { width: dimensions.height, height: dimensions.width };
    }

    return dimensions;
  }

  async processImageForPdf(imageBuffer, quality) {
    return await sharp(imageBuffer)
      .jpeg({ quality })
      .toBuffer();
  }

  calculateImagePosition(image, pageDimensions, margin, imagesPerPage, imageIndex, layout) {
    const availableWidth = pageDimensions.width - (margin * 2);
    const availableHeight = pageDimensions.height - (margin * 2);

    let imageWidth = image.width;
    let imageHeight = image.height;

    // Calculate position based on layout
    switch (layout) {
      case 'fit':
        const scaleX = availableWidth / imageWidth;
        const scaleY = availableHeight / imageHeight;
        const scale = Math.min(scaleX, scaleY);
        imageWidth *= scale;
        imageHeight *= scale;
        break;
      case 'fill':
        imageWidth = availableWidth;
        imageHeight = availableHeight;
        break;
      case 'stretch':
        imageWidth = availableWidth;
        imageHeight = availableHeight;
        break;
    }

    // Center the image
    const x = margin + (availableWidth - imageWidth) / 2;
    const y = margin + (availableHeight - imageHeight) / 2;

    return { x, y, width: imageWidth, height: imageHeight };
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  async addPageNumber(page, pageNumber, position, style) {
    const font = await page.doc.embedFont(StandardFonts.Helvetica);
    const fontSize = 10;
    
    let text = pageNumber.toString();
    if (style === 'roman') {
      text = this.toRoman(pageNumber);
    }

    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();

    let x, y;
    switch (position) {
      case 'top-left':
        x = 20;
        y = pageHeight - 20;
        break;
      case 'top-center':
        x = (pageWidth - textWidth) / 2;
        y = pageHeight - 20;
        break;
      case 'top-right':
        x = pageWidth - textWidth - 20;
        y = pageHeight - 20;
        break;
      case 'bottom-left':
        x = 20;
        y = 20;
        break;
      case 'bottom-center':
        x = (pageWidth - textWidth) / 2;
        y = 20;
        break;
      case 'bottom-right':
      default:
        x = pageWidth - textWidth - 20;
        y = 20;
        break;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5)
    });
  }

  toRoman(num) {
    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
    let result = '';
    
    for (let i = 0; i < values.length; i++) {
      while (num >= values[i]) {
        result += symbols[i];
        num -= values[i];
      }
    }
    
    return result;
  }

  async addWatermarkToPage(page, watermarkOptions) {
    const {
      text = 'WATERMARK',
      opacity = 0.3,
      fontSize = 48,
      color = '#cccccc',
      rotation = 45,
      position = 'center'
    } = watermarkOptions;

    const font = await page.doc.embedFont(StandardFonts.HelveticaBold);
    const colorRgb = this.hexToRgb(color);
    
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    
    let x = (pageWidth - textWidth) / 2;
    let y = pageHeight / 2;

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(colorRgb.r / 255, colorRgb.g / 255, colorRgb.b / 255),
      opacity,
      rotate: degrees(rotation)
    });
  }

  // Clean up temporary files
  async cleanupFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Could not clean up file:', filePath);
    }
  }
}

module.exports = new AdvancedPdfService();