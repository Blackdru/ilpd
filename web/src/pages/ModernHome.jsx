import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { 
  ArrowRight,
  FileText,
  GitMerge,
  Scissors,
  Archive,
  Image,
  Sparkles,
  Zap,
  Shield,
  Clock,
  Users,
  Star,
  CheckCircle,
  Play,
  Download,
  Globe,
  Smartphone,
  Palette,
  Brain,
  Eye,
  MessageSquare,
  Crown,
  Rocket,
  Heart,
  TrendingUp,
  Award,
  Target,
  Layers,
  LayoutDashboard
} from 'lucide-react'

const ModernHome = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8])

  const [stats, setStats] = useState({
    users: 12500,
    files: 2400000,
    operations: 8900000
  })

  const features = [
    {
      icon: GitMerge,
      title: 'Smart PDF Merge',
      description: 'Combine multiple PDFs with intelligent bookmarking and page numbering',
      gradient: 'from-fuchsia-500 via-purple-500 to-indigo-500', // More vibrant gradient
      delay: 0.1
    },
    {
      icon: Scissors,
      title: 'Precision Split',
      description: 'Split PDFs by pages, size, or bookmarks with professional accuracy',
      gradient: 'from-purple-500 to-pink-500',
      delay: 0.2
    },
    {
      icon: Archive,
      title: 'Advanced Compression',
      description: 'Reduce file sizes while maintaining quality with AI optimization',
      gradient: 'from-green-500 to-teal-500',
      delay: 0.3
    },
    {
      icon: Image,
      title: 'Image Conversion',
      description: 'Convert images to PDF with custom layouts and professional formatting',
      gradient: 'from-orange-500 to-red-500',
      delay: 0.4
    },
    {
      icon: Eye,
      title: 'OCR Technology',
      description: 'Extract text from scanned documents with industry-leading accuracy',
      gradient: 'from-indigo-500 to-purple-500',
      delay: 0.5
    },
    {
      icon: Brain,
      title: 'AI Summarization',
      description: 'Generate intelligent summaries of your documents automatically',
      gradient: 'from-pink-500 to-rose-500',
      delay: 0.6
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      company: 'TechCorp',
      avatar: '👩‍💼',
      content: 'PDFPet has revolutionized our document workflow. The AI features are incredible!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Legal Consultant',
      company: 'Law Firm LLC',
      avatar: '👨‍💼',
      content: 'Professional-grade tools that rival expensive software. Absolutely fantastic!',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Project Manager',
      company: 'StartupXYZ',
      avatar: '👩‍💻',
      content: 'The batch processing feature saves us hours every week. Game changer!',
      rating: 5
    }
  ]

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for personal use',
      features: [
        'Basic PDF operations',
        '10 files per month',
        'Standard compression',
        'Email support'
      ],
      gradient: 'from-gray-500 to-gray-600',
      popular: false
    },
    {
      name: 'Pro',
      price: '$9',
      period: 'per month',
      description: 'For professionals and teams',
      features: [
        'All PDF operations',
        'Unlimited files',
        'AI-powered features',
        'Batch processing',
        'Priority support',
        'Advanced compression'
      ],
      gradient: 'from-blue-500 to-purple-600',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$29',
      period: 'per month',
      description: 'For large organizations',
      features: [
        'Everything in Pro',
        'API access',
        'Custom integrations',
        'Dedicated support',
        'Advanced analytics',
        'White-label options'
      ],
      gradient: 'from-purple-600 to-pink-600',
      popular: false
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        users: prev.users + Math.floor(Math.random() * 3),
        files: prev.files + Math.floor(Math.random() * 50),
        operations: prev.operations + Math.floor(Math.random() * 100)
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background Elements */}
        <motion.div
          style={{ y: y1, opacity }}
          className="absolute inset-0 bg-pattern-dots opacity-30"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"
        />
        <motion.div
          style={{ y: y1 }}
          className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-orange-600/20 rounded-full blur-3xl"
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <Badge className="badge-modern mb-6 px-4 py-2">
                <Sparkles className="h-4 w-4 mr-2" />
                Now with AI-Powered Features
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="gradient-text">Professional</span>
                <br />
                PDF Tools
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Transform, optimize, and enhance your PDFs with cutting-edge AI technology. 
                Professional-grade tools that make document processing effortless.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12"
            >
              {user ? (
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="btn-gradient text-lg px-8 py-4 h-auto"
                >
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => navigate('/register')}
                    className="btn-gradient text-lg px-8 py-4 h-auto"
                  >
                    <Rocket className="mr-2 h-5 w-5" />
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/tools')}
                    className="text-lg px-8 py-4 h-auto rounded-xl border-2 hover:bg-gray-50"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Try Demo
                  </Button>
                </>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              <div className="text-center">
                <motion.div
                  key={stats.users}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold gradient-text mb-2"
                >
                  {stats.users.toLocaleString()}+
                </motion.div>
                <div className="text-gray-600">Happy Users</div>
              </div>
              <div className="text-center">
                <motion.div
                  key={stats.files}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold gradient-text mb-2"
                >
                  {(stats.files / 1000000).toFixed(1)}M+
                </motion.div>
                <div className="text-gray-600">Files Processed</div>
              </div>
              <div className="text-center">
                <motion.div
                  key={stats.operations}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold gradient-text mb-2"
                >
                  {(stats.operations / 1000000).toFixed(1)}M+
                </motion.div>
                <div className="text-gray-600">Operations</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge className="badge-modern mb-6">
              <Zap className="h-4 w-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional PDF tools with AI-powered features that streamline your workflow
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: feature.delay }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="file-card-modern h-full border-0 shadow-modern hover:shadow-modern-lg">
                  <CardContent className="p-8">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Showcase */}
      <section className="py-32 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Badge className="badge-modern mb-6">
                <Brain className="h-4 w-4 mr-2" />
                AI-Powered
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
                Next-Generation Intelligence
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Our AI technology understands your documents, extracts insights, and automates complex workflows.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Smart OCR</h3>
                    <p className="text-gray-600">Extract text from scanned documents with 99.9% accuracy</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">AI Summarization</h3>
                    <p className="text-gray-600">Generate intelligent summaries in seconds</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Chat with PDFs</h3>
                    <p className="text-gray-600">Ask questions and get instant answers from your documents</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass-card p-8 rounded-3xl">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1 bg-gray-200 rounded-full h-8 flex items-center px-4">
                      <span className="text-sm text-gray-600">AI Processing...</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <Eye className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">OCR Analysis</span>
                      </div>
                      <div className="text-sm text-blue-700">Extracting text from 24 pages...</div>
                      <div className="mt-2 bg-blue-200 rounded-full h-2">
                        <motion.div 
                          className="bg-blue-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '85%' }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">AI Summary</span>
                      </div>
                      <div className="text-sm text-green-700">Generating intelligent summary...</div>
                      <div className="mt-2 bg-green-200 rounded-full h-2">
                        <motion.div 
                          className="bg-green-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '92%' }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Chat Ready</span>
                      </div>
                      <div className="text-sm text-purple-700">Document indexed for conversations</div>
                      <div className="mt-2 flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-purple-600" />
                        <span className="text-sm text-purple-700">Ready to chat!</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-glow"
              >
                <Sparkles className="h-8 w-8 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge className="badge-modern mb-6">
              <Heart className="h-4 w-4 mr-2" />
              Loved by Users
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              What People Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied users who trust PDFPet for their document needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="file-card-modern h-full border-0 shadow-modern">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{testimonial.avatar}</div>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                        <div className="text-sm text-gray-500">{testimonial.company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge className="badge-modern mb-6">
              <Crown className="h-4 w-4 mr-2" />
              Simple Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free and upgrade as you grow. All plans include our core features.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className={`relative ${plan.popular ? 'scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <Card className={`file-card-modern h-full border-0 shadow-modern ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardContent className="p-8">
                    <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${plan.gradient} mb-6`}>
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    
                    <div className="mb-6">
                      <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                      <span className="text-gray-600 ml-2">/{plan.period}</span>
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full ${plan.popular ? 'btn-gradient' : 'btn-modern border-2'}`}
                      onClick={() => navigate('/register')}
                    >
                      {plan.name === 'Free' ? 'Get Started' : 'Choose Plan'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-primary relative overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 right-10 w-32 h-32 border border-white/20 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-10 left-10 w-24 h-24 border border-white/20 rounded-full"
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to Transform
              <br />
              Your PDFs?
            </h2>
            <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-3xl mx-auto">
              Join thousands of professionals who trust PDFPet for their document processing needs.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button
                onClick={() => navigate('/register')}
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 h-auto rounded-xl font-semibold"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/tools')}
                className="border-white text-white hover:bg-white/10 text-lg px-8 py-4 h-auto rounded-xl"
              >
                <Play className="mr-2 h-5 w-5" />
                Try Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-primary p-2 rounded-xl">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">PDFPet</span>
              </div>
              <p className="text-gray-400 mb-6">
                Professional PDF tools powered by AI technology.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <Smartphone className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/tools" className="hover:text-white">PDF Tools</Link></li>
                <li><Link to="/advanced-tools" className="hover:text-white">Pro Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/api" className="hover:text-white">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PDFPet. All rights reserved. Made with ❤️ for document lovers.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ModernHome