import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useSubscription } from '../contexts/SubscriptionContext'
import PlanCard from '../components/subscription/PlanCard'
import SubscriptionModal from '../components/subscription/SubscriptionModal'
import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Crown,
  ArrowLeft,
  Sparkles
} from 'lucide-react'

const Upgrade = () => {
  const navigate = useNavigate()
  const { plans, subscription, loading } = useSubscription()
  const [showModal, setShowModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId)
    setShowModal(true)
  }

  const getCurrentPlanId = () => {
    return subscription?.plan || 'free'
  }

  // Plan comparison data
  const comparisonFeatures = [
    {
      feature: 'Files per month',
      free: '10',
      pro: '1,000',
      premium: 'Unlimited'
    },
    {
      feature: 'Max file size',
      free: '10 MB',
      pro: '100 MB',
      premium: '500 MB'
    },
    {
      feature: 'Storage',
      free: '100 MB',
      pro: '5 GB',
      premium: '50 GB'
    },
    {
      feature: 'AI Operations',
      free: '5',
      pro: '500',
      premium: 'Unlimited'
    },
    {
      feature: 'API Access',
      free: false,
      pro: true,
      premium: true
    },
    {
      feature: 'Batch Processing',
      free: 'Single files',
      pro: 'Up to 50 files',
      premium: 'Unlimited'
    },
    {
      feature: 'OCR Processing',
      free: '5 pages',
      pro: '100 pages',
      premium: 'Unlimited'
    },
    {
      feature: 'PDF Chat',
      free: '10 messages',
      pro: '500 messages',
      premium: 'Unlimited'
    },
    {
      feature: 'Priority Support',
      free: false,
      pro: false,
      premium: true
    },
    {
      feature: 'Advanced Analytics',
      free: false,
      pro: false,
      premium: true
    }
  ]

  const renderFeatureValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-4 w-4 text-green-500 mx-auto" />
      ) : (
        <X className="h-4 w-4 text-gray-300 mx-auto" />
      )
    }
    return <span className="text-sm">{value}</span>
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            <h1 className="text-4xl font-bold">Choose Your Plan</h1>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full potential of PDFPet with advanced features, 
            higher limits, and priority support
          </p>
          
          {subscription && (
            <Badge variant="outline" className="text-sm">
              Currently on {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} plan
            </Badge>
          )}
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={plan.id === getCurrentPlanId()}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </div>

        {/* Feature Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Detailed Feature Comparison</CardTitle>
            <CardDescription className="text-center">
              Compare all features across our plans
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Feature</th>
                    <th className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Star className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Free</span>
                      </div>
                    </th>
                    <th className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">Pro</span>
                        <Badge className="ml-1 bg-purple-500">Popular</Badge>
                      </div>
                    </th>
                    <th className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">Premium</span>
                        <Badge className="ml-1 bg-yellow-500">Best Value</Badge>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{row.feature}</td>
                      <td className="py-3 px-4 text-center">
                        {renderFeatureValue(row.free)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {renderFeatureValue(row.pro)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {renderFeatureValue(row.premium)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold">Can I change plans anytime?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. 
                  Changes take effect immediately with prorated billing.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">What happens to my files if I downgrade?</h4>
                <p className="text-sm text-muted-foreground">
                  Your files remain safe. You'll just have lower monthly limits 
                  for new operations going forward.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Is there a free trial?</h4>
                <p className="text-sm text-muted-foreground">
                  All paid plans come with a 7-day free trial. 
                  Cancel anytime during the trial with no charges.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">How secure is my data?</h4>
                <p className="text-sm text-muted-foreground">
                  We use enterprise-grade security with end-to-end encryption. 
                  Your files are processed securely and never shared.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center space-y-4 py-8">
          <h2 className="text-2xl font-bold">Ready to get started?</h2>
          <p className="text-muted-foreground">
            Join thousands of users who trust PDFPet for their document processing needs
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              size="lg"
              onClick={() => handleSelectPlan('pro')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Start Pro Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => handleSelectPlan('premium')}
            >
              Go Premium
            </Button>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialTab="plans"
      />
    </div>
  )
}

export default Upgrade