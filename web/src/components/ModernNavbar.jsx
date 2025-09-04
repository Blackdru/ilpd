import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useSubscription } from '../contexts/SubscriptionContext'
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
  X,
  Home,
  LayoutDashboard,
  Zap,
  Crown,
  Bell,
  Search,
  CreditCard,
  ArrowUpCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const ModernNavbar = () => {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const isActivePath = (path) => location.pathname === path

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tools', label: 'Basic Tools', icon: GitMerge },
    { path: '/advanced-tools', label: 'Pro Tools', icon: Wand2, isPro: true },
  ]

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <motion.div 
                    className="absolute inset-0 bg-gradient-primary rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-300"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <div className="relative bg-gradient-primary p-3 rounded-2xl shadow-glow">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold gradient-text font-inter">
                    PDFPet
                  </span>
                  <span className="text-xs text-gray-500 -mt-1 font-medium">
                    Professional PDF Tools
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {user && navItems.map((item) => (
                <motion.div
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.path}
                    className={`relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 flex items-center space-x-2 ${
                      isActivePath(item.path)
                        ? 'text-white bg-gradient-primary shadow-glow'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.isPro && (
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles className="h-3 w-3 text-yellow-400" />
                      </motion.div>
                    )}
                    {isActivePath(item.path) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-primary rounded-xl -z-10"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}

              {/* Tools Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="ghost" 
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl px-4 py-2"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Quick Tools
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="start" 
                  className="w-64 dropdown-modern border-0 bg-white/95 backdrop-blur-xl shadow-modern-lg"
                >
                  <div className="p-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                      PDF Operations
                    </div>
                    <DropdownMenuItem 
                      onClick={() => navigate('/tools')}
                      className="dropdown-item-modern"
                    >
                      <GitMerge className="mr-3 h-4 w-4" />
                      <div>
                        <div className="font-medium">Merge PDFs</div>
                        <div className="text-xs text-gray-500">Combine multiple files</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/tools')}
                      className="dropdown-item-modern"
                    >
                      <Scissors className="mr-3 h-4 w-4" />
                      <div>
                        <div className="font-medium">Split PDFs</div>
                        <div className="text-xs text-gray-500">Extract pages</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/tools')}
                      className="dropdown-item-modern"
                    >
                      <Archive className="mr-3 h-4 w-4" />
                      <div>
                        <div className="font-medium">Compress PDFs</div>
                        <div className="text-xs text-gray-500">Reduce file size</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/tools')}
                      className="dropdown-item-modern"
                    >
                      <Image className="mr-3 h-4 w-4" />
                      <div>
                        <div className="font-medium">Convert Images</div>
                        <div className="text-xs text-gray-500">Images to PDF</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem 
                      onClick={() => navigate('/advanced-tools')}
                      className="dropdown-item-modern bg-gradient-to-r from-purple-50 to-pink-50"
                    >
                      <Crown className="mr-3 h-4 w-4 text-yellow-500" />
                      <div>
                        <div className="font-medium flex items-center">
                          Professional Tools
                          <Sparkles className="ml-2 h-3 w-3 text-yellow-500" />
                        </div>
                        <div className="text-xs text-gray-500">Advanced features</div>
                      </div>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Search Button */}
              {user && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl hover:bg-gray-100/80 text-gray-600 hover:text-gray-900"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {/* Notifications */}
              {user && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl hover:bg-gray-100/80 text-gray-600 hover:text-gray-900 relative"
                  >
                    <Bell className="h-4 w-4" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"
                    />
                  </Button>
                </motion.div>
              )}

              {/* Theme Toggle */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-10 w-10 rounded-xl hover:bg-gray-100/80 text-gray-600 hover:text-gray-900"
                >
                  <AnimatePresence mode="wait">
                    {theme === 'dark' ? (
                      <motion.div
                        key="sun"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Sun className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="moon"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Moon className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>

              {user ? (
                /* User Menu */
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="ghost" 
                        className="h-10 px-3 rounded-xl hover:bg-gray-100/80 flex items-center space-x-2"
                      >
                        <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="hidden sm:block text-left">
                          <div className="text-sm font-medium text-gray-900">
                            {user.user_metadata?.name || 'User'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.user_metadata?.role === 'admin' ? 'Administrator' : 'Member'}
                          </div>
                        </div>
                        <ChevronDown className="h-3 w-3 text-gray-500" />
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-64 dropdown-modern border-0 bg-white/95 backdrop-blur-xl shadow-modern-lg"
                  >
                    <div className="p-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.user_metadata?.name || user.email}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <DropdownMenuItem 
                        onClick={() => navigate('/dashboard')}
                        className="dropdown-item-modern"
                      >
                        <LayoutDashboard className="mr-3 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => navigate('/profile')}
                        className="dropdown-item-modern"
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        <span>Profile Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => navigate('/billing')}
                        className="dropdown-item-modern"
                      >
                        <CreditCard className="mr-3 h-4 w-4" />
                        <span>Billing & Usage</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => navigate('/upgrade')}
                        className="dropdown-item-modern bg-gradient-to-r from-purple-50 to-pink-50"
                      >
                        <ArrowUpCircle className="mr-3 h-4 w-4 text-purple-500" />
                        <div>
                          <div className="font-medium flex items-center">
                            Upgrade Plan
                            <Sparkles className="ml-2 h-3 w-3 text-purple-500" />
                          </div>
                          <div className="text-xs text-gray-500">Unlock more features</div>
                        </div>
                      </DropdownMenuItem>
                      {user.user_metadata?.role === 'admin' && (
                        <DropdownMenuItem 
                          onClick={() => navigate('/admin')}
                          className="dropdown-item-modern"
                        >
                          <Shield className="mr-3 h-4 w-4" />
                          <span>Admin Panel</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="my-2" />
                      <DropdownMenuItem 
                        onClick={handleSignOut}
                        className="dropdown-item-modern text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                /* Auth Buttons */
                <div className="flex items-center space-x-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" asChild className="rounded-xl">
                      <Link to="/login">Sign In</Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button asChild className="bg-gradient-primary hover:shadow-glow rounded-xl">
                      <Link to="/register">Get Started</Link>
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="h-10 w-10 rounded-xl hover:bg-gray-100/80"
                  >
                    <AnimatePresence mode="wait">
                      {isMobileMenuOpen ? (
                        <motion.div
                          key="close"
                          initial={{ rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <X className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="menu"
                          initial={{ rotate: 90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: -90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Menu className="h-4 w-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg md:hidden"
          >
            <div className="container mx-auto px-4 py-6">
              {user && (
                <div className="space-y-2 mb-6">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                          isActivePath(item.path)
                            ? 'text-white bg-gradient-primary shadow-glow'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                        {item.isPro && (
                          <Sparkles className="h-4 w-4 text-yellow-400" />
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {!user && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col space-y-3"
                >
                  <Button 
                    variant="ghost" 
                    asChild 
                    className="justify-start rounded-xl"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button 
                    asChild 
                    className="bg-gradient-primary hover:shadow-glow rounded-xl"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link to="/register">Get Started</Link>
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  )
}

export default ModernNavbar