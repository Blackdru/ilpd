import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { formatFileSize, formatDate, getFileIcon } from '../lib/utils'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { 
  FileText, 
  Upload, 
  Search, 
  Filter,
  Download,
  Trash2,
  Eye,
  MoreHorizontal,
  HardDrive,
  Activity,
  Files,
  GitMerge,
  Bot,
  Brain,
  MessageSquare,
  Zap,
  FolderOpen,
  Sparkles,
  Clock
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs'
import FileUpload from '../components/FileUpload'
import FileManager from '../components/FileManager'
import BatchProcessor from '../components/BatchProcessor'
import AIAssistant from '../components/AIAssistant'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [files, setFiles] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showUpload, setShowUpload] = useState(false)
  const [showBatchProcessor, setShowBatchProcessor] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [filesResponse, statsResponse] = await Promise.all([
        api.getFiles(1, 50),
        api.getUserStats()
      ])
      
      setFiles(filesResponse.files)
      setStats(statsResponse.stats)
    } catch (error) {
      toast.error('Failed to load dashboard data')
      console.error('Dashboard load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = () => {
    setShowUpload(false)
    loadDashboardData()
  }

  const handleOpenAIAssistant = (file) => {
    setSelectedFile(file)
    setShowAIAssistant(true)
  }

  if (loading && !files.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.user_metadata?.name || user?.email}
          </h1>
          <p className="text-muted-foreground">
            Manage your PDF files with AI-powered tools
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={() => setShowBatchProcessor(true)}>
            <Zap className="mr-2 h-4 w-4" />
            Batch Process
          </Button>
          <Button onClick={() => setShowUpload(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <Files className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFiles}</div>
              <p className="text-xs text-muted-foreground">
                {stats.filesLimit - stats.totalFiles} remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatFileSize(stats.totalStorage)}</div>
              <p className="text-xs text-muted-foreground">
                of {formatFileSize(stats.storageLimit)} used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Processed</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {files.filter(f => f.has_ocr || f.has_summary || f.has_embeddings).length}
              </div>
              <p className="text-xs text-muted-foreground">
                files with AI features
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentActivity}</div>
              <p className="text-xs text-muted-foreground">
                operations this month
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center">
            <FolderOpen className="h-4 w-4 mr-2" />
            File Manager
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Features
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Recent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col" onClick={() => setShowUpload(true)}>
                  <Upload className="h-6 w-6 mb-2" />
                  Upload Files
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveTab('files')}>
                  <FolderOpen className="h-6 w-6 mb-2" />
                  Browse Files
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => setShowBatchProcessor(true)}>
                  <Zap className="h-6 w-6 mb-2" />
                  Batch Process
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveTab('ai')}>
                  <Bot className="h-6 w-6 mb-2" />
                  AI Tools
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Files */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Files</CardTitle>
              <CardDescription>Your recently uploaded and processed files</CardDescription>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">No files yet</p>
                  <Button size="sm" onClick={() => setShowUpload(true)}>
                    Upload Your First File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.slice(0, 5).map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <div className="text-xl">{getFileIcon(file.type)}</div>
                        <div>
                          <p className="font-medium text-sm">{file.filename}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • {formatDate(file.created_at)}
                            </p>
                            <div className="flex space-x-1">
                              {file.has_ocr && <Badge variant="secondary" className="text-xs">OCR</Badge>}
                              {file.has_summary && <Badge variant="secondary" className="text-xs">Summary</Badge>}
                              {file.has_embeddings && <Badge variant="secondary" className="text-xs">Chat</Badge>}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenAIAssistant(file)}
                      >
                        <Bot className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {files.length > 5 && (
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab('files')}>
                      View All Files ({files.length})
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <FileManager onUpload={() => setShowUpload(true)} />
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          {/* AI Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="mr-2 h-5 w-5" />
                  OCR & Text Extraction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Extract searchable text from scanned PDFs and images
                </p>
                <div className="text-2xl font-bold mb-2">
                  {files.filter(f => f.has_ocr).length}
                </div>
                <p className="text-xs text-muted-foreground">files processed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5" />
                  AI Summaries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate intelligent summaries of your documents
                </p>
                <div className="text-2xl font-bold mb-2">
                  {files.filter(f => f.has_summary).length}
                </div>
                <p className="text-xs text-muted-foreground">summaries created</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  PDF Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Chat with your PDFs using AI-powered conversations
                </p>
                <div className="text-2xl font-bold mb-2">
                  {files.filter(f => f.has_embeddings).length}
                </div>
                <p className="text-xs text-muted-foreground">chat-ready files</p>
              </CardContent>
            </Card>
          </div>

          {/* AI-Processed Files */}
          <Card>
            <CardHeader>
              <CardTitle>AI-Enhanced Files</CardTitle>
              <CardDescription>Files with AI features enabled</CardDescription>
            </CardHeader>
            <CardContent>
              {files.filter(f => f.has_ocr || f.has_summary || f.has_embeddings).length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">No AI-processed files yet</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Upload files and use AI features to enhance them
                  </p>
                  <Button size="sm" onClick={() => setShowUpload(true)}>
                    Upload Files
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.filter(f => f.has_ocr || f.has_summary || f.has_embeddings).map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <div className="text-xl">{getFileIcon(file.type)}</div>
                        <div>
                          <p className="font-medium text-sm">{file.filename}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {file.has_ocr && (
                              <Badge variant="secondary" className="text-xs">
                                <Eye className="h-3 w-3 mr-1" />
                                OCR
                              </Badge>
                            )}
                            {file.has_summary && (
                              <Badge variant="secondary" className="text-xs">
                                <Brain className="h-3 w-3 mr-1" />
                                Summary
                              </Badge>
                            )}
                            {file.has_embeddings && (
                              <Badge variant="secondary" className="text-xs">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Chat
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAIAssistant(file)}
                      >
                        <Bot className="h-4 w-4 mr-2" />
                        AI Assistant
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent file operations and AI processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {files.slice(0, 10).map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">{getFileIcon(file.type)}</div>
                      <div>
                        <p className="font-medium text-sm">{file.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(file.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {file.has_ocr && <Eye className="h-4 w-4 text-green-500" />}
                      {file.has_summary && <Brain className="h-4 w-4 text-blue-500" />}
                      {file.has_embeddings && <MessageSquare className="h-4 w-4 text-purple-500" />}
                    </div>
                  </div>
                ))}
              </div>
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

      {/* Batch Processor */}
      {showBatchProcessor && (
        <BatchProcessor
          files={files}
          onClose={() => setShowBatchProcessor(false)}
        />
      )}

      {/* AI Assistant */}
      {showAIAssistant && selectedFile && (
        <AIAssistant
          file={selectedFile}
          isOpen={showAIAssistant}
          onClose={() => {
            setShowAIAssistant(false)
            setSelectedFile(null)
          }}
        />
      )}
    </div>
  )
}

export default Dashboard