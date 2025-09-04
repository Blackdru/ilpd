import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { formatFileSize, formatDate } from '../lib/utils'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  User, 
  Mail, 
  Calendar,
  Activity,
  HardDrive,
  Files,
  Save,
  Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [profile, setProfile] = useState({
    name: '',
    email: ''
  })
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfileData()
  }, [user])

  const loadProfileData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const [profileResponse, statsResponse, historyResponse] = await Promise.all([
        api.getProfile(),
        api.getUserStats(),
        api.getUserHistory(1, 10)
      ])
      
      setProfile({
        name: profileResponse.user.name || '',
        email: profileResponse.user.email || ''
      })
      setStats(statsResponse.stats)
      setHistory(historyResponse.history)
    } catch (error) {
      toast.error('Failed to load profile data')
      console.error('Profile load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    })
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      await api.updateProfile(profile)
      
      // Also update in Supabase Auth if needed
      if (profile.name !== user.user_metadata?.name) {
        await updateProfile({
          data: { name: profile.name }
        })
      }
      
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
      console.error('Profile update error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your files and data.'
    )
    
    if (!confirmed) return

    const doubleConfirm = window.prompt(
      'Type "DELETE" to confirm account deletion:'
    )
    
    if (doubleConfirm !== 'DELETE') {
      toast.error('Account deletion cancelled')
      return
    }

    try {
      await api.deleteAccount()
      toast.success('Account deleted successfully')
      // The auth context will handle the redirect
    } catch (error) {
      toast.error('Failed to delete account')
      console.error('Account deletion error:', error)
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
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and view your activity
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="stats">
            <Activity className="mr-2 h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="history">
            <Calendar className="mr-2 h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={profile.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profile.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  className="w-full md:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  This action cannot be undone. All your files and data will be permanently deleted.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                  <Files className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalFiles}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.filesLimit - stats.totalFiles} remaining
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
                    of {formatFileSize(stats.storageLimit)} used
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.recentActivity}</div>
                  <p className="text-xs text-muted-foreground">
                    operations this month
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Activity History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent file operations and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No activity yet</h3>
                  <p className="text-muted-foreground">
                    Your file operations will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div>
                          <p className="font-medium capitalize">
                            {item.action} operation
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Profile