import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { 
  FileText, 
  GitMerge, 
  Scissors, 
  Archive, 
  Image,
  Shield,
  Zap,
  Cloud,
  Sparkles,
  ArrowRight,
  Star,
  Users,
  Download,
  Heart,
  CheckCircle
} from 'lucide-react'

const Home = () => {
  const { user } = useAuth()

  const features = [
    {
      icon: <GitMerge className="h-12 w-12" />,
      title: "Merge PDFs",
      description: "Combine multiple PDF files into one document seamlessly",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20"
    },
    {
      icon: <Scissors className="h-12 w-12" />,
      title: "Split PDFs",
      description: "Extract specific pages or split PDFs into separate files",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20"
    },
    {
      icon: <Archive className="h-12 w-12" />,
      title: "Compress PDFs",
      description: "Reduce file size while maintaining perfect quality",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
    },
    {
      icon: <Image className="h-12 w-12" />,
      title: "Convert Files",
      description: "Transform images, Word, and Excel files to PDF format",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20"
    }
  ]

  const benefits = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Bank-Level Security",
      description: "Your files are encrypted and automatically deleted after processing"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description: "Process files in seconds with our optimized algorithms"
    },
    {
      icon: <Cloud className="h-8 w-8" />,
      title: "Cloud Powered",
      description: "Access your files anywhere, anytime with cloud storage"
    }
  ]

  const stats = [
    { number: "1M+", label: "Files Processed" },
    { number: "50K+", label: "Happy Users" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ]

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-background via-background to-muted/30">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-yellow-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-r from-green-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            {/* Logo */}
            <div className="flex justify-center items-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl">
                  <FileText className="h-16 w-16 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PDFPet
                </h1>
                <div className="flex items-center justify-center mt-2">
                  <Heart className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-muted-foreground">Your PDF companion</span>
                </div>
              </div>
            </div>

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Transform PDFs
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Like Magic ✨
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              The most beautiful and powerful PDF toolkit. Merge, split, compress, and convert your files with just a few clicks.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {user ? (
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                  <Link to="/tools">
                    Go to PDF Tools
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                    <Link to="/register">
                      <Sparkles className="mr-2 h-5 w-5" />
                      Start Free Today
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="px-8 py-4 text-lg rounded-full border-2 hover:bg-muted/50 transition-all duration-300" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 mb-6">
              <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-600">Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything you need for
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> PDF magic</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional-grade PDF tools that are simple enough for everyone to use
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${feature.bgColor}`}>
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                <CardHeader className="text-center pb-4">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} text-white mb-4 mx-auto shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-muted/30 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why developers and businesses
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> love PDFPet</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built with modern technology and security best practices
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg group-hover:shadow-xl transition-all duration-300 mb-6 border border-gray-100 dark:border-gray-700">
                  <div className="text-blue-600">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">{benefit.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/5 rounded-full blur-2xl"></div>
        </div>
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm mb-8">
            <Star className="h-5 w-5 text-yellow-300 mr-2" />
            <span className="text-sm font-medium">Join thousands of satisfied users</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to transform your PDFs?
          </h2>
          <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto">
            Start using PDFPet today and experience the most beautiful PDF toolkit ever created.
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                <Link to="/register">
                  <Download className="mr-2 h-5 w-5" />
                  Get Started Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-full backdrop-blur-sm transition-all duration-300" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home