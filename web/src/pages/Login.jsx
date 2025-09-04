import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { FileText, Mail, Lock, Chrome, ArrowRight, Sparkles, Heart } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/tools'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await signIn(email, password)
    
    if (!error) {
      navigate(from, { replace: true })
    }
    
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    await signInWithGoogle()
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-r from-pink-400 to-yellow-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center mb-8 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl">
                <FileText className="h-12 w-12 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PDFPet
              </h1>
              <div className="flex items-center justify-center mt-1">
                <Heart className="h-3 w-3 text-red-500 mr-1" />
                <span className="text-xs text-muted-foreground">Your PDF companion</span>
              </div>
            </div>
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">
            Sign in to continue your PDF magic journey
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10 h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <Chrome className="mr-2 h-5 w-5 text-red-500" />
              Continue with Google
            </Button>

            <div className="text-center space-y-4">
              <Link 
                to="/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
              >
                Forgot your password?
              </Link>
              
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-primary">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline hover:text-primary">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login