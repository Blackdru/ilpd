import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useSubscription } from '../contexts/SubscriptionContext'
import UsageIndicator from '../components/subscription/UsageIndicator'
import BillingHistory from '../components/subscription/BillingHistory'
import SubscriptionModal from '../components/subscription/SubscriptionModal'
import CancelSubscription from '../components/subscription/CancelSubscription'
import { 
  CreditCard, 
  Calendar, 
  Settings, 
  Crown,
  AlertCircle,
  CheckCircle,
  ArrowUpCircle
} from 'lucide-react'

const Billing = () => {
  const { 
    subscription, 
    loading, 
    isActive, 
    isCancelledButActive, 
    getPlanDisplayName 
  } = useSubscription()
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = () => {
    if (!subscription) return null
    
    if (isCancelledButActive()) {
      return <Badge variant="destructive">Cancelling</Badge>
    }
    
    switch (subscription.status) {
      case 'active':
        return <Badge variant="default">Active</Badge>
      case 'trialing':
        return <Badge variant="secondary">Trial</Badge>
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>
      case 'expired':
        return <Badge variant="outline">Expired</Badge>
      default:
        return <Badge variant="outline">{subscription.status}</Badge>
    }
  }

  const getPlanIcon = () => {
    if (!subscription) return <CreditCard className="h-5 w-5" />
    
    switch (subscription.plan) {
      case 'premium':
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 'pro':
        return <ArrowUpCircle className="h-5 w-5 text-purple-500" />
      default:
        return <CreditCard className="h-5 w-5 text-blue-500" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground mt-2">
            Manage your subscription, view usage, and billing history
          </p>
        </div>

        {/* Current Subscription Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getPlanIcon()}
              Current Plan
              {getStatusBadge()}
            </CardTitle>
            <CardDescription>
              Your current subscription details and status
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{getPlanDisplayName()} Plan</h3>
                <p className="text-2xl font-bold">
                  {subscription?.planLimits?.price === 0 ? (
                    'Free'
                  ) : (
                    `$${subscription?.planLimits?.price}/month`
                  )}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Billing Cycle
                </h4>
                <p className="text-sm text-muted-foreground">
                  {subscription?.current_period_end ? (
                    <>
                      Next billing: {formatDate(subscription.current_period_end)}
                    </>
                  ) : (
                    'No billing cycle'
                  )}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Status
                </h4>
                <div className="flex items-center gap-2">
                  {isActive() ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {isActive() ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Cancellation Notice */}
            {isCancelledButActive() && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Subscription Ending</span>
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  Your subscription will end on {formatDate(subscription?.current_period_end)}. 
                  You can reactivate it anytime before then.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowUpgradeModal(true)}
                className="flex items-center gap-2"
              >
                <ArrowUpCircle className="h-4 w-4" />
                {subscription?.plan === 'free' ? 'Upgrade Plan' : 'Change Plan'}
              </Button>
              
              {subscription?.plan !== 'free' && isActive() && (
                <Button 
                  variant="outline"
                  onClick={() => setShowCancelModal(true)}
                >
                  {isCancelledButActive() ? 'Manage Cancellation' : 'Cancel Subscription'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Usage and Billing */}
        <Tabs defaultValue="usage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
            <TabsTrigger value="history">Billing History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="usage" className="space-y-6">
            <UsageIndicator />
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <BillingHistory />
          </TabsContent>
        </Tabs>

        {/* Plan Features */}
        {subscription?.planLimits && (
          <Card>
            <CardHeader>
              <CardTitle>Plan Features</CardTitle>
              <CardDescription>
                What's included in your {getPlanDisplayName()} plan
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subscription.planLimits.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm capitalize">
                      {feature.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <SubscriptionModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
      
      <CancelSubscription
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
      />
    </div>
  )
}

export default Billing