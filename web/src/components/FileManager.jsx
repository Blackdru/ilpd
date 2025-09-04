import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../lib/api'
import { formatFileSize, formatDate, getFileIcon } from '../lib/utils'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { 
  Folder, 
  FolderOpen,
  File,
  Search, 
  Filter,
  Grid3X3,
  List,
  Plus,
  Upload,
  Download,
  Trash2,
  MoreHorizontal,
  ArrowLeft,
  Home,
  Tag,
  Bot,
  Eye,
  Brain,
  MessageSquare,
  Move,
  Copy,
  Star,
  Clock
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import toast from 'react-hot-toast'
import AIAssistant from './AIAssistant'

const FileManager = ({ onUpload }) => {
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [currentFolder, setCurrentFolder] = useState(null)
  const [folderPath, setFolderPath] = useState([])
  const [folders, setFolders] = useState([])
  const [files, setFiles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [sortBy, setSortBy] = useState('name') // 'name', 'date', 'size', 'type'
  const [sortOrder, setSortOrder] = useState('asc') // 'asc', 'desc'

  useEffect(() => {
    loadFolderContents()
  }, [currentFolder])

  const loadFolderContents = async () => {
    setLoading(true)
    try {
      // Load folders
      const foldersResponse = await api.get('/folders', {
        params: { parent_id: currentFolder?.id || null }
      })
      setFolders(foldersResponse.folders || [])

      // Load files
      const filesResponse = await api.getFiles(1, 100, searchTerm, '', currentFolder?.id)
      setFiles(filesResponse.files || [])

      // Update folder path
      if (currentFolder) {
        const folderResponse = await api.get(`/folders/${currentFolder.id}`)
        setFolderPath(folderResponse.folder.path || [])
      } else {
        setFolderPath([])
      }
    } catch (error) {
      toast.error('Failed to load folder contents')
      console.error('Error loading folder contents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      await api.post('/folders', {
        name: newFolderName.trim(),
        parent_id: currentFolder?.id || null
      })
      
      setNewFolderName('')
      setShowCreateFolder(false)
      loadFolderContents()
      toast.success('Folder created successfully')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create folder')
    }
  }

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder)
    setSelectedItems([])
  }

  const handleBackClick = () => {
    if (folderPath.length > 0) {
      const parentFolder = folderPath[folderPath.length - 2] || null
      setCurrentFolder(parentFolder)
    } else {
      setCurrentFolder(null)
    }
    setSelectedItems([])
  }

  const handleBreadcrumbClick = (folder, index) => {
    if (index === -1) {
      setCurrentFolder(null)
    } else {
      setCurrentFolder(folder)
    }
    setSelectedItems([])
  }

  const handleItemSelect = (item, type) => {
    const itemId = `${type}-${item.id}`
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleSelectAll = () => {
    const allItems = [
      ...folders.map(f => `folder-${f.id}`),
      ...files.map(f => `file-${f.id}`)
    ]
    setSelectedItems(selectedItems.length === allItems.length ? [] : allItems)
  }

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return

    const confirmed = confirm(`Delete ${selectedItems.length} item(s)?`)
    if (!confirmed) return

    try {
      const folderIds = selectedItems
        .filter(id => id.startsWith('folder-'))
        .map(id => id.replace('folder-', ''))
      
      const fileIds = selectedItems
        .filter(id => id.startsWith('file-'))
        .map(id => id.replace('file-', ''))

      // Delete folders
      for (const folderId of folderIds) {
        await api.delete(`/folders/${folderId}?force=true`)
      }

      // Delete files
      for (const fileId of fileIds) {
        await api.deleteFile(fileId)
      }

      setSelectedItems([])
      loadFolderContents()
      toast.success(`${selectedItems.length} item(s) deleted`)
    } catch (error) {
      toast.error('Failed to delete items')
    }
  }

  const handleDownloadFile = async (file) => {
    try {
      const blob = await api.downloadFile(file.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = file.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('File downloaded successfully')
    } catch (error) {
      toast.error('Download failed')
    }
  }

  const handleOpenAIAssistant = (file) => {
    setSelectedFile(file)
    setShowAIAssistant(true)
  }

  const sortItems = (items, type) => {
    return [...items].sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'name':
          aValue = (a.name || a.filename || '').toLowerCase()
          bValue = (b.name || b.filename || '').toLowerCase()
          break
        case 'date':
          aValue = new Date(a.created_at || a.updated_at)
          bValue = new Date(b.created_at || b.updated_at)
          break
        case 'size':
          aValue = a.size || 0
          bValue = b.size || 0
          break
        case 'type':
          aValue = type === 'folder' ? 'folder' : (a.type || '')
          bValue = type === 'folder' ? 'folder' : (b.type || '')
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }

  const filteredFolders = sortItems(
    folders.filter(folder => 
      folder.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    'folder'
  )

  const filteredFiles = sortItems(
    files.filter(file => 
      file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.tags && file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    ),
    'file'
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">File Manager</h1>
          <p className="text-muted-foreground">Organize and manage your PDF files</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowCreateFolder(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button onClick={onUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleBreadcrumbClick(null, -1)}
          className="h-8 px-2"
        >
          <Home className="h-4 w-4" />
        </Button>
        {folderPath.map((folder, index) => (
          <div key={folder.id} className="flex items-center space-x-2">
            <span className="text-muted-foreground">/</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBreadcrumbClick(folder, index)}
              className="h-8 px-2"
            >
              {folder.name}
            </Button>
          </div>
        ))}
        {currentFolder && (
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">{currentFolder.name}</span>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-2">
          {(currentFolder || folderPath.length > 0) && (
            <Button variant="outline" size="sm" onClick={handleBackClick}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          
          {selectedItems.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={handleDeleteSelected}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedItems.length})
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedItems([])}>
                Clear Selection
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files and folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                Sort by Name {sortBy === 'name' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('date')}>
                Sort by Date {sortBy === 'date' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('size')}>
                Sort by Size {sortBy === 'size' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('type')}>
                Sort by Type {sortBy === 'type' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {filteredFolders.length === 0 && filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No items found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms' : 'This folder is empty'}
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Folders */}
                {filteredFolders.map((folder) => (
                  <motion.div
                    key={`folder-${folder.id}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`relative group cursor-pointer ${
                      selectedItems.includes(`folder-${folder.id}`) ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <CardContent className="p-0 text-center">
                        <div className="flex justify-center mb-2">
                          <Folder 
                            className="h-12 w-12 text-blue-500" 
                            style={{ color: folder.color }}
                          />
                        </div>
                        <p className="text-sm font-medium truncate">{folder.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {folder.files?.[0]?.count || 0} files
                        </p>
                      </CardContent>
                    </Card>
                    
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(`folder-${folder.id}`)}
                        onChange={() => handleItemSelect(folder, 'folder')}
                        className="rounded"
                      />
                    </div>
                    
                    <div 
                      className="absolute inset-0 rounded-lg"
                      onClick={() => handleFolderClick(folder)}
                    />
                  </motion.div>
                ))}

                {/* Files */}
                {filteredFiles.map((file) => (
                  <motion.div
                    key={`file-${file.id}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`relative group cursor-pointer ${
                      selectedItems.includes(`file-${file.id}`) ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <CardContent className="p-0 text-center">
                        <div className="flex justify-center mb-2">
                          <div className="text-4xl">{getFileIcon(file.type)}</div>
                        </div>
                        <p className="text-sm font-medium truncate">{file.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                        
                        {/* AI Features Badges */}
                        <div className="flex justify-center space-x-1 mt-2">
                          {file.has_ocr && <Badge variant="secondary" className="text-xs">OCR</Badge>}
                          {file.has_summary && <Badge variant="secondary" className="text-xs">Summary</Badge>}
                          {file.has_embeddings && <Badge variant="secondary" className="text-xs">Chat</Badge>}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(`file-${file.id}`)}
                        onChange={() => handleItemSelect(file, 'file')}
                        className="rounded"
                      />
                    </div>
                    
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleDownloadFile(file)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenAIAssistant(file)}>
                            <Bot className="mr-2 h-4 w-4" />
                            AI Assistant
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleItemSelect(file, 'file')}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {/* List Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredFolders.length + filteredFiles.length}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </div>
                  <div className="col-span-5">Name</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-2">Modified</div>
                  <div className="col-span-1">AI</div>
                  <div className="col-span-1">Actions</div>
                </div>

                {/* Folders */}
                {filteredFolders.map((folder) => (
                  <motion.div
                    key={`folder-${folder.id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`grid grid-cols-12 gap-4 px-4 py-3 hover:bg-muted/50 rounded-lg cursor-pointer ${
                      selectedItems.includes(`folder-${folder.id}`) ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleFolderClick(folder)}
                  >
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(`folder-${folder.id}`)}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleItemSelect(folder, 'folder')
                        }}
                        className="rounded"
                      />
                    </div>
                    <div className="col-span-5 flex items-center space-x-3">
                      <Folder className="h-5 w-5 text-blue-500" style={{ color: folder.color }} />
                      <span className="font-medium">{folder.name}</span>
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {folder.files?.[0]?.count || 0} items
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {formatDate(folder.updated_at)}
                    </div>
                    <div className="col-span-1"></div>
                    <div className="col-span-1"></div>
                  </motion.div>
                ))}

                {/* Files */}
                {filteredFiles.map((file) => (
                  <motion.div
                    key={`file-${file.id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`grid grid-cols-12 gap-4 px-4 py-3 hover:bg-muted/50 rounded-lg ${
                      selectedItems.includes(`file-${file.id}`) ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(`file-${file.id}`)}
                        onChange={() => handleItemSelect(file, 'file')}
                        className="rounded"
                      />
                    </div>
                    <div className="col-span-5 flex items-center space-x-3">
                      <div className="text-xl">{getFileIcon(file.type)}</div>
                      <div>
                        <p className="font-medium">{file.filename}</p>
                        {file.tags && file.tags.length > 0 && (
                          <div className="flex space-x-1 mt-1">
                            {file.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {formatDate(file.created_at)}
                    </div>
                    <div className="col-span-1">
                      <div className="flex space-x-1">
                        {file.has_ocr && <Eye className="h-3 w-3 text-green-500" title="OCR Available" />}
                        {file.has_summary && <Brain className="h-3 w-3 text-blue-500" title="Summary Available" />}
                        {file.has_embeddings && <MessageSquare className="h-3 w-3 text-purple-500" title="Chat Ready" />}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleDownloadFile(file)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenAIAssistant(file)}>
                            <Bot className="mr-2 h-4 w-4" />
                            AI Assistant
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleItemSelect(file, 'file')}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new folder
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Assistant */}
      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  )
}

export default FileManager