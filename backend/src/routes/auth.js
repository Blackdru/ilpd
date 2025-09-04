const express = require('express');
const { supabase } = require('../config/supabase');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

// Register new user
router.post('/register', validateRequest(schemas.register), async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user profile in database
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            name,
            role: 'user'
          }
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Continue anyway, as the auth user was created successfully
      }
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
        name
      },
      session: authData.session
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', validateRequest(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Get user profile from database
    const { data: profile } = await supabase
      .from('users')
      .select('name, role')
      .eq('id', data.user.id)
      .single();

    res.json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name,
        role: profile?.role || 'user'
      },
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout user
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      message: 'Token refreshed successfully',
      session: data.session
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Google OAuth (initiate)
router.get('/google', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${req.protocol}://${req.get('host')}/api/auth/callback`
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.redirect(data.url);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: 'OAuth initialization failed' });
  }
});

// OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Create or update user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .upsert([
          {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email,
            role: 'user'
          }
        ]);

      if (profileError) {
        console.error('Profile upsert error:', profileError);
      }
    }

    // Redirect to frontend with session data
    const redirectUrl = process.env.NODE_ENV === 'production'
      ? 'https://your-domain.com/auth/callback'
      : 'http://localhost:3000/auth/callback';

    res.redirect(`${redirectUrl}?access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'OAuth callback failed' });
  }
});

module.exports = router;