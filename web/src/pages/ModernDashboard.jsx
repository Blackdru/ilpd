import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { api } from '../lib/api'
import { formatFileSize, formatDate, getFileIcon } from '../lib/utils'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
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
  Clock,
  TrendingUp,
  Users,
  Star,
  Award,
  Target,
  Layers,
  BarChart3,
  PieChart,
  Calendar,
  Globe,
  Smartphone,
  Palette,
  Crown,
  Rocket,
  Heart,
  Shield,
  Settings,
  Plus,
  ArrowRight,
  ChevronRight,
  Wand2,
  Archive
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import FileUpload from '../components/FileUpload'
import FileManager from '../components/FileManager'
import BatchProcessor from '../components/BatchProcessor'
import AIAssistant from '../components/AIAssistant'
import UsageIndicator from '../components/subscription/UsageIndicator'
import toast from 'react-hot-toast'

const ModernDashboard = () => {
  const { user } = useAuth()
  const [files, setFiles] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showUpload, setShowUpload] = useState(false)
  const [showBatchProcessor, setShowBatchProcessor] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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

  const quickActions = [
    {
      title: 'Upload Files',
      description: 'Add new PDFs to process',
      icon: Upload,
      gradient: 'from-blue-500 to-cyan-500',
      action: () => setShowUpload(true)
    },
    {
      title: 'Merge PDFs',
      description: 'Combine multiple documents',
      icon: GitMerge,
      gradient: 'from-green-500 to-teal-500',
      action: () => window.location.href = '/tools'
    },
    {
      title: 'AI Assistant',
      description: 'Chat with your documents',
      icon: Bot,
      gradient: 'from-purple-500 to-pink-500',
      action: () => setActiveTab('ai')
    },
    {
      title: 'Batch Process',
      description: 'Automate workflows',
      icon: Zap,
      gradient: 'from-orange-500 to-red-500',
      action: () => setShowBatchProcessor(true)
    }
  ]

  const recentActivity = [
    { action: 'Merged 3 PDFs', time: '2 minutes ago', icon: GitMerge, color: 'text-green-600' },
    { action: 'OCR processed document.pdf', time: '5 minutes ago', icon: Eye, color: 'text-blue-600' },
    { action: 'Generated AI summary', time: '10 minutes ago', icon: Brain, color: 'text-purple-600' },
    { action: 'Compressed large-file.pdf', time: '15 minutes ago', icon: Archive, color: 'text-orange-600' },
  ]

  const filteredFiles = files.filter(file =>
    file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading && !files.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="gradient-text">Welcome back,</span>
                <br />
                <span className="text-gray-900">{user?.user_metadata?.name || user?.email?.split('@')[0]}</span>
              </h1>
              <p className="text-xl text-gray-600">
                Manage your PDF files with AI-powered professional tools
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button 
                variant="outline" 
                onClick={() => setShowBatchProcessor(true)}
                className="rounded-xl border-2 hover:bg-gray-50"
              >
                <Zap className="mr-2 h-4 w-4" />
                Batch Process
              </Button>
              <Button 
                onClick={() => setShowUpload(true)}
                className="btn-gradient"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative max-w-md"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search your files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl border-2 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
            />
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card className="file-card-modern border-0 shadow-modern">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Files</p>
                    <p className="text-3xl font-bold gradient-text">{stats.totalFiles}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.filesLimit - stats.totalFiles} remaining
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                    <Files className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="file-card-modern border-0 shadow-modern">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Storage Used</p>
                    <p className="text-3xl font-bold gradient-text">{formatFileSize(stats.totalStorage)}</p>
                    <div className="mt-2">
                      <Progress 
                        value={(stats.totalStorage / stats.storageLimit) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
                    <HardDrive className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="file-card-modern border-0 shadow-modern">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">AI Processed</p>
                    <p className="text-3xl font-bold gradient-text">
                      {files.filter(f => f.has_ocr || f.has_summary || f.has_embeddings).length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      files enhanced
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="file-card-modern border-0 shadow-modern">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">This Month</p>
                    <p className="text-3xl font-bold gradient-text">{stats.recentActivity}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      <p className="text-xs text-green-600">+12% from last month</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-14 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-modern">
            <TabsTrigger value="overview" className="tab-modern flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="files" className="tab-modern flex items-center space-x-2">
              <FolderOpen className="h-4 w-4" />
              <span>Files</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="tab-modern flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>AI Tools</span>
            </TabsTrigger>
            <TabsTrigger value="recent" className="tab-modern flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Activity</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="file-card-modern border-0 shadow-modern">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Rocket className="mr-2 h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Common tasks and workflows to get you started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                      <motion.div
                        key={action.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="cursor-pointer"
                        onClick={action.action}
                      >
                        <Card className="file-card-modern h-full border-0 shadow-modern hover:shadow-modern-lg">
                          <CardContent className="p-6 text-center">
                            <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${action.gradient} mb-4`}>
                              <action.icon className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                            <p className="text-sm text-gray-600">{action.description}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Usage Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <UsageIndicator />
            </motion.div>

            {/* Recent Files */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="file-card-modern border-0 shadow-modern">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Files className="mr-2 h-5 w-5" />
                        Recent Files
                      </CardTitle>
                      <CardDescription>
                        Your recently uploaded and processed files
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('files')}
                      className="rounded-xl"
                    >
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredFiles.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 mb-4">No files yet</p>
                      <Button 
                        onClick={() => setShowUpload(true)}
                        className="btn-gradient"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Your First File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredFiles.slice(0, 5).map((file, index) => (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50/80 transition-all duration-200 group"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl">{getFileIcon(file.type)}</div>
                            <div>
                              <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                {file.filename}
                              </p>
                              <div className="flex items-center space-x-3 mt-1">
                                <p className="text-sm text-gray-500">
                                  {formatFileSize(file.size)} • {formatDate(file.created_at)}
                                </p>
                                <div className="flex space-x-1">
                                  {file.has_ocr && (
                                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                      <Eye className="h-3 w-3 mr-1" />
                                      OCR
                                    </Badge>
                                  )}
                                  {file.has_summary && (
                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                      <Brain className="h-3 w-3 mr-1" />
                                      Summary
                                    </Badge>
                                  )}
                                  {file.has_embeddings && (
                                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                      <MessageSquare className="h-3 w-3 mr-1" />
                                      Chat
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenAIAssistant(file)}
                              className="rounded-xl"
                            >
                              <Bot className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="rounded-xl">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="dropdown-modern">
                                <DropdownMenuItem className="dropdown-item-modern">
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem className="dropdown-item-modern">
                                  <Eye className="mr-2 h-4 w-4" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="dropdown-item-modern text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </motion.div>
                      ))}
                      {filteredFiles.length > 5 && (
                        <Button 
                          variant="outline" 
                          className="w-full rounded-xl mt-4" 
                          onClick={() => setActiveTab('files')}
                        >
                          View All Files ({filteredFiles.length})
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="files">
            <FileManager onUpload={() => setShowUpload(true)} />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            {/* AI Features Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <Card className="file-card-modern border-0 shadow-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">Active</Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">OCR & Text Extraction</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Extract searchable text from scanned PDFs and images with industry-leading accuracy
                  </p>
                  <div className="text-2xl font-bold gradient-text mb-2">
                    {files.filter(f => f.has_ocr).length}
                  </div>
                  <p className="text-xs text-gray-500">files processed</p>
                </CardContent>
              </Card>

              <Card className="file-card-modern border-0 shadow-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">AI Summaries</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Generate intelligent summaries of your documents automatically
                  </p>
                  <div className="text-2xl font-bold gradient-text mb-2">
                    {files.filter(f => f.has_summary).length}
                  </div>
                  <p className="text-xs text-gray-500">summaries created</p>
                </CardContent>
              </Card>

              <Card className="file-card-modern border-0 shadow-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <Badge className="bg-purple-100 text-purple-700">Active</Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">PDF Chat</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Chat with your PDFs using AI-powered conversations
                  </p>
                  <div className="text-2xl font-bold gradient-text mb-2">
                    {files.filter(f => f.has_embeddings).length}
                  </div>
                  <p className="text-xs text-gray-500">chat-ready files</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI-Enhanced Files */}
            <Card className="file-card-modern border-0 shadow-modern">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wand2 className="mr-2 h-5 w-5" />
                  AI-Enhanced Files
                </CardTitle>
                <CardDescription>Files with AI features enabled</CardDescription>
              </CardHeader>
              <CardContent>
                {files.filter(f => f.has_ocr || f.has_summary || f.has_embeddings).length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Bot className="h-8 w-8 text-purple-500" />
                    </div>
                    <p className="text-gray-500 mb-4">No AI-processed files yet</p>
                    <p className="text-sm text-gray-400 mb-6">
                      Upload files and use AI features to enhance them
                    </p>
                    <Button 
                      onClick={() => setShowUpload(true)}
                      className="btn-gradient"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Files
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {files.filter(f => f.has_ocr || f.has_summary || f.has_embeddings).map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50/80 transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{getFileIcon(file.type)}</div>
                          <div>
                            <p className="font-medium text-gray-900">{file.filename}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              {file.has_ocr && (
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                  <Eye className="h-3 w-3 mr-1" />
                                  OCR
                                </Badge>
                              )}
                              {file.has_summary && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                  <Brain className="h-3 w-3 mr-1" />
                                  Summary
                                </Badge>
                              )}
                              {file.has_embeddings && (
                                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
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
                          className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Bot className="h-4 w-4 mr-2" />
                          AI Assistant
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent">
            <Card className="file-card-modern border-0 shadow-modern">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your recent file operations and AI processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50/80 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center ${activity.color}`}>
                        <activity.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </motion.div>
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
    </div>
  )
}

export default ModernDashboard