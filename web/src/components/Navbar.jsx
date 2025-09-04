import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Button } from './ui/button'
import { 
  FileText, 
  Moon, 
  Sun, 
  User, 
  Settings, 
  LogOut,
  Shield,
  GitMerge,
  Scissors,
  Archive,
  Image,
  ChevronDown,
  Sparkles,
  Wand2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const Navbar = () => {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PDFPet
              </span>
              <span className="text-xs text-muted-foreground -mt-1">PDF Magic</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {user && (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-sm font-medium hover:text-primary">
                      Tools
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/tools')}>
                      <GitMerge className="mr-2 h-4 w-4" />
                      Basic Tools
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/advanced-tools')}>
                      <Wand2 className="mr-2 h-4 w-4" />
                      <span>Professional Tools</span>
                      <Sparkles className="ml-auto h-3 w-3 text-yellow-500" />
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/tools')}>
                      <GitMerge className="mr-2 h-4 w-4" />
                      Merge PDFs
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/tools')}>
                      <Scissors className="mr-2 h-4 w-4" />
                      Split PDFs
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/tools')}>
                      <Archive className="mr-2 h-4 w-4" />
                      Compress PDFs
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/tools')}>
                      <Image className="mr-2 h-4 w-4" />
                      Convert to PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {user ? (
              /* User Menu */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.user_metadata?.name || user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  {/* Show admin link if user has admin role */}
                  {user.user_metadata?.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Auth Buttons */
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar