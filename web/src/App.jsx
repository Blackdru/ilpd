import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'

// Pages
import Home from './pages/Home'
import ModernHome from './pages/ModernHome'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ModernDashboard from './pages/ModernDashboard'
import Tools from './pages/Tools'
import AdvancedTools from './pages/AdvancedTools'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import Billing from './pages/Billing'
import Upgrade from './pages/Upgrade'

// Components
import Navbar from './components/Navbar'
import ModernNavbar from './components/ModernNavbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <Router>
          <div className="min-h-screen bg-background font-inter">
            <ModernNavbar />
            <main>
              <Routes>
                <Route path="/" element={<ModernHome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <ModernDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tools" 
                  element={
                    <ProtectedRoute>
                      <Tools />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/advanced-tools" 
                  element={
                    <ProtectedRoute>
                      <AdvancedTools />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/billing" 
                  element={
                    <ProtectedRoute>
                      <Billing />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/upgrade" 
                  element={
                    <ProtectedRoute>
                      <Upgrade />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <AdminRoute>
                      <Admin />
                    </AdminRoute>
                  } 
                />
              </Routes>
            </main>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </div>
          </Router>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App