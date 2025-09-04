import { supabase } from './supabase';

const API_URL = 'http://localhost:5000/api'; // Update with your backend URL

class ApiClient {
  constructor() {
    this.baseURL = API_URL;
  }

  async getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  }

  async register(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    
    if (error) throw error;
    return data;
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // File endpoints
  async uploadFile(fileUri, fileName, fileType) {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: fileType,
      name: fileName,
    });

    return this.request('/files/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  }

  async uploadMultipleFiles(files) {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('files', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      });
    });

    return this.request('/files/upload-multiple', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  }

  async getFiles(page = 1, limit = 20, search = '', type = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(type && { type }),
    });
    
    return this.request(`/files?${params}`);
  }

  async getFile(fileId) {
    return this.request(`/files/${fileId}`);
  }

  async downloadFile(fileId) {
    const token = await this.getAuthToken();
    const url = `${this.baseURL}/files/${fileId}/download`;
    
    const response = await fetch(url, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    return response.blob();
  }

  async deleteFile(fileId) {
    return this.request(`/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  // PDF operations
  async mergePDFs(fileIds, outputName = 'merged.pdf', options = {}) {
    return this.request('/pdf/advanced/advanced-merge', {
      method: 'POST',
      body: JSON.stringify({ fileIds, outputName, options }),
    });
  }

  async splitPDF(fileId, options = {}) {
    return this.request('/pdf/advanced/advanced-split', {
      method: 'POST',
      body: JSON.stringify({ fileId, options }),
    });
  }

  async compressPDF(fileId, outputName = 'compressed.pdf', options = {}) {
    return this.request('/pdf/advanced/advanced-compress', {
      method: 'POST',
      body: JSON.stringify({ fileId, outputName, options }),
    });
  }

  async convertImagesToPDF(fileIds, outputName = 'converted.pdf', options = {}) {
    return this.request('/pdf/advanced/advanced-images-to-pdf', {
      method: 'POST',
      body: JSON.stringify({ fileIds, outputName, options }),
    });
  }

  async getPDFInfo(fileId) {
    return this.request(`/pdf/info/${fileId}`);
  }

  // AI endpoints
  async performOCR(fileId, options = {}) {
    return this.request('/ai/ocr', {
      method: 'POST',
      body: JSON.stringify({ fileId, ...options }),
    });
  }

  async summarizeFile(fileId, summaryType = 'auto') {
    return this.request('/ai/summarize', {
      method: 'POST',
      body: JSON.stringify({ fileId, summaryType }),
    });
  }

  async createEmbeddings(fileId, options = {}) {
    return this.request('/ai/create-embeddings', {
      method: 'POST',
      body: JSON.stringify({ fileId, ...options }),
    });
  }

  async chatWithPDF(fileId, message, sessionId = null) {
    return this.request('/ai/chat-pdf', {
      method: 'POST',
      body: JSON.stringify({ fileId, message, sessionId }),
    });
  }

  async getChatSessions(fileId) {
    return this.request(`/ai/chat-sessions/${fileId}`);
  }

  async getChatMessages(sessionId) {
    return this.request(`/ai/chat-messages/${sessionId}`);
  }

  async getRecommendations(fileId) {
    return this.request(`/ai/recommendations/${fileId}`);
  }

  async getOCRResults(fileId) {
    return this.request(`/ai/ocr/${fileId}`);
  }

  async getSummaries(fileId) {
    return this.request(`/ai/summaries/${fileId}`);
  }

  // User endpoints
  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(data) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserStats() {
    return this.request('/users/stats');
  }

  async getUserHistory(page = 1, limit = 20) {
    return this.request(`/users/history?page=${page}&limit=${limit}`);
  }

  // Batch processing endpoints
  async createBatchOperation(name, operations) {
    return this.request('/batch', {
      method: 'POST',
      body: JSON.stringify({ name, operations }),
    });
  }

  async getBatchOperation(batchId) {
    return this.request(`/batch/${batchId}`);
  }

  async getBatchOperations(page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    return this.request(`/batch?${params}`);
  }

  async cancelBatchOperation(batchId) {
    return this.request(`/batch/${batchId}`, {
      method: 'DELETE',
    });
  }

  async getBatchTemplates() {
    return this.request('/batch/templates/common');
  }

  // Folder endpoints
  async createFolder(name, parentId = null, color = '#3B82F6') {
    return this.request('/folders', {
      method: 'POST',
      body: JSON.stringify({ name, parent_id: parentId, color }),
    });
  }

  async getFolders(parentId = null, flat = false) {
    const params = new URLSearchParams();
    if (parentId) params.append('parent_id', parentId);
    if (flat) params.append('flat', 'true');
    
    return this.request(`/folders?${params}`);
  }

  async getFolder(folderId) {
    return this.request(`/folders/${folderId}`);
  }

  async updateFolder(folderId, updates) {
    return this.request(`/folders/${folderId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteFolder(folderId, force = false) {
    const params = force ? '?force=true' : '';
    return this.request(`/folders/${folderId}${params}`, {
      method: 'DELETE',
    });
  }

  async moveFiles(fileIds, folderId = null) {
    return this.request('/folders/move-files', {
      method: 'POST',
      body: JSON.stringify({ fileIds, folder_id: folderId }),
    });
  }
}

export const api = new ApiClient();