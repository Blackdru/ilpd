import { useState } from 'react'
import { Check, Crown, Zap, Star } from 'lucide-react'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'

const PlanCard = ({ plan, isCurrentPlan = false, onSelectPlan }) => {
  const [loading, setLoading] = useState(false)
  const { subscription, isActive } = useSubscription()

  const handleSelectPlan = async () => {
    if (loading || isCurrentPlan) return
    
    setLoading(true)
    try {
      await onSelectPlan(plan.id)
    } finally {
      setLoading(false)
    }
  }

  const getPlanIcon = () => {
    switch (plan.id) {
      case 'free':
        return <Star className="h-6 w-6 text-blue-500" />
      case 'pro':
        return <Zap className="h-6 w-6 text-purple-500" />
      case 'premium':
        return <Crown className="h-6 w-6 text-yellow-500" />
      default:
        return <Star className="h-6 w-6" />
    }
  }

  const getPlanColor = () => {
    switch (plan.id) {
      case 'free':
        return 'border-blue-200 hover:border-blue-300'
      case 'pro':
        return 'border-purple-200 hover:border-purple-300 shadow-lg'
      case 'premium':
        return 'border-yellow-200 hover:border-yellow-300 shadow-xl'
      default:
        return 'border-gray-200 hover:border-gray-300'
    }
  }

  const getButtonVariant = () => {
    if (isCurrentPlan) return 'secondary'
    switch (plan.id) {
      case 'free':
        return 'outline'
      case 'pro':
        return 'default'
      case 'premium':
        return 'default'
      default:
        return 'outline'
    }
  }

  const canUpgrade = () => {
    if (!subscription) return plan.id !== 'free'
    
    const planHierarchy = { free: 0, pro: 1, premium: 2 }
    const currentLevel = planHierarchy[subscription.plan] || 0
    const targetLevel = planHierarchy[plan.id] || 0
    
    return targetLevel > currentLevel
  }

  const canDowngrade = () => {
    if (!subscription) return false
    
    const planHierarchy = { free: 0, pro: 1, premium: 2 }
    const currentLevel = planHierarchy[subscription.plan] || 0
    const targetLevel = planHierarchy[plan.id] || 0
    
    return targetLevel < currentLevel
  }

  return (
    <Card className={`relative transition-all duration-200 ${getPlanColor()}`}>
      {plan.id === 'pro' && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-500 hover:bg-purple-600">
          Most Popular
        </Badge>
      )}
      
      {plan.id === 'premium' && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 hover:bg-yellow-600">
          Best Value
        </Badge>
      )}

      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-2">
          {getPlanIcon()}
        </div>
        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
        <CardDescription className="text-lg">
          {plan.price === 0 ? (
            <span className="text-2xl font-bold">Free</span>
          ) : (
            <>
              <span className="text-3xl font-bold">${plan.price}</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm">
              {plan.filesPerMonth === -1 ? 'Unlimited' : plan.filesPerMonth.toLocaleString()} files per month
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm">
              {plan.maxFileSize === -1 ? 'Unlimited' : `${Math.round(plan.maxFileSize / 1024 / 1024)}MB`} max file size
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm">
              {plan.storageLimit === -1 ? 'Unlimited' : 
               plan.storageLimit >= 1024 * 1024 * 1024 ? 
               `${Math.round(plan.storageLimit / 1024 / 1024 / 1024)}GB` : 
               `${Math.round(plan.storageLimit / 1024 / 1024)}MB`} storage
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm">
              {plan.aiOperations === -1 ? 'Unlimited' : plan.aiOperations.toLocaleString()} AI operations
            </span>
          </div>

          {plan.apiCalls > 0 && (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                {plan.apiCalls === -1 ? 'Unlimited' : plan.apiCalls.toLocaleString()} API calls
              </span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Features included:</p>
          <div className="space-y-1">
            {plan.features.slice(0, 4).map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-500" />
                <span className="text-xs capitalize">
                  {feature.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
            {plan.features.length > 4 && (
              <div className="text-xs text-muted-foreground">
                +{plan.features.length - 4} more features
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={getButtonVariant()}
          onClick={handleSelectPlan}
          disabled={loading || isCurrentPlan}
        >
          {loading ? (
            'Processing...'
          ) : isCurrentPlan ? (
            'Current Plan'
          ) : canUpgrade() ? (
            `Upgrade to ${plan.name}`
          ) : canDowngrade() ? (
            `Downgrade to ${plan.name}`
          ) : (
            `Select ${plan.name}`
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default PlanCard