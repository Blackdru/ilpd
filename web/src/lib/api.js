const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class ApiClient {
  constructor() {
    this.baseURL = API_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available
    const token = localStorage.getItem('supabase.auth.token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (parseError) {
          // If we can't parse the error response, use the status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      } else {
        return response
      }
    } catch (error) {
      console.error('API request failed:', error)
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Please check your connection and try again')
      }
      
      throw error
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(email, password, name) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    })
  }

  // User endpoints
  async getProfile() {
    return this.request('/users/profile')
  }

  async updateProfile(data) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getUserStats() {
    return this.request('/users/stats')
  }

  async getUserHistory(page = 1, limit = 20) {
    return this.request(`/users/history?page=${page}&limit=${limit}`)
  }

  // File endpoints
  async uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)

    return this.request('/files/upload', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    })
  }

  async uploadMultipleFiles(files) {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))

    return this.request('/files/upload-multiple', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    })
  }

  async getFiles(page = 1, limit = 20, search = '', type = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(type && { type }),
    })
    
    return this.request(`/files?${params}`)
  }

  async getFile(fileId) {
    return this.request(`/files/${fileId}`)
  }

  async downloadFile(fileId) {
    const token = localStorage.getItem('supabase.auth.token')
    const url = `${this.baseURL}/files/${fileId}/download`
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Download failed')
    }

    return response.blob()
  }

  async deleteFile(fileId) {
    return this.request(`/files/${fileId}`, {
      method: 'DELETE',
    })
  }

  // PDF operations
  async mergePDFs(fileIds, outputName = 'merged.pdf') {
    return this.request('/pdf/merge', {
      method: 'POST',
      body: JSON.stringify({ fileIds, outputName }),
    })
  }

  async splitPDF(fileId, pages = null, outputName = 'split.pdf') {
    return this.request('/pdf/split', {
      method: 'POST',
      body: JSON.stringify({ fileId, pages, outputName }),
    })
  }

  async compressPDF(fileId, quality = 0.7, outputName = 'compressed.pdf') {
    return this.request('/pdf/compress', {
      method: 'POST',
      body: JSON.stringify({ fileId, quality, outputName }),
    })
  }

  async convertImagesToPDF(fileIds, outputName = 'converted.pdf') {
    return this.request('/pdf/convert/images-to-pdf', {
      method: 'POST',
      body: JSON.stringify({ fileIds, outputName }),
    })
  }

  async getPDFInfo(fileId) {
    return this.request(`/pdf/info/${fileId}`)
  }

  // Advanced PDF operations
  async advancedMergePDFs(fileIds, outputName, options = {}) {
    return this.request('/pdf/advanced/advanced-merge', {
      method: 'POST',
      body: JSON.stringify({ fileIds, outputName, options }),
    })
  }

  async advancedSplitPDF(fileId, options = {}) {
    return this.request('/pdf/advanced/advanced-split', {
      method: 'POST',
      body: JSON.stringify({ fileId, options }),
    })
  }

  async advancedCompressPDF(fileId, outputName, options = {}) {
    return this.request('/pdf/advanced/advanced-compress', {
      method: 'POST',
      body: JSON.stringify({ fileId, outputName, options }),
    })
  }

  async advancedImagesToPDF(fileIds, outputName, options = {}) {
    return this.request('/pdf/advanced/advanced-images-to-pdf', {
      method: 'POST',
      body: JSON.stringify({ fileIds, outputName, options }),
    })
  }

  async passwordProtectPDF(fileId, password, permissions = {}, outputName = 'protected.pdf') {
    return this.request('/pdf/advanced/password-protect', {
      method: 'POST',
      body: JSON.stringify({ fileId, password, permissions, outputName }),
    })
  }

  async createPDFForm(formFields, pageSize = 'A4', outputName = 'form.pdf', options = {}) {
    return this.request('/pdf/advanced/create-form', {
      method: 'POST',
      body: JSON.stringify({ formFields, pageSize, outputName, options }),
    })
  }

  async digitalSignPDF(fileId, signatureData, position = { x: 100, y: 100 }, outputName = 'signed.pdf') {
    return this.request('/pdf/advanced/digital-sign', {
      method: 'POST',
      body: JSON.stringify({ fileId, signatureData, position, outputName }),
    })
  }

  async annotatePDF(fileId, annotations = [], outputName = 'annotated.pdf') {
    return this.request('/pdf/advanced/annotate', {
      method: 'POST',
      body: JSON.stringify({ fileId, annotations, outputName }),
    })
  }

  async analyzePDF(fileId) {
    return this.request(`/pdf/advanced/analyze/${fileId}`)
  }

  // Admin endpoints
  async getUsers(page = 1, limit = 20, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    })
    
    return this.request(`/admin/users?${params}`)
  }

  async getUserDetails(userId) {
    return this.request(`/admin/users/${userId}`)
  }

  async updateUserRole(userId, role) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    })
  }

  async deleteUser(userId) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    })
  }

  async getAdminStats() {
    return this.request('/admin/stats')
  }

  async getAdminActivity(page = 1, limit = 50) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    
    return this.request(`/admin/activity?${params}`)
  }

  async getStorageUsage() {
    return this.request('/admin/storage')
  }

  // AI endpoints
  async performOCR(fileId, options = {}) {
    return this.request('/ai/ocr', {
      method: 'POST',
      body: JSON.stringify({ fileId, ...options }),
    })
  }

  async summarizeFile(fileId, summaryType = 'auto') {
    return this.request('/ai/summarize', {
      method: 'POST',
      body: JSON.stringify({ fileId, summaryType }),
    })
  }

  async createEmbeddings(fileId, options = {}) {
    return this.request('/ai/create-embeddings', {
      method: 'POST',
      body: JSON.stringify({ fileId, ...options }),
    })
  }

  async chatWithPDF(fileId, message, sessionId = null) {
    return this.request('/ai/chat-pdf', {
      method: 'POST',
      body: JSON.stringify({ fileId, message, sessionId }),
    })
  }

  async getChatSessions(fileId) {
    return this.request(`/ai/chat-sessions/${fileId}`)
  }

  async getChatMessages(sessionId) {
    return this.request(`/ai/chat-messages/${sessionId}`)
  }

  async getRecommendations(fileId) {
    return this.request(`/ai/recommendations/${fileId}`)
  }

  async getOCRResults(fileId) {
    return this.request(`/ai/ocr/${fileId}`)
  }

  async getSummaries(fileId) {
    return this.request(`/ai/summaries/${fileId}`)
  }

  // Translation endpoint
  async translateText(text, targetLanguage = 'en') {
    return this.request('/ai/translate', {
      method: 'POST',
      body: JSON.stringify({ text, targetLanguage }),
    })
  }

  // Batch processing endpoints
  async createBatchOperation(name, operations) {
    return this.request('/batch', {
      method: 'POST',
      body: JSON.stringify({ name, operations }),
    })
  }

  async getBatchOperation(batchId) {
    return this.request(`/batch/${batchId}`)
  }

  async getBatchOperations(page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    
    return this.request(`/batch?${params}`)
  }

  async cancelBatchOperation(batchId) {
    return this.request(`/batch/${batchId}`, {
      method: 'DELETE',
    })
  }

  async getBatchTemplates() {
    return this.request('/batch/templates/common')
  }

  async createBatchFromTemplate(templateId, name, fileIds, customOptions = {}) {
    return this.request('/batch/from-template', {
      method: 'POST',
      body: JSON.stringify({ templateId, name, fileIds, customOptions }),
    })
  }

  async getBatchProgress(batchId) {
    return this.request(`/batch/${batchId}/progress`)
  }

  // Folder endpoints
  async createFolder(name, parentId = null, color = '#3B82F6') {
    return this.request('/folders', {
      method: 'POST',
      body: JSON.stringify({ name, parent_id: parentId, color }),
    })
  }

  async getFolders(parentId = null, flat = false) {
    const params = new URLSearchParams()
    if (parentId) params.append('parent_id', parentId)
    if (flat) params.append('flat', 'true')
    
    return this.request(`/folders?${params}`)
  }

  async getFolder(folderId) {
    return this.request(`/folders/${folderId}`)
  }

  async updateFolder(folderId, updates) {
    return this.request(`/folders/${folderId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteFolder(folderId, force = false) {
    const params = force ? '?force=true' : ''
    return this.request(`/folders/${folderId}${params}`, {
      method: 'DELETE',
    })
  }

  async moveFiles(fileIds, folderId = null) {
    return this.request('/folders/move-files', {
      method: 'POST',
      body: JSON.stringify({ fileIds, folder_id: folderId }),
    })
  }

  async getFolderStats(folderId) {
    return this.request(`/folders/${folderId}/stats`)
  }

  // Generic GET/POST methods for flexibility
  async get(endpoint) {
    return this.request(endpoint)
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    })
  }
}

export const api = new ApiClient()