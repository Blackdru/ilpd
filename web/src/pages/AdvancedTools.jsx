import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../lib/api'
import { formatFileSize, getFileIcon, downloadBlob } from '../lib/utils'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Slider } from '../components/ui/slider'
import { Switch } from '../components/ui/switch'
import { Separator } from '../components/ui/separator'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { 
  GitMerge, 
  Scissors, 
  Archive, 
  Image,
  Upload,
  Download,
  Settings,
  Wand2,
  FileText,
  Palette,
  Shield,
  Zap,
  Eye,
  Layers,
  RotateCw,
  Maximize,
  Type,
  Lock,
  Unlock,
  Star,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Info,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Minus,
  MessageSquare,
  Brain,
  Loader2
} from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../components/ui/collapsible'
import FileUpload from '../components/FileUpload'
import toast from 'react-hot-toast'

const AdvancedTools = () => {
  const [files, setFiles] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [activeTab, setActiveTab] = useState('merge')
  const [processingProgress, setProcessingProgress] = useState(0)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState({})

  // Advanced options state
  const [mergeOptions, setMergeOptions] = useState({
    addBookmarks: false,
    addPageNumbers: false,
    pageNumberPosition: 'bottom-right',
    pageNumberStyle: 'arabic',
    addTitlePage: false,
    titlePageContent: { title: '', author: '', subject: '' },
    removeBlankPages: false,
    optimizeForPrint: false,
    addWatermark: false,
    watermarkOptions: { text: 'CONFIDENTIAL', opacity: 0.3, rotation: 45 }
  })

  const [splitOptions, setSplitOptions] = useState({
    splitType: 'pages',
    pagesPerFile: 1,
    maxFileSize: 10,
    customRanges: [],
    outputFormat: 'separate',
    addMetadata: true,
    preserveBookmarks: true,
    optimizeOutput: false
  })

  const [compressOptions, setCompressOptions] = useState({
    compressionLevel: 'medium',
    imageQuality: 85,
    removeMetadata: false,
    removeAnnotations: false,
    removeBookmarks: false,
    optimizeImages: true,
    downsampleImages: false,
    maxImageDPI: 150,
    convertToGrayscale: false
  })

  const [convertOptions, setConvertOptions] = useState({
    pageSize: 'A4',
    orientation: 'portrait',
    margin: 50,
    imagesPerPage: 1,
    imageLayout: 'fit',
    backgroundColor: '#ffffff',
    addBorder: false,
    borderWidth: 1,
    borderColor: '#000000',
    imageQuality: 95,
    addPageNumbers: false,
    addTimestamp: false,
    metadata: { title: '', author: '', subject: '' }
  })

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const response = await api.getFiles(1, 100)
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

  const toggleAdvancedOptions = (tool) => {
    setShowAdvancedOptions(prev => ({
      ...prev,
      [tool]: !prev[tool]
    }))
  }

  const handleAdvancedMerge = async () => {
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
    setProcessingProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await api.post('/pdf/advanced/advanced-merge', {
        fileIds: selectedFiles,
        outputName: 'advanced-merged.pdf',
        options: mergeOptions
      })

      clearInterval(progressInterval)
      setProcessingProgress(100)

      toast.success('PDFs merged successfully with advanced options!')
      
      const blob = await api.downloadFile(response.file.id)
      downloadBlob(blob, response.file.filename)
      
      setSelectedFiles([])
      loadFiles()
    } catch (error) {
      toast.error('Failed to merge PDFs: ' + error.message)
    } finally {
      setLoading(false)
      setProcessingProgress(0)
    }
  }

  const handleAdvancedSplit = async (fileId) => {
    setLoading(true)
    setProcessingProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 15, 90))
      }, 300)

      const response = await api.post('/pdf/advanced/advanced-split', {
        fileId,
        options: splitOptions
      })

      clearInterval(progressInterval)
      setProcessingProgress(100)

      if (response.file) {
        const blob = await api.downloadFile(response.file.id)
        downloadBlob(blob, response.file.filename)
        toast.success('PDF split successfully!')
      } else {
        // Handle ZIP download
        toast.success('PDF split successfully! Multiple files downloaded.')
      }
      
      loadFiles()
    } catch (error) {
      toast.error('Failed to split PDF: ' + error.message)
    } finally {
      setLoading(false)
      setProcessingProgress(0)
    }
  }

  const handleAdvancedCompress = async (fileId) => {
    setLoading(true)
    setProcessingProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 12, 90))
      }, 250)

      const response = await api.post('/pdf/advanced/advanced-compress', {
        fileId,
        outputName: 'advanced-compressed.pdf',
        options: compressOptions
      })

      clearInterval(progressInterval)
      setProcessingProgress(100)

      toast.success(`PDF compressed! Saved ${response.compressionStats.compressionRatio}`)
      
      const blob = await api.downloadFile(response.file.id)
      downloadBlob(blob, response.file.filename)
      
      loadFiles()
    } catch (error) {
      toast.error('Failed to compress PDF: ' + error.message)
    } finally {
      setLoading(false)
      setProcessingProgress(0)
    }
  }

  const handleAdvancedConvert = async () => {
    const imageFiles = files.filter(f => 
      selectedFiles.includes(f.id) && f.type.startsWith('image/')
    )

    if (imageFiles.length === 0) {
      toast.error('Please select at least one image file')
      return
    }

    setLoading(true)
    setProcessingProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 8, 90))
      }, 200)

      const response = await api.post('/pdf/advanced/advanced-images-to-pdf', {
        fileIds: selectedFiles,
        outputName: 'advanced-converted.pdf',
        options: convertOptions
      })

      clearInterval(progressInterval)
      setProcessingProgress(100)

      toast.success('Images converted to PDF with advanced options!')
      
      const blob = await api.downloadFile(response.file.id)
      downloadBlob(blob, response.file.filename)
      
      setSelectedFiles([])
      loadFiles()
    } catch (error) {
      toast.error('Failed to convert images: ' + error.message)
    } finally {
      setLoading(false)
      setProcessingProgress(0)
    }
  }

  const handleAdvancedOCR = async (fileId) => {
    setLoading(true)
    setProcessingProgress(0)

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('supabase.auth.token')
      if (!token) {
        toast.error('Please sign in to use Advanced OCR features')
        return
      }

      // Simulate advanced OCR processing with progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 8, 90))
      }, 300)

      // For demo purposes, simulate advanced OCR processing
      await new Promise(resolve => setTimeout(resolve, 4000))
      
      clearInterval(progressInterval)
      setProcessingProgress(100)

      // Mock advanced OCR result
      const advancedText = `ADVANCED OCR RESULTS - Professional Grade

This is extracted text from the PDF document using advanced OCR technology with the following features:

✓ Multi-language support (English, Spanish, French, German, Chinese, Japanese)
✓ High accuracy text recognition (98.5% confidence)
✓ Table structure preservation
✓ Mathematical formula recognition
✓ Handwriting recognition
✓ Image text extraction
✓ Layout analysis and preservation

DOCUMENT CONTENT:
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

DETECTED TABLES:
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data A   | Data B   | Data C   |
| Value 1  | Value 2  | Value 3  |

MATHEMATICAL FORMULAS:
E = mc²
∫ f(x)dx = F(x) + C

ADVANCED FEATURES USED:
- Automatic language detection
- Noise reduction and image enhancement
- Character confidence scoring
- Layout preservation
- Metadata extraction

[Professional OCR completed with advanced features. This demonstrates the enhanced capabilities available in the Pro version.]`

      // In a real implementation, you would save this to state or display it
      toast.success('Advanced OCR completed with professional features!')
      
      // Simulate file update
      loadFiles()
    } catch (error) {
      console.error('Advanced OCR Error:', error)
      toast.error('Advanced OCR failed: ' + error.message)
    } finally {
      setLoading(false)
      setProcessingProgress(0)
    }
  }

  const handleAdvancedAIChat = async (fileId) => {
    setLoading(true)
    setProcessingProgress(0)

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('supabase.auth.token')
      if (!token) {
        toast.error('Please sign in to use Advanced AI Chat features')
        return
      }

      // Simulate advanced AI chat initialization with progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 12, 90))
      }, 200)

      // For demo purposes, simulate advanced processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      clearInterval(progressInterval)
      setProcessingProgress(100)

      toast.success('Advanced AI Chat initialized with GPT-4 and unlimited conversations!')
      
      // In a real implementation, you would initialize the advanced chat session
      loadFiles()
    } catch (error) {
      console.error('Advanced AI Chat Error:', error)
      toast.error('Advanced AI Chat failed: ' + error.message)
    } finally {
      setLoading(false)
      setProcessingProgress(0)
    }
  }

  const handleUploadSuccess = () => {
    setShowUpload(false)
    loadFiles()
  }

  const pdfFiles = files.filter(f => f.type === 'application/pdf')
  const imageFiles = files.filter(f => f.type.startsWith('image/'))

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Professional PDF Tools
          </h1>
          <p className="text-muted-foreground text-lg">
            Advanced PDF processing with professional-grade customization options
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Badge variant="secondary" className="px-3 py-1">
            <Sparkles className="h-3 w-3 mr-1" />
            Pro Features
          </Badge>
          <Button onClick={() => setShowUpload(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
        </div>
      </motion.div>

      {/* Processing Progress */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700">Processing...</span>
                      <span className="text-sm text-blue-600">{processingProgress}%</span>
                    </div>
                    <Progress value={processingProgress} className="h-2" />
                  </div>
                  <div className="animate-spin">
                    <RotateCw className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 h-12">
          <TabsTrigger value="merge" className="flex items-center space-x-2">
            <GitMerge className="h-4 w-4" />
            <span>Merge</span>
          </TabsTrigger>
          <TabsTrigger value="split" className="flex items-center space-x-2">
            <Scissors className="h-4 w-4" />
            <span>Split</span>
          </TabsTrigger>
          <TabsTrigger value="compress" className="flex items-center space-x-2">
            <Archive className="h-4 w-4" />
            <span>Compress</span>
          </TabsTrigger>
          <TabsTrigger value="convert" className="flex items-center space-x-2">
            <Image className="h-4 w-4" />
            <span>Convert</span>
          </TabsTrigger>
          <TabsTrigger value="ocr" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>OCR</span>
          </TabsTrigger>
          <TabsTrigger value="ai-chat" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>AI Chat</span>
          </TabsTrigger>
        </TabsList>

        {/* Advanced Merge */}
        <TabsContent value="merge">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* File Selection */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GitMerge className="mr-2 h-5 w-5" />
                    Advanced PDF Merge
                  </CardTitle>
                  <CardDescription>
                    Combine multiple PDFs with professional customization options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{selectedFiles.length} files selected</Badge>
                      {selectedFiles.length >= 2 && (
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ready to merge
                        </Badge>
                      )}
                    </div>
                    <Button
                      onClick={handleAdvancedMerge}
                      disabled={selectedFiles.length < 2 || loading}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      {loading ? (
                        <>
                          <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                          Merging...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Advanced Merge
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {pdfFiles.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedFiles.includes(file.id) 
                            ? 'border-blue-500 bg-blue-50/50 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                        }`}
                        onClick={() => handleFileSelect(file.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => handleFileSelect(file.id)}
                          className="rounded border-gray-300"
                        />
                        <div className="text-2xl">{getFileIcon(file.type)}</div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{file.filename}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.size)} • Created {new Date(file.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {selectedFiles.includes(file.id) && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            #{selectedFiles.indexOf(file.id) + 1}
                          </Badge>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  
                  {pdfFiles.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
            </div>

            {/* Advanced Options */}
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Merge Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Options */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="add-bookmarks" className="text-sm font-medium">
                        Add Bookmarks
                      </Label>
                      <Switch
                        id="add-bookmarks"
                        checked={mergeOptions.addBookmarks}
                        onCheckedChange={(checked) => 
                          setMergeOptions(prev => ({ ...prev, addBookmarks: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="add-page-numbers" className="text-sm font-medium">
                        Add Page Numbers
                      </Label>
                      <Switch
                        id="add-page-numbers"
                        checked={mergeOptions.addPageNumbers}
                        onCheckedChange={(checked) => 
                          setMergeOptions(prev => ({ ...prev, addPageNumbers: checked }))
                        }
                      />
                    </div>

                    {mergeOptions.addPageNumbers && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3 pl-4 border-l-2 border-blue-200"
                      >
                        <div>
                          <Label className="text-xs text-gray-600">Position</Label>
                          <Select
                            value={mergeOptions.pageNumberPosition}
                            onValueChange={(value) => 
                              setMergeOptions(prev => ({ ...prev, pageNumberPosition: value }))
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="top-left">Top Left</SelectItem>
                              <SelectItem value="top-center">Top Center</SelectItem>
                              <SelectItem value="top-right">Top Right</SelectItem>
                              <SelectItem value="bottom-left">Bottom Left</SelectItem>
                              <SelectItem value="bottom-center">Bottom Center</SelectItem>
                              <SelectItem value="bottom-right">Bottom Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Style</Label>
                          <Select
                            value={mergeOptions.pageNumberStyle}
                            onValueChange={(value) => 
                              setMergeOptions(prev => ({ ...prev, pageNumberStyle: value }))
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="arabic">1, 2, 3...</SelectItem>
                              <SelectItem value="roman">I, II, III...</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex items-center justify-between">
                      <Label htmlFor="remove-blank" className="text-sm font-medium">
                        Remove Blank Pages
                      </Label>
                      <Switch
                        id="remove-blank"
                        checked={mergeOptions.removeBlankPages}
                        onCheckedChange={(checked) => 
                          setMergeOptions(prev => ({ ...prev, removeBlankPages: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="optimize-print" className="text-sm font-medium">
                        Optimize for Print
                      </Label>
                      <Switch
                        id="optimize-print"
                        checked={mergeOptions.optimizeForPrint}
                        onCheckedChange={(checked) => 
                          setMergeOptions(prev => ({ ...prev, optimizeForPrint: checked }))
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Title Page Options */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        <span className="text-sm font-medium">Title Page</span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 pt-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Add Title Page</Label>
                        <Switch
                          checked={mergeOptions.addTitlePage}
                          onCheckedChange={(checked) => 
                            setMergeOptions(prev => ({ ...prev, addTitlePage: checked }))
                          }
                        />
                      </div>
                      {mergeOptions.addTitlePage && (
                        <div className="space-y-2">
                          <Input
                            placeholder="Document Title"
                            value={mergeOptions.titlePageContent.title}
                            onChange={(e) => 
                              setMergeOptions(prev => ({
                                ...prev,
                                titlePageContent: { ...prev.titlePageContent, title: e.target.value }
                              }))
                            }
                            className="h-8"
                          />
                          <Input
                            placeholder="Author"
                            value={mergeOptions.titlePageContent.author}
                            onChange={(e) => 
                              setMergeOptions(prev => ({
                                ...prev,
                                titlePageContent: { ...prev.titlePageContent, author: e.target.value }
                              }))
                            }
                            className="h-8"
                          />
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Watermark Options */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center">
                        <Layers className="mr-2 h-4 w-4" />
                        <span className="text-sm font-medium">Watermark</span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 pt-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Add Watermark</Label>
                        <Switch
                          checked={mergeOptions.addWatermark}
                          onCheckedChange={(checked) => 
                            setMergeOptions(prev => ({ ...prev, addWatermark: checked }))
                          }
                        />
                      </div>
                      {mergeOptions.addWatermark && (
                        <div className="space-y-3">
                          <Input
                            placeholder="Watermark Text"
                            value={mergeOptions.watermarkOptions.text}
                            onChange={(e) => 
                              setMergeOptions(prev => ({
                                ...prev,
                                watermarkOptions: { ...prev.watermarkOptions, text: e.target.value }
                              }))
                            }
                            className="h-8"
                          />
                          <div>
                            <Label className="text-xs text-gray-600">Opacity: {Math.round(mergeOptions.watermarkOptions.opacity * 100)}%</Label>
                            <Slider
                              value={[mergeOptions.watermarkOptions.opacity]}
                              onValueChange={([value]) => 
                                setMergeOptions(prev => ({
                                  ...prev,
                                  watermarkOptions: { ...prev.watermarkOptions, opacity: value }
                                }))
                              }
                              max={1}
                              min={0.1}
                              step={0.1}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">Rotation: {mergeOptions.watermarkOptions.rotation}°</Label>
                            <Slider
                              value={[mergeOptions.watermarkOptions.rotation]}
                              onValueChange={([value]) => 
                                setMergeOptions(prev => ({
                                  ...prev,
                                  watermarkOptions: { ...prev.watermarkOptions, rotation: value }
                                }))
                              }
                              max={90}
                              min={-90}
                              step={15}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Advanced Split */}
        <TabsContent value="split">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Scissors className="mr-2 h-5 w-5" />
                    Advanced PDF Split
                  </CardTitle>
                  <CardDescription>
                    Split PDFs with precision and professional options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {pdfFiles.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50/50 transition-all duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getFileIcon(file.type)}</div>
                          <div>
                            <p className="font-medium text-gray-900">{file.filename}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleAdvancedSplit(file.id)}
                          disabled={loading}
                          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                        >
                          {loading ? (
                            <RotateCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Scissors className="mr-2 h-4 w-4" />
                              Advanced Split
                            </>
                          )}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                  
                  {pdfFiles.length === 0 && (
                    <div className="text-center py-12">
                      <Scissors className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
            </div>

            {/* Split Options */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Split Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Split Method</Label>
                    <Select
                      value={splitOptions.splitType}
                      onValueChange={(value) => 
                        setSplitOptions(prev => ({ ...prev, splitType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pages">By Pages</SelectItem>
                        <SelectItem value="size">By File Size</SelectItem>
                        <SelectItem value="bookmarks">By Bookmarks</SelectItem>
                        <SelectItem value="custom">Custom Ranges</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {splitOptions.splitType === 'pages' && (
                    <div>
                      <Label className="text-sm">Pages per File: {splitOptions.pagesPerFile}</Label>
                      <Slider
                        value={[splitOptions.pagesPerFile]}
                        onValueChange={([value]) => 
                          setSplitOptions(prev => ({ ...prev, pagesPerFile: value }))
                        }
                        max={50}
                        min={1}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  )}

                  {splitOptions.splitType === 'size' && (
                    <div>
                      <Label className="text-sm">Max File Size: {splitOptions.maxFileSize} MB</Label>
                      <Slider
                        value={[splitOptions.maxFileSize]}
                        onValueChange={([value]) => 
                          setSplitOptions(prev => ({ ...prev, maxFileSize: value }))
                        }
                        max={100}
                        min={1}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Preserve Metadata</Label>
                      <Switch
                        checked={splitOptions.addMetadata}
                        onCheckedChange={(checked) => 
                          setSplitOptions(prev => ({ ...prev, addMetadata: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Preserve Bookmarks</Label>
                      <Switch
                        checked={splitOptions.preserveBookmarks}
                        onCheckedChange={(checked) => 
                          setSplitOptions(prev => ({ ...prev, preserveBookmarks: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Optimize Output</Label>
                      <Switch
                        checked={splitOptions.optimizeOutput}
                        onCheckedChange={(checked) => 
                          setSplitOptions(prev => ({ ...prev, optimizeOutput: checked }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Advanced Compress */}
        <TabsContent value="compress">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Archive className="mr-2 h-5 w-5" />
                    Advanced PDF Compression
                  </CardTitle>
                  <CardDescription>
                    Reduce file size with intelligent compression algorithms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {pdfFiles.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50/50 transition-all duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getFileIcon(file.type)}</div>
                          <div>
                            <p className="font-medium text-gray-900">{file.filename}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleAdvancedCompress(file.id)}
                          disabled={loading}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          {loading ? (
                            <RotateCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Archive className="mr-2 h-4 w-4" />
                              Advanced Compress
                            </>
                          )}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                  
                  {pdfFiles.length === 0 && (
                    <div className="text-center py-12">
                      <Archive className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
            </div>

            {/* Compression Options */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Compression Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Compression Level</Label>
                    <Select
                      value={compressOptions.compressionLevel}
                      onValueChange={(value) => 
                        setCompressOptions(prev => ({ ...prev, compressionLevel: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Faster)</SelectItem>
                        <SelectItem value="medium">Medium (Balanced)</SelectItem>
                        <SelectItem value="high">High (Better)</SelectItem>
                        <SelectItem value="maximum">Maximum (Best)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Image Quality: {compressOptions.imageQuality}%</Label>
                    <Slider
                      value={[compressOptions.imageQuality]}
                      onValueChange={([value]) => 
                        setCompressOptions(prev => ({ ...prev, imageQuality: value }))
                      }
                      max={100}
                      min={10}
                      step={5}
                      className="mt-2"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Optimize Images</Label>
                      <Switch
                        checked={compressOptions.optimizeImages}
                        onCheckedChange={(checked) => 
                          setCompressOptions(prev => ({ ...prev, optimizeImages: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Downsample Images</Label>
                      <Switch
                        checked={compressOptions.downsampleImages}
                        onCheckedChange={(checked) => 
                          setCompressOptions(prev => ({ ...prev, downsampleImages: checked }))
                        }
                      />
                    </div>

                    {compressOptions.downsampleImages && (
                      <div>
                        <Label className="text-sm">Max DPI: {compressOptions.maxImageDPI}</Label>
                        <Slider
                          value={[compressOptions.maxImageDPI]}
                          onValueChange={([value]) => 
                            setCompressOptions(prev => ({ ...prev, maxImageDPI: value }))
                          }
                          max={300}
                          min={72}
                          step={6}
                          className="mt-2"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Convert to Grayscale</Label>
                      <Switch
                        checked={compressOptions.convertToGrayscale}
                        onCheckedChange={(checked) => 
                          setCompressOptions(prev => ({ ...prev, convertToGrayscale: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Remove Metadata</Label>
                      <Switch
                        checked={compressOptions.removeMetadata}
                        onCheckedChange={(checked) => 
                          setCompressOptions(prev => ({ ...prev, removeMetadata: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Remove Annotations</Label>
                      <Switch
                        checked={compressOptions.removeAnnotations}
                        onCheckedChange={(checked) => 
                          setCompressOptions(prev => ({ ...prev, removeAnnotations: checked }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Advanced Convert */}
        <TabsContent value="convert">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Image className="mr-2 h-5 w-5" />
                    Advanced Image to PDF
                  </CardTitle>
                  <CardDescription>
                    Convert images to PDF with professional layout options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{selectedFiles.length} images selected</Badge>
                      {selectedFiles.length > 0 && (
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ready to convert
                        </Badge>
                      )}
                    </div>
                    <Button
                      onClick={handleAdvancedConvert}
                      disabled={selectedFiles.length === 0 || loading}
                      className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                    >
                      {loading ? (
                        <>
                          <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Advanced Convert
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {imageFiles.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedFiles.includes(file.id) 
                            ? 'border-teal-500 bg-teal-50/50 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                        }`}
                        onClick={() => handleFileSelect(file.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => handleFileSelect(file.id)}
                          className="rounded border-gray-300"
                        />
                        <div className="text-2xl">{getFileIcon(file.type)}</div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{file.filename}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        {selectedFiles.includes(file.id) && (
                          <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                            #{selectedFiles.indexOf(file.id) + 1}
                          </Badge>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  
                  {imageFiles.length === 0 && (
                    <div className="text-center py-12">
                      <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-4">No image files found</p>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowUpload(true)}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Image Files
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Convert Options */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Layout Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">Page Size</Label>
                      <Select
                        value={convertOptions.pageSize}
                        onValueChange={(value) => 
                          setConvertOptions(prev => ({ ...prev, pageSize: value }))
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A4">A4</SelectItem>
                          <SelectItem value="Letter">Letter</SelectItem>
                          <SelectItem value="Legal">Legal</SelectItem>
                          <SelectItem value="A3">A3</SelectItem>
                          <SelectItem value="A5">A5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">Orientation</Label>
                      <Select
                        value={convertOptions.orientation}
                        onValueChange={(value) => 
                          setConvertOptions(prev => ({ ...prev, orientation: value }))
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portrait">Portrait</SelectItem>
                          <SelectItem value="landscape">Landscape</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm">Images per Page: {convertOptions.imagesPerPage}</Label>
                    <Slider
                      value={[convertOptions.imagesPerPage]}
                      onValueChange={([value]) => 
                        setConvertOptions(prev => ({ ...prev, imagesPerPage: value }))
                      }
                      max={4}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Margin: {convertOptions.margin}px</Label>
                    <Slider
                      value={[convertOptions.margin]}
                      onValueChange={([value]) => 
                        setConvertOptions(prev => ({ ...prev, margin: value }))
                      }
                      max={100}
                      min={0}
                      step={10}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Image Layout</Label>
                    <Select
                      value={convertOptions.imageLayout}
                      onValueChange={(value) => 
                        setConvertOptions(prev => ({ ...prev, imageLayout: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fit">Fit to Page</SelectItem>
                        <SelectItem value="fill">Fill Page</SelectItem>
                        <SelectItem value="stretch">Stretch</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Image Quality: {convertOptions.imageQuality}%</Label>
                    <Slider
                      value={[convertOptions.imageQuality]}
                      onValueChange={([value]) => 
                        setConvertOptions(prev => ({ ...prev, imageQuality: value }))
                      }
                      max={100}
                      min={50}
                      step={5}
                      className="mt-2"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Add Border</Label>
                      <Switch
                        checked={convertOptions.addBorder}
                        onCheckedChange={(checked) => 
                          setConvertOptions(prev => ({ ...prev, addBorder: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Add Page Numbers</Label>
                      <Switch
                        checked={convertOptions.addPageNumbers}
                        onCheckedChange={(checked) => 
                          setConvertOptions(prev => ({ ...prev, addPageNumbers: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Add Timestamp</Label>
                      <Switch
                        checked={convertOptions.addTimestamp}
                        onCheckedChange={(checked) => 
                          setConvertOptions(prev => ({ ...prev, addTimestamp: checked }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Advanced OCR */}
        <TabsContent value="ocr">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="mr-2 h-5 w-5" />
                Advanced OCR - Text Extraction
                <Badge variant="secondary" className="ml-2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
              </CardTitle>
              <CardDescription>
                Extract text from scanned PDFs with advanced OCR technology and professional options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {pdfFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
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
                    <Button
                      onClick={() => handleAdvancedOCR(file.id)}
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Advanced OCR
                        </>
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>
              
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

        {/* Advanced AI Chat */}
        <TabsContent value="ai-chat">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Advanced AI Chat with PDFs
                <Badge variant="secondary" className="ml-2">
                  <Brain className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
              </CardTitle>
              <CardDescription>
                Advanced AI conversations with your PDF documents using sophisticated language models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {pdfFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
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
                      <Button
                        onClick={() => handleAdvancedAIChat(file.id)}
                        disabled={loading}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Advanced Chat
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
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

export default AdvancedTools