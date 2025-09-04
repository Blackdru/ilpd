import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { api } from '../lib/api'
import { validateFile, formatFileSize } from '../lib/utils'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { X, Upload, File, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const FileUpload = ({ onClose, onSuccess, multiple = true }) => {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach(error => {
        if (error.code === 'file-too-large') {
          toast.error(`${file.name} is too large. Max size is 50MB.`)
        } else if (error.code === 'file-invalid-type') {
          toast.error(`${file.name} is not a supported file type.`)
        }
      })
    })

    // Process accepted files
    const newFiles = acceptedFiles.map(file => {
      const validation = validateFile(file, allowedTypes)
      return {
        file,
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        status: validation.isValid ? 'ready' : 'error',
        errors: validation.errors,
        progress: 0
      }
    })

    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple
  })

  const removeFile = (fileId) => {
    setFiles(files.filter(f => f.id !== fileId))
  }

  const uploadFiles = async () => {
    const validFiles = files.filter(f => f.status === 'ready')
    
    if (validFiles.length === 0) {
      toast.error('No valid files to upload')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      if (validFiles.length === 1) {
        // Single file upload
        const fileData = validFiles[0]
        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'uploading' } : f
        ))

        await api.uploadFile(fileData.file)
        
        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'success' } : f
        ))
      } else {
        // Multiple file upload
        const fileObjects = validFiles.map(f => f.file)
        
        setFiles(prev => prev.map(f => 
          validFiles.find(vf => vf.id === f.id) ? { ...f, status: 'uploading' } : f
        ))

        await api.uploadMultipleFiles(fileObjects)
        
        setFiles(prev => prev.map(f => 
          validFiles.find(vf => vf.id === f.id) ? { ...f, status: 'success' } : f
        ))
      }

      setUploadProgress(100)
      toast.success(`${validFiles.length} file(s) uploaded successfully`)
      
      setTimeout(() => {
        onSuccess?.()
      }, 1000)
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed: ' + error.message)
      
      setFiles(prev => prev.map(f => 
        validFiles.find(vf => vf.id === f.id) ? { ...f, status: 'error' } : f
      ))
    } finally {
      setUploading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'uploading':
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      default:
        return <File className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>
              Upload PDF, images, Word, or Excel files (max 50MB each)
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-lg">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF, JPG, PNG, DOC, DOCX, XLS, XLSX
                </p>
              </div>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <h4 className="font-medium">Selected Files</h4>
              {files.map((fileData) => (
                <div
                  key={fileData.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(fileData.status)}
                    <div>
                      <p className="font-medium text-sm">{fileData.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(fileData.size)}
                      </p>
                      {fileData.errors?.length > 0 && (
                        <p className="text-xs text-red-500">
                          {fileData.errors[0]}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {!uploading && fileData.status !== 'success' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(fileData.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
            <Button 
              onClick={uploadFiles} 
              disabled={files.length === 0 || uploading || !files.some(f => f.status === 'ready')}
            >
              {uploading ? 'Uploading...' : `Upload ${files.filter(f => f.status === 'ready').length} file(s)`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FileUpload