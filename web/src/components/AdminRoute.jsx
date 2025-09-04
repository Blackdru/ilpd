import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check if user has admin role
  const isAdmin = user.user_metadata?.role === 'admin'
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default AdminRoute