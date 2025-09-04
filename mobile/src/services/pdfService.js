import { api } from '../lib/api';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import FileViewer from 'react-native-file-viewer';
import HapticFeedback from 'react-native-haptic-feedback';

class PDFService {
  constructor() {
    this.downloadPath = RNFS.DocumentDirectoryPath;
  }

  // File Upload with Progress
  async uploadFiles(files, onProgress) {
    try {
      const results = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update progress
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: files.length,
            fileName: file.name,
            status: 'uploading'
          });
        }

        const result = await api.uploadFile(file.uri, file.name, file.type);
        results.push(result);
        
        HapticFeedback.trigger('impactLight');
      }
      
      HapticFeedback.trigger('notificationSuccess');
      return results;
    } catch (error) {
      HapticFeedback.trigger('notificationError');
      throw error;
    }
  }

  // PDF Merge with Options
  async mergePDFs(fileIds, options = {}, onProgress) {
    try {
      const mergeOptions = {
        addBookmarks: options.addBookmarks || false,
        addPageNumbers: options.addPageNumbers || false,
        pageNumberPosition: options.pageNumberPosition || 'bottom-right',
        pageNumberStyle: options.pageNumberStyle || 'arabic',
        addTitlePage: options.addTitlePage || false,
        titlePageContent: options.titlePageContent || {},
        removeBlankPages: options.removeBlankPages || false,
        optimizeForPrint: options.optimizeForPrint || false,
        addWatermark: options.addWatermark || false,
        watermarkOptions: options.watermarkOptions || {},
        ...options
      };

      if (onProgress) {
        onProgress({ status: 'processing', message: 'Merging PDFs...' });
      }

      const result = await api.mergePDFs(
        fileIds, 
        options.outputName || 'merged.pdf',
        mergeOptions
      );

      if (onProgress) {
        onProgress({ status: 'completed', message: 'Merge completed!' });
      }

      HapticFeedback.trigger('notificationSuccess');
      return result;
    } catch (error) {
      HapticFeedback.trigger('notificationError');
      throw error;
    }
  }

  // PDF Split with Options
  async splitPDF(fileId, options = {}, onProgress) {
    try {
      const splitOptions = {
        splitType: options.splitType || 'pages',
        pagesPerFile: options.pagesPerFile || 1,
        maxFileSize: options.maxFileSize || null,
        customRanges: options.customRanges || [],
        outputFormat: options.outputFormat || 'separate',
        addMetadata: options.addMetadata !== false,
        preserveBookmarks: options.preserveBookmarks !== false,
        optimizeOutput: options.optimizeOutput || false,
        ...options
      };

      if (onProgress) {
        onProgress({ status: 'processing', message: 'Splitting PDF...' });
      }

      const result = await api.splitPDF(fileId, splitOptions);

      if (onProgress) {
        onProgress({ status: 'completed', message: 'Split completed!' });
      }

      HapticFeedback.trigger('notificationSuccess');
      return result;
    } catch (error) {
      HapticFeedback.trigger('notificationError');
      throw error;
    }
  }

  // PDF Compression with Options
  async compressPDF(fileId, options = {}, onProgress) {
    try {
      const compressOptions = {
        compressionLevel: options.compressionLevel || 'medium',
        imageQuality: options.imageQuality || 85,
        removeMetadata: options.removeMetadata || false,
        removeAnnotations: options.removeAnnotations || false,
        removeBookmarks: options.removeBookmarks || false,
        optimizeImages: options.optimizeImages !== false,
        downsampleImages: options.downsampleImages || false,
        maxImageDPI: options.maxImageDPI || 150,
        convertToGrayscale: options.convertToGrayscale || false,
        ...options
      };

      if (onProgress) {
        onProgress({ status: 'processing', message: 'Compressing PDF...' });
      }

      const result = await api.compressPDF(
        fileId,
        options.outputName || 'compressed.pdf',
        compressOptions
      );

      if (onProgress) {
        onProgress({ 
          status: 'completed', 
          message: `Compressed! Saved ${result.compressionStats?.compressionRatio || '0%'}` 
        });
      }

      HapticFeedback.trigger('notificationSuccess');
      return result;
    } catch (error) {
      HapticFeedback.trigger('notificationError');
      throw error;
    }
  }

  // Image to PDF Conversion
  async convertImagesToPDF(fileIds, options = {}, onProgress) {
    try {
      const convertOptions = {
        pageSize: options.pageSize || 'A4',
        orientation: options.orientation || 'portrait',
        margin: options.margin || 50,
        imagesPerPage: options.imagesPerPage || 1,
        imageLayout: options.imageLayout || 'fit',
        backgroundColor: options.backgroundColor || '#ffffff',
        addBorder: options.addBorder || false,
        borderWidth: options.borderWidth || 1,
        borderColor: options.borderColor || '#000000',
        imageQuality: options.imageQuality || 95,
        addPageNumbers: options.addPageNumbers || false,
        addTimestamp: options.addTimestamp || false,
        metadata: options.metadata || {},
        ...options
      };

      if (onProgress) {
        onProgress({ status: 'processing', message: 'Converting images to PDF...' });
      }

      const result = await api.convertImagesToPDF(
        fileIds,
        options.outputName || 'converted.pdf',
        convertOptions
      );

      if (onProgress) {
        onProgress({ status: 'completed', message: 'Conversion completed!' });
      }

      HapticFeedback.trigger('notificationSuccess');
      return result;
    } catch (error) {
      HapticFeedback.trigger('notificationError');
      throw error;
    }
  }

  // OCR Processing
  async performOCR(fileId, options = {}, onProgress) {
    try {
      const ocrOptions = {
        languages: options.languages || ['eng'],
        confidenceThreshold: options.confidenceThreshold || 0.7,
        enhanceImage: options.enhanceImage !== false,
        outputFormat: options.outputFormat || 'text',
        ...options
      };

      if (onProgress) {
        onProgress({ status: 'processing', message: 'Extracting text from PDF...' });
      }

      const result = await api.performOCR(fileId, ocrOptions);

      if (onProgress) {
        onProgress({ 
          status: 'completed', 
          message: `OCR completed! Extracted ${result.wordCount || 0} words` 
        });
      }

      HapticFeedback.trigger('notificationSuccess');
      return result;
    } catch (error) {
      HapticFeedback.trigger('notificationError');
      throw error;
    }
  }

  // AI Summarization
  async summarizeFile(fileId, summaryType = 'auto', onProgress) {
    try {
      if (onProgress) {
        onProgress({ status: 'processing', message: 'Generating AI summary...' });
      }

      const result = await api.summarizeFile(fileId, summaryType);

      if (onProgress) {
        onProgress({ status: 'completed', message: 'Summary generated!' });
      }

      HapticFeedback.trigger('notificationSuccess');
      return result;
    } catch (error) {
      HapticFeedback.trigger('notificationError');
      throw error;
    }
  }

  // PDF Chat Setup
  async setupPDFChat(fileId, onProgress) {
    try {
      if (onProgress) {
        onProgress({ status: 'processing', message: 'Setting up PDF chat...' });
      }

      const result = await api.createEmbeddings(fileId);

      if (onProgress) {
        onProgress({ status: 'completed', message: 'PDF chat ready!' });
      }

      HapticFeedback.trigger('notificationSuccess');
      return result;
    } catch (error) {
      HapticFeedback.trigger('notificationError');
      throw error;
    }
  }

  // Chat with PDF
  async chatWithPDF(fileId, message, sessionId = null) {
    try {
      const result = await api.chatWithPDF(fileId, message, sessionId);
      HapticFeedback.trigger('impactLight');
      return result;
    } catch (error) {
      HapticFeedback.trigger('notificationError');
      throw error;
    }
  }

  // File Download and Save
  async downloadAndSaveFile(fileId, fileName) {
    try {
      const blob = await api.downloadFile(fileId);
      const filePath = `${this.downloadPath}/${fileName}`;
      
      // Convert blob to base64 and save
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64Data = reader.result.split(',')[1];
            await RNFS.writeFile(filePath, base64Data, 'base64');
            
            HapticFeedback.trigger('notificationSuccess');
            resolve(filePath);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
      });
    } catch (error) {
      HapticFeedback.trigger('notificationError');
      throw error;
    }
  }

  // Share File
  async shareFile(fileId, fileName) {
    try {
      const filePath = await this.downloadAndSaveFile(fileId, fileName);
      
      const shareOptions = {
        title: 'Share PDF',
        message: `Sharing ${fileName}`,
        url: `file://${filePath}`,
        type: 'application/pdf',
      };

      await Share.open(shareOptions);
      HapticFeedback.trigger('impactMedium');
    } catch (error) {
      if (error.message !== 'User did not share') {
        HapticFeedback.trigger('notificationError');
        throw error;
      }
    }
  }

  // View File
  async viewFile(fileId, fileName) {
    try {
      const filePath = await this.downloadAndSaveFile(fileId, fileName);
      await FileViewer.open(filePath);
      HapticFeedback.trigger('impactMedium');
    } catch (error) {
      HapticFeedback.trigger('notificationError');
      throw error;
    }
  }

  // Get PDF Information
  async getPDFInfo(fileId) {
    try {
      const result = await api.getPDFInfo(fileId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Batch Operations
  async createBatchOperation(name, operations, onProgress) {
    try {
      if (onProgress) {
        onProgress({ status: 'processing', message: 'Creating batch operation...' });
      }

      const result = await api.createBatchOperation(name, operations);

      if (onProgress) {
        onProgress({ status: 'completed', message: 'Batch operation created!' });
      }

      HapticFeedback.trigger('notificationSuccess');
      return result;
    } catch (error) {
      HapticFeedback.trigger('notificationError');
      throw error;
    }
  }

  // Get Processing Templates
  async getBatchTemplates() {
    try {
      return await api.getBatchTemplates();
    } catch (error) {
      throw error;
    }
  }

  // File Management
  async deleteFile(fileId) {
    try {
      await api.deleteFile(fileId);
      HapticFeedback.trigger('notificationSuccess');
    } catch (error) {
      HapticFeedback.trigger('notificationError');
      throw error;
    }
  }

  // Folder Management
  async createFolder(name, parentId = null, color = '#3B82F6') {
    try {
      const result = await api.createFolder(name, parentId, color);
      HapticFeedback.trigger('notificationSuccess');
      return result;
    } catch (error) {
      HapticFeedback.trigger('notificationError');
      throw error;
    }
  }

  async moveFilesToFolder(fileIds, folderId) {
    try {
      const result = await api.moveFiles(fileIds, folderId);
      HapticFeedback.trigger('notificationSuccess');
      return result;
    } catch (error) {
      HapticFeedback.trigger('notificationError');
      throw error;
    }
  }

  // Utility Methods
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  }

  getFileIcon(fileType) {
    switch (fileType) {
      case 'application/pdf':
        return 'file-pdf-box';
      case 'image/jpeg':
      case 'image/jpg':
      case 'image/png':
      case 'image/gif':
      case 'image/webp':
        return 'image';
      default:
        return 'file';
    }
  }
}

export const pdfService = new PDFService();