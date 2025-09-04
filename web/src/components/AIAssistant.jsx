import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../lib/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { 
  Bot, 
  Send, 
  Loader2, 
  FileText, 
  MessageSquare, 
  Sparkles,
  Eye,
  Brain,
  Search,
  X,
  ChevronRight,
  Lightbulb
} from 'lucide-react'
import toast from 'react-hot-toast'

const AIAssistant = ({ file, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('chat')
  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [chatSession, setChatSession] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [ocrResult, setOcrResult] = useState(null)
  const [summary, setSummary] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isOpen && file) {
      loadFileData()
      loadRecommendations()
    }
  }, [isOpen, file])

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadFileData = async () => {
    try {
      // Load OCR results if available
      if (file.has_ocr) {
        const ocrResponse = await api.get(`/ai/ocr/${file.id}`)
        setOcrResult(ocrResponse.result)
      }

      // Load summary if available
      if (file.has_summary) {
        const summaryResponse = await api.get(`/ai/summaries/${file.id}`)
        if (summaryResponse.summaries && summaryResponse.summaries.length > 0) {
          setSummary(summaryResponse.summaries[0])
        }
      }

      // Load chat sessions
      const sessionsResponse = await api.get(`/ai/chat-sessions/${file.id}`)
      if (sessionsResponse.sessions && sessionsResponse.sessions.length > 0) {
        setChatSession(sessionsResponse.sessions[0])
        loadChatMessages(sessionsResponse.sessions[0].id)
      }
    } catch (error) {
      console.error('Error loading file data:', error)
    }
  }

  const loadChatMessages = async (sessionId) => {
    try {
      const response = await api.get(`/ai/chat-messages/${sessionId}`)
      setChatMessages(response.messages || [])
    } catch (error) {
      console.error('Error loading chat messages:', error)
    }
  }

  const loadRecommendations = async () => {
    try {
      const response = await api.get(`/ai/recommendations/${file.id}`)
      setRecommendations(response.recommendations || [])
    } catch (error) {
      console.error('Error loading recommendations:', error)
    }
  }

  const handleOCR = async () => {
    setIsLoading(true)
    try {
      const response = await api.post('/ai/ocr', {
        fileId: file.id,
        language: 'eng',
        enhanceImage: true
      })
      
      setOcrResult(response.result)
      toast.success('Text extracted successfully!')
      loadRecommendations() // Refresh recommendations
    } catch (error) {
      toast.error(error.response?.data?.error || 'OCR failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSummarize = async (summaryType = 'auto') => {
    setIsLoading(true)
    try {
      const response = await api.post('/ai/summarize', {
        fileId: file.id,
        summaryType
      })
      
      setSummary(response.summary)
      toast.success('Summary generated successfully!')
      loadRecommendations() // Refresh recommendations
    } catch (error) {
      toast.error(error.response?.data?.error || 'Summarization failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnableChat = async () => {
    setIsLoading(true)
    try {
      await api.post('/ai/create-embeddings', {
        fileId: file.id,
        chunkSize: 1000,
        overlap: 100
      })
      
      toast.success('PDF chat enabled!')
      setActiveTab('chat')
      loadRecommendations() // Refresh recommendations
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to enable chat')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!chatMessage.trim() || isLoading) return

    const userMessage = chatMessage.trim()
    setChatMessage('')
    setIsLoading(true)

    // Add user message to chat immediately
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    }
    setChatMessages(prev => [...prev, newUserMessage])

    try {
      const response = await api.post('/ai/chat-pdf', {
        fileId: file.id,
        message: userMessage,
        sessionId: chatSession?.id
      })

      // Update session if new
      if (!chatSession) {
        setChatSession({ id: response.sessionId })
      }

      // Add AI response to chat
      const aiMessage = {
        role: 'assistant',
        content: response.response,
        metadata: { sources: response.sources },
        created_at: new Date().toISOString()
      }
      setChatMessages(prev => [...prev, aiMessage])

    } catch (error) {
      toast.error(error.response?.data?.error || 'Chat failed')
      // Remove user message on error
      setChatMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecommendationAction = async (action) => {
    switch (action) {
      case 'ocr':
        await handleOCR()
        break
      case 'summarize':
        await handleSummarize()
        break
      case 'enable_chat':
        await handleEnableChat()
        break
      default:
        toast.info(`Action "${action}" not implemented yet`)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">AI Assistant</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* File Info */}
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center space-x-2 mb-2">
          <FileText className="h-4 w-4" />
          <span className="text-sm font-medium truncate">{file?.filename}</span>
        </div>
        <div className="flex space-x-2">
          {file?.has_ocr && <Badge variant="secondary" className="text-xs">OCR</Badge>}
          {file?.has_summary && <Badge variant="secondary" className="text-xs">Summary</Badge>}
          {file?.has_embeddings && <Badge variant="secondary" className="text-xs">Chat Ready</Badge>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {['chat', 'summary', 'recommendations'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'chat' && <MessageSquare className="h-4 w-4 mr-1" />}
            {tab === 'summary' && <Brain className="h-4 w-4 mr-1" />}
            {tab === 'recommendations' && <Lightbulb className="h-4 w-4 mr-1" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col"
            >
              {!file?.has_embeddings ? (
                <div className="flex-1 flex items-center justify-center p-4">
                  <div className="text-center">
                    <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">Enable PDF Chat</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Process your PDF to enable AI-powered chat
                    </p>
                    <Button onClick={handleEnableChat} disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      Enable Chat
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Start a conversation about your PDF</p>
                      </div>
                    ) : (
                      chatMessages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {message.metadata?.sources && message.metadata.sources.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-muted-foreground/20">
                                <p className="text-xs text-muted-foreground">
                                  Sources: {message.metadata.sources.length} relevant sections
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg p-3">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Input
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Ask about your PDF..."
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button type="submit" size="icon" disabled={isLoading || !chatMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full overflow-y-auto p-4"
            >
              {!file?.has_ocr ? (
                <div className="text-center">
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Extract Text First</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Run OCR to extract text before generating a summary
                  </p>
                  <Button onClick={handleOCR} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    Extract Text
                  </Button>
                </div>
              ) : !summary ? (
                <div className="text-center">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Generate Summary</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create an AI-powered summary of your document
                  </p>
                  <div className="space-y-2">
                    <Button onClick={() => handleSummarize('brief')} disabled={isLoading} variant="outline" className="w-full">
                      Brief Summary
                    </Button>
                    <Button onClick={() => handleSummarize('auto')} disabled={isLoading} className="w-full">
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Brain className="h-4 w-4 mr-2" />
                      )}
                      Auto Summary
                    </Button>
                    <Button onClick={() => handleSummarize('detailed')} disabled={isLoading} variant="outline" className="w-full">
                      Detailed Summary
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Document Summary</h3>
                    <Badge variant="secondary">{summary.summary_type}</Badge>
                  </div>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm whitespace-pre-wrap">{summary.summary_text}</p>
                      <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                        {summary.word_count} words • Generated {new Date(summary.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                  <Button 
                    onClick={() => handleSummarize(summary.summary_type)} 
                    disabled={isLoading} 
                    variant="outline" 
                    className="w-full"
                  >
                    Regenerate Summary
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full overflow-y-auto p-4"
            >
              <div className="space-y-4">
                <h3 className="font-medium flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Smart Recommendations
                </h3>
                
                {recommendations.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    <Sparkles className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No recommendations available</p>
                  </div>
                ) : (
                  recommendations.map((rec, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-sm">{rec.title}</h4>
                              <Badge 
                                variant={rec.priority === 'high' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {rec.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">{rec.description}</p>
                            <Button 
                              size="sm" 
                              onClick={() => handleRecommendationAction(rec.action)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <ChevronRight className="h-3 w-3 mr-1" />
                              )}
                              {rec.action === 'ocr' && 'Extract Text'}
                              {rec.action === 'summarize' && 'Summarize'}
                              {rec.action === 'enable_chat' && 'Enable Chat'}
                              {rec.action === 'compress' && 'Compress'}
                              {!['ocr', 'summarize', 'enable_chat', 'compress'].includes(rec.action) && 'Apply'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default AIAssistant