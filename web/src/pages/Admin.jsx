import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { formatFileSize, formatDate } from '../lib/utils'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  Users, 
  Activity, 
  HardDrive,
  Search,
  Shield,
  Trash2,
  Eye,
  MoreHorizontal,
  TrendingUp,
  Database
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import toast from 'react-hot-toast'

const Admin = () => {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [activity, setActivity] = useState([])
  const [storageUsage, setStorageUsage] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      const [statsResponse, usersResponse, activityResponse, storageResponse] = await Promise.all([
        api.getAdminStats(),
        api.getUsers(1, 20),
        api.getAdminActivity(1, 20),
        api.getStorageUsage()
      ])
      
      setStats(statsResponse.stats)
      setUsers(usersResponse.users)
      setActivity(activityResponse.activity)
      setStorageUsage(storageResponse.storageByUser)
    } catch (error) {
      toast.error('Failed to load admin data')
      console.error('Admin data load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchUsers = async () => {
    try {
      const response = await api.getUsers(1, 20, searchTerm)
      setUsers(response.users)
    } catch (error) {
      toast.error('Search failed')
    }
  }

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole)
      toast.success('User role updated successfully')
      loadAdminData()
    } catch (error) {
      toast.error('Failed to update user role')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      await api.deleteUser(userId)
      toast.success('User deleted successfully')
      loadAdminData()
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, monitor system activity, and view analytics
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.newUsersThisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFiles}</div>
              <p className="text-xs text-muted-foreground">
                Files uploaded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatFileSize(stats.totalStorage)}</div>
              <p className="text-xs text-muted-foreground">
                Total storage
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentActivity}</div>
              <p className="text-xs text-muted-foreground">
                Operations (30 days)
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="mr-2 h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="storage">
            <HardDrive className="mr-2 h-4 w-4" />
            Storage
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage all registered users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearchUsers}>Search</Button>
              </div>

              {/* Users List */}
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {formatDate(user.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {user.role}
                      </span>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleUpdateUserRole(
                              user.id, 
                              user.role === 'admin' ? 'user' : 'admin'
                            )}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
              <CardDescription>
                Recent user activities and operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="font-medium">
                          {item.users?.name || 'Unknown User'} performed {item.action}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.files?.filename || 'File operation'}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Storage Usage</CardTitle>
              <CardDescription>
                Storage usage by user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {storageUsage.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <HardDrive className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium">{formatFileSize(user.totalStorage)}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.fileCount} files
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Admin