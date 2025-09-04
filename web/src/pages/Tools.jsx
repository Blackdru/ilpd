import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { formatFileSize, getFileIcon, downloadBlob } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { 
  GitMerge, 
  Scissors, 
  Archive, 
  Image,
  Upload,
  Download,
  Trash2,
  Plus,
  Settings,
  Eye,
  Brain,
  MessageSquare,
  Sparkles,
  FileText,
  Loader2
} from 'lucide-react'
import FileUpload from '../components/FileUpload'
import toast from 'react-hot-toast'

const Tools = () => {
  const { user, session } = useAuth()
  const [files, setFiles] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [activeTab, setActiveTab] = useState('merge')
  const [ocrResults, setOcrResults] = useState({})
  const [chatSessions, setChatSessions] = useState({})
  const [chatMessages, setChatMessages] = useState({})
  const [currentMessage, setCurrentMessage] = useState('')

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const response = await api.getFiles(1, 50)
      setFiles(response.files)
    } catch (error) {
      toast.error('Failed to load files')
    }
  }

  const handleFileSelect = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const handleMergePDFs = async () => {
    if (selectedFiles.length < 2) {
      toast.error('Please select at least 2 PDF files to merge')
      return
    }

    const pdfFiles = files.filter(f => 
      selectedFiles.includes(f.id) && f.type === 'application/pdf'
    )

    if (pdfFiles.length !== selectedFiles.length) {
      toast.error('All selected files must be PDFs')
      return
    }

    setLoading(true)
    try {
      const response = await api.mergePDFs(selectedFiles, 'merged-document.pdf')
      toast.success('PDFs merged successfully!')
      
      // Download the merged file
      const blob = await api.downloadFile(response.file.id)
      downloadBlob(blob, response.file.filename)
      
      setSelectedFiles([])
      loadFiles()
    } catch (error) {
      toast.error('Failed to merge PDFs: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSplitPDF = async (fileId, pages = null) => {
    setLoading(true)
    try {
      // Direct download of zip file
      const token = localStorage.getItem('supabase.auth.token')
      const url = `${import.meta.env.VITE_API_URL}/pdf/split`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileId, pages, outputName: 'split-document.pdf' })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Split failed')
      }

      const blob = await response.blob()
      const filename = response.headers.get('content-disposition')?.split('filename="')[1]?.split('"')[0] || 'split-files.zip'
      
      downloadBlob(blob, filename)
      toast.success('PDF split successfully! Zip file downloaded.')
      
      loadFiles()
    } catch (error) {
      toast.error('Failed to split PDF: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCompressPDF = async (fileId) => {
    setLoading(true)
    try {
      const response = await api.compressPDF(fileId, 0.7, 'compressed-document.pdf')
      toast.success(`PDF compressed! Saved ${response.compressionRatio}`)
      
      const blob = await api.downloadFile(response.file.id)
      downloadBlob(blob, response.file.filename)
      
      loadFiles()
    } catch (error) {
      toast.error('Failed to compress PDF: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleConvertToPDF = async () => {
    const imageFiles = files.filter(f => 
      selectedFiles.includes(f.id) && f.type.startsWith('image/')
    )

    if (imageFiles.length === 0) {
      toast.error('Please select at least one image file')
      return
    }

    setLoading(true)
    try {
      const response = await api.convertImagesToPDF(selectedFiles, 'converted-images.pdf')
      toast.success('Images converted to PDF successfully!')
      
      const blob = await api.downloadFile(response.file.id)
      downloadBlob(blob, response.file.filename)
      
      setSelectedFiles([])
      loadFiles()
    } catch (error) {
      toast.error('Failed to convert images: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOCR = async (fileId) => {
    setLoading(true)
    try {
      // Check if user is authenticated
      if (!user || !session) {
        toast.error('Please sign in to use OCR features')
        return
      }

      toast('Starting OCR processing...', {
        icon: '🔍',
        duration: 2000
      })
      
      // Perform real OCR
      const response = await api.performOCR(fileId, {
        language: 'eng',
        enhanceImage: true
      })

      setOcrResults(prev => ({
        ...prev,
        [fileId]: {
          text: response.result.text,
          confidence: response.result.confidence,
          pageCount: response.result.pageCount,
          language: response.result.language,
          pages: response.result.pages,
          isLimited: false // Real OCR, not limited
        }
      }))
      
      toast.success(`OCR completed! Extracted text from ${response.result.pageCount} page(s) with ${Math.round(response.result.confidence * 100)}% confidence.`)
      loadFiles() // Refresh to show updated file status
    } catch (error) {
      console.error('OCR Error:', error)
      toast.error('OCR failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStartChat = async (fileId) => {
    setLoading(true)
    try {
      // Check if user is authenticated
      if (!user || !session) {
        toast.error('Please sign in to use AI chat features')
        return
      }

      // Check if file has OCR text first
      const file = files.find(f => f.id === fileId)
      if (!file?.has_ocr && !file?.extracted_text) {
        toast.error('Please run OCR on this file first to enable chat')
        return
      }

      // Create a new chat session
      const sessionId = `session-${fileId}-${Date.now()}`
      
      setChatSessions(prev => ({
        ...prev,
        [fileId]: sessionId
      }))
      
      setChatMessages(prev => ({
        ...prev,
        [sessionId]: [{
          role: 'assistant',
          content: `Hello! I'm ready to help you with questions about "${file.filename}". I can analyze the document content and provide insights. What would you like to know?`
        }]
      }))
      
      toast.success('AI chat started! Ask me anything about this document.')
    } catch (error) {
      console.error('Chat Error:', error)
      toast.error('Failed to start chat: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (fileId, sessionId) => {
    if (!currentMessage.trim()) return
    
    const message = currentMessage
    setCurrentMessage('')
    
    // Add user message to chat immediately
    setChatMessages(prev => ({
      ...prev,
      [sessionId]: [...(prev[sessionId] || []), { role: 'user', content: message }]
    }))
    
    try {
      // Send message to AI API
      const response = await api.chatWithPDF(fileId, message, sessionId)
      
      // Add AI response to chat
      setChatMessages(prev => ({
        ...prev,
        [sessionId]: [...prev[sessionId], { role: 'assistant', content: response.response }]
      }))
      
    } catch (error) {
      console.error('Chat API Error:', error)
      
      // Add error message to chat
      setChatMessages(prev => ({
        ...prev,
        [sessionId]: [...prev[sessionId], { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error processing your message. Please try again.' 
        }]
      }))
      
      toast.error('Failed to send message: ' + error.message)
    }
  }

  const handleUploadSuccess = () => {
    setShowUpload(false)
    loadFiles()
  }

  const pdfFiles = files.filter(f => f.type === 'application/pdf')
  const imageFiles = files.filter(f => f.type.startsWith('image/'))

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 gradient-text">PDF Tools</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Merge, split, compress, and convert your PDF files
          </p>
        </div>
        <Button 
          onClick={() => setShowUpload(true)} 
          className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Files
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-0 h-auto sm:h-10 p-1">
          <TabsTrigger value="merge" className="flex-col sm:flex-row h-12 sm:h-auto text-xs sm:text-sm">
            <GitMerge className="h-4 w-4 mb-1 sm:mb-0 sm:mr-2" />
            <span className="hidden sm:inline">Merge</span>
            <span className="sm:hidden">Merge</span>
          </TabsTrigger>
          <TabsTrigger value="split" className="flex-col sm:flex-row h-12 sm:h-auto text-xs sm:text-sm">
            <Scissors className="h-4 w-4 mb-1 sm:mb-0 sm:mr-2" />
            <span className="hidden sm:inline">Split</span>
            <span className="sm:hidden">Split</span>
          </TabsTrigger>
          <TabsTrigger value="compress" className="flex-col sm:flex-row h-12 sm:h-auto text-xs sm:text-sm">
            <Archive className="h-4 w-4 mb-1 sm:mb-0 sm:mr-2" />
            <span className="hidden sm:inline">Compress</span>
            <span className="sm:hidden">Compress</span>
          </TabsTrigger>
          <TabsTrigger value="convert" className="flex-col sm:flex-row h-12 sm:h-auto text-xs sm:text-sm">
            <Image className="h-4 w-4 mb-1 sm:mb-0 sm:mr-2" />
            <span className="hidden sm:inline">Convert</span>
            <span className="sm:hidden">Convert</span>
          </TabsTrigger>
          <TabsTrigger value="ocr" className="flex-col sm:flex-row h-12 sm:h-auto text-xs sm:text-sm">
            <Eye className="h-4 w-4 mb-1 sm:mb-0 sm:mr-2" />
            <span className="hidden sm:inline">OCR</span>
            <span className="sm:hidden">OCR</span>
          </TabsTrigger>
          <TabsTrigger value="ai-chat" className="flex-col sm:flex-row h-12 sm:h-auto text-xs sm:text-sm">
            <MessageSquare className="h-4 w-4 mb-1 sm:mb-0 sm:mr-2" />
            <span className="hidden sm:inline">AI Chat</span>
            <span className="sm:hidden">Chat</span>
          </TabsTrigger>
        </TabsList>

        {/* Merge PDFs */}
        <TabsContent value="merge">
          <Card>
            <CardHeader>
              <CardTitle>Merge PDFs</CardTitle>
              <CardDescription>
                Select multiple PDF files to combine them into one document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {selectedFiles.length} files selected
                </p>
                <Button
                  onClick={handleMergePDFs}
                  disabled={selectedFiles.length < 2 || loading}
                >
                  {loading ? 'Merging...' : 'Merge PDFs'}
                </Button>
              </div>
              
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {pdfFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedFiles.includes(file.id) 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleFileSelect(file.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => handleFileSelect(file.id)}
                      className="rounded"
                    />
                    <div className="text-2xl">{getFileIcon(file.type)}</div>
                    <div className="flex-1">
                      <p className="font-medium">{file.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {pdfFiles.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No PDF files found</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUpload(true)}
                    className="mt-2"
                  >
                    Upload PDF Files
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Split PDFs */}
        <TabsContent value="split">
          <Card>
            <CardHeader>
              <CardTitle>Split PDFs</CardTitle>
              <CardDescription>
                Split PDF files into separate pages or extract specific pages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {pdfFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getFileIcon(file.type)}</div>
                      <div>
                        <p className="font-medium">{file.filename}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleSplitPDF(file.id)}
                      disabled={loading}
                      size="sm"
                    >
                      {loading ? 'Splitting...' : 'Split All Pages'}
                    </Button>
                  </div>
                ))}
              </div>
              
              {pdfFiles.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No PDF files found</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUpload(true)}
                    className="mt-2"
                  >
                    Upload PDF Files
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compress PDFs */}
        <TabsContent value="compress">
          <Card>
            <CardHeader>
              <CardTitle>Compress PDFs</CardTitle>
              <CardDescription>
                Reduce PDF file size while maintaining quality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {pdfFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getFileIcon(file.type)}</div>
                      <div>
                        <p className="font-medium">{file.filename}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCompressPDF(file.id)}
                      disabled={loading}
                      size="sm"
                    >
                      {loading ? 'Compressing...' : 'Compress'}
                    </Button>
                  </div>
                ))}
              </div>
              
              {pdfFiles.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No PDF files found</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUpload(true)}
                    className="mt-2"
                  >
                    Upload PDF Files
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Convert to PDF */}
        <TabsContent value="convert">
          <Card>
            <CardHeader>
              <CardTitle>Convert to PDF</CardTitle>
              <CardDescription>
                Convert images to PDF format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {selectedFiles.length} images selected
                </p>
                <Button
                  onClick={handleConvertToPDF}
                  disabled={selectedFiles.length === 0 || loading}
                >
                  {loading ? 'Converting...' : 'Convert to PDF'}
                </Button>
              </div>
              
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {imageFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedFiles.includes(file.id) 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleFileSelect(file.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => handleFileSelect(file.id)}
                      className="rounded"
                    />
                    <div className="text-2xl">{getFileIcon(file.type)}</div>
                    <div className="flex-1">
                      <p className="font-medium">{file.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {imageFiles.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No image files found</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUpload(true)}
                    className="mt-2"
                  >
                    Upload Image Files
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* OCR - Extract Text */}
        <TabsContent value="ocr">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="mr-2 h-5 w-5" />
                OCR - Extract Text
                <Badge variant="secondary" className="ml-2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
              </CardTitle>
              <CardDescription>
                Extract text from scanned PDFs and images using advanced OCR technology
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {pdfFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getFileIcon(file.type)}</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{file.filename}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                        {file.has_ocr && (
                          <Badge variant="secondary" className="mt-1 bg-green-100 text-green-700">
                            <Eye className="h-3 w-3 mr-1" />
                            Text Extracted
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {ocrResults[file.id] && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(ocrResults[file.id].text)
                            toast.success('Text copied to clipboard!')
                          }}
                        >
                          Copy Text
                        </Button>
                      )}
                      <Button
                        onClick={() => handleOCR(file.id)}
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Extract Text
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* OCR Results Display */}
              {Object.keys(ocrResults).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Extracted Text</h3>
                  {Object.entries(ocrResults).map(([fileId, result]) => {
                    const file = files.find(f => f.id === fileId)
                    return (
                      <Card key={fileId} className="mb-4">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium">
                            {file?.filename}
                          </CardTitle>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>Confidence: {Math.round(result.confidence * 100)}%</span>
                            <span>•</span>
                            <span>Pages: {result.pageCount}</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Textarea
                            value={result.text}
                            readOnly
                            className="min-h-32 text-sm"
                            placeholder="Extracted text will appear here..."
                          />
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
              
              {pdfFiles.length === 0 && (
                <div className="text-center py-12">
                  <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">No PDF files found</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUpload(true)}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload PDF Files
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Chat */}
        <TabsContent value="ai-chat">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                AI Chat with PDFs
                <Badge variant="secondary" className="ml-2">
                  <Brain className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
              </CardTitle>
              <CardDescription>
                Chat with your PDF documents using advanced AI. Ask questions and get intelligent answers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 max-h-64 overflow-y-auto">
                {pdfFiles.map((file) => {
                  const sessionId = chatSessions[file.id]
                  const messages = sessionId ? chatMessages[sessionId] : []
                  
                  return (
                    <div
                      key={file.id}
                      className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getFileIcon(file.type)}</div>
                          <div>
                            <p className="font-medium text-gray-900">{file.filename}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                            {file.has_embeddings && (
                              <Badge variant="secondary" className="mt-1 bg-purple-100 text-purple-700">
                                <Brain className="h-3 w-3 mr-1" />
                                Chat Ready
                              </Badge>
                            )}
                          </div>
                        </div>
                        {!sessionId ? (
                          <Button
                            onClick={() => handleStartChat(file.id)}
                            disabled={loading}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Starting...
                              </>
                            ) : (
                              <>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Start Chat
                              </>
                            )}
                          </Button>
                        ) : (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Active Chat
                          </Badge>
                        )}
                      </div>
                      
                      {/* Chat Messages */}
                      {sessionId && messages.length > 0 && (
                        <div className="space-y-3 mb-4">
                          <div className="max-h-48 overflow-y-auto space-y-2 bg-gray-50 rounded-lg p-3">
                            {messages.map((message, index) => (
                              <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                                    message.role === 'user'
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-white border text-gray-800'
                                  }`}
                                >
                                  {message.content}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Message Input */}
                          <div className="flex space-x-2">
                            <Input
                              value={currentMessage}
                              onChange={(e) => setCurrentMessage(e.target.value)}
                              placeholder="Ask a question about this document..."
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleSendMessage(file.id, sessionId)
                                }
                              }}
                              className="flex-1"
                            />
                            <Button
                              onClick={() => handleSendMessage(file.id, sessionId)}
                              disabled={!currentMessage.trim()}
                              size="sm"
                            >
                              Send
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              
              {pdfFiles.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">No PDF files found</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUpload(true)}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload PDF Files
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Modal */}
      {showUpload && (
        <FileUpload
          onClose={() => setShowUpload(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  )
}

export default Tools