export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getFileIcon(mimeType) {
  if (mimeType.includes('pdf')) return 'file-pdf-box';
  if (mimeType.includes('image')) return 'file-image';
  if (mimeType.includes('word')) return 'file-word-box';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-excel-box';
  return 'file';
}