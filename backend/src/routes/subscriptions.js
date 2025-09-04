const express = require('express')
const router = express.Router()

// Get subscription plans
router.get('/plans', (req, res) => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: ['Basic PDF tools', '5 files/month', '100MB storage']
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9.99,
      features: ['All PDF tools', 'Unlimited files', '10GB storage', 'AI features']
    }
  ]
  
  res.json({ plans })
})

// Get current subscription
router.get('/current', (req, res) => {
  res.json({ subscription: null })
})

// Get usage statistics
router.get('/usage', (req, res) => {
  res.json({
    usage: {
      files_processed: 0,
      storage_used: 0,
      ai_operations: 0,
      api_calls: 0
    }
  })
})

// Get billing history
router.get('/billing-history', (req, res) => {
  res.json({ history: [] })
})

// Create subscription
router.post('/create', (req, res) => {
  const { plan } = req.body
  
  if (plan === 'free') {
    res.json({ success: true, message: 'Free plan activated' })
  } else {
    res.json({ 
      success: true, 
      clientSecret: 'pi_test_client_secret',
      subscriptionId: 'sub_test_id'
    })
  }
})

// Cancel subscription
router.post('/cancel', (req, res) => {
  res.json({ success: true, message: 'Subscription cancelled' })
})

// Reactivate subscription
router.post('/reactivate', (req, res) => {
  res.json({ success: true, message: 'Subscription reactivated' })
})

// Update plan
router.put('/plan', (req, res) => {
  res.json({ success: true, message: 'Plan updated' })
})

module.exports = router