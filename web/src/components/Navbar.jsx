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
  Wand2,
  Menu,
  X
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { useState } from 'react'

const Navbar = () => {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo - Responsive sizing */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-1.5 sm:p-2 rounded-lg">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PDFPet
              </span>
              <span className="text-xs text-muted-foreground -mt-1 hidden sm:block">PDF Magic</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6">
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

          {/* Right side - Mobile optimized */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Mobile Menu Button - Always show on mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-8 w-8 sm:h-9 sm:w-9 lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>

            {/* Desktop Only - Theme Toggle and User Menu */}
            <div className="hidden lg:flex items-center space-x-2">
              {/* Theme Toggle - Desktop */}
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
                /* User Menu - Desktop */
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium truncate">{user.user_metadata?.name || user.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
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
                /* Auth Buttons - Desktop */
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

        {/* Mobile Menu - Complete with all options */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-background/95 backdrop-blur animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {user ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-3 pb-3 border-b">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.user_metadata?.name || user.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-3">
                    <Link 
                      to="/dashboard" 
                      className="flex items-center text-sm font-medium hover:text-primary transition-colors py-3 px-3 rounded-lg hover:bg-muted/50 active:bg-muted"
                      onClick={closeMobileMenu}
                    >
                      <FileText className="mr-3 h-5 w-5" />
                      Dashboard
                    </Link>
                    
                    {/* Tools Section */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground px-3 uppercase tracking-wide">Tools</p>
                      <div className="space-y-1">
                        <Link 
                          to="/tools" 
                          className="flex items-center text-sm hover:text-primary transition-colors py-3 px-6 rounded-lg hover:bg-muted/50 active:bg-muted"
                          onClick={closeMobileMenu}
                        >
                          <GitMerge className="mr-3 h-5 w-5" />
                          <div className="flex-1">
                            <div className="font-medium">Basic Tools</div>
                            <div className="text-xs text-muted-foreground">Merge, Split, Compress</div>
                          </div>
                        </Link>
                        <Link 
                          to="/advanced-tools" 
                          className="flex items-center text-sm hover:text-primary transition-colors py-3 px-6 rounded-lg hover:bg-muted/50 active:bg-muted"
                          onClick={closeMobileMenu}
                        >
                          <Wand2 className="mr-3 h-5 w-5" />
                          <div className="flex-1">
                            <div className="font-medium flex items-center">
                              Professional Tools
                              <Sparkles className="ml-2 h-3 w-3 text-yellow-500" />
                            </div>
                            <div className="text-xs text-muted-foreground">Advanced OCR, AI Chat</div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Quick Tools */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground px-3 uppercase tracking-wide">Quick Actions</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Link 
                          to="/tools" 
                          className="flex flex-col items-center text-xs hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-muted/50 active:bg-muted"
                          onClick={closeMobileMenu}
                        >
                          <GitMerge className="h-5 w-5 mb-1" />
                          Merge PDFs
                        </Link>
                        <Link 
                          to="/tools" 
                          className="flex flex-col items-center text-xs hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-muted/50 active:bg-muted"
                          onClick={closeMobileMenu}
                        >
                          <Scissors className="h-5 w-5 mb-1" />
                          Split PDFs
                        </Link>
                        <Link 
                          to="/tools" 
                          className="flex flex-col items-center text-xs hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-muted/50 active:bg-muted"
                          onClick={closeMobileMenu}
                        >
                          <Archive className="h-5 w-5 mb-1" />
                          Compress
                        </Link>
                        <Link 
                          to="/tools" 
                          className="flex flex-col items-center text-xs hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-muted/50 active:bg-muted"
                          onClick={closeMobileMenu}
                        >
                          <Image className="h-5 w-5 mb-1" />
                          Convert
                        </Link>
                      </div>
                    </div>

                    {/* Settings & Account */}
                    <div className="pt-3 border-t space-y-1">
                      <p className="text-sm font-semibold text-muted-foreground px-3 uppercase tracking-wide">Account</p>
                      
                      <Link 
                        to="/profile" 
                        className="flex items-center text-sm hover:text-primary transition-colors py-3 px-3 rounded-lg hover:bg-muted/50 active:bg-muted"
                        onClick={closeMobileMenu}
                      >
                        <Settings className="mr-3 h-5 w-5" />
                        Profile & Settings
                      </Link>
                      
                      {user.user_metadata?.role === 'admin' && (
                        <Link 
                          to="/admin" 
                          className="flex items-center text-sm hover:text-primary transition-colors py-3 px-3 rounded-lg hover:bg-muted/50 active:bg-muted"
                          onClick={closeMobileMenu}
                        >
                          <Shield className="mr-3 h-5 w-5" />
                          Admin Panel
                        </Link>
                      )}
                      
                      {/* Theme Toggle */}
                      <button 
                        onClick={() => {
                          toggleTheme()
                          // Don't close menu for theme toggle
                        }}
                        className="flex items-center text-sm hover:text-primary transition-colors py-3 px-3 rounded-lg hover:bg-muted/50 active:bg-muted w-full text-left"
                      >
                        {theme === 'dark' ? (
                          <>
                            <Sun className="mr-3 h-5 w-5" />
                            Switch to Light Mode
                          </>
                        ) : (
                          <>
                            <Moon className="mr-3 h-5 w-5" />
                            Switch to Dark Mode
                          </>
                        )}
                      </button>
                      
                      <button 
                        onClick={() => {
                          handleSignOut()
                          closeMobileMenu()
                        }}
                        className="flex items-center text-sm text-red-600 hover:text-red-700 transition-colors py-3 px-3 rounded-lg hover:bg-red-50 active:bg-red-100 w-full text-left"
                      >
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Mobile Menu for Non-Authenticated Users */
                <div className="space-y-4">
                  {/* Welcome Section */}
                  <div className="text-center py-4">
                    <h3 className="text-lg font-semibold mb-2">Welcome to PDFPet</h3>
                    <p className="text-sm text-muted-foreground mb-4">Sign in to access powerful PDF tools</p>
                  </div>

                  {/* Auth Buttons */}
                  <div className="space-y-3">
                    <Link 
                      to="/login"
                      className="flex items-center justify-center text-sm font-medium py-3 px-4 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors w-full"
                      onClick={closeMobileMenu}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Sign In
                    </Link>
                    <Link 
                      to="/register"
                      className="flex items-center justify-center text-sm font-medium py-3 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-full"
                      onClick={closeMobileMenu}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Sign Up Free
                    </Link>
                  </div>

                  {/* Theme Toggle for Non-Auth Users */}
                  <div className="pt-3 border-t">
                    <button 
                      onClick={() => {
                        toggleTheme()
                        // Don't close menu for theme toggle
                      }}
                      className="flex items-center text-sm hover:text-primary transition-colors py-3 px-3 rounded-lg hover:bg-muted/50 active:bg-muted w-full text-left"
                    >
                      {theme === 'dark' ? (
                        <>
                          <Sun className="mr-3 h-5 w-5" />
                          Switch to Light Mode
                        </>
                      ) : (
                        <>
                          <Moon className="mr-3 h-5 w-5" />
                          Switch to Dark Mode
                        </>
                      )}
                    </button>
                  </div>

                  {/* Features Preview */}
                  <div className="pt-3 border-t">
                    <p className="text-sm font-semibold text-muted-foreground px-3 uppercase tracking-wide mb-3">Features</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col items-center text-xs text-muted-foreground py-3 px-2 rounded-lg bg-muted/30">
                        <GitMerge className="h-5 w-5 mb-1" />
                        Merge PDFs
                      </div>
                      <div className="flex flex-col items-center text-xs text-muted-foreground py-3 px-2 rounded-lg bg-muted/30">
                        <Scissors className="h-5 w-5 mb-1" />
                        Split PDFs
                      </div>
                      <div className="flex flex-col items-center text-xs text-muted-foreground py-3 px-2 rounded-lg bg-muted/30">
                        <Archive className="h-5 w-5 mb-1" />
                        Compress
                      </div>
                      <div className="flex flex-col items-center text-xs text-muted-foreground py-3 px-2 rounded-lg bg-muted/30">
                        <Wand2 className="h-5 w-5 mb-1" />
                        AI Tools
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar