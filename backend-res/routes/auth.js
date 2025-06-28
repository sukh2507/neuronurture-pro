const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = require('../middleware/auth');
// const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// jwt secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// generate jwt token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// register route
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    //  if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // create new user
    const user = new User({
      email,
      password,
      role: role || 'mother',
      needsChoice: role === 'mother' // set needschoice for mothers
    });

    await user.save();

    // generate token
    const token = generateToken(user._id);

    // return user data (without password)
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      needsChoice: user.needsChoice,
      createdAt: user.createdAt
    };

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // generate token
    const token = generateToken(user._id);

    // return user data (without password)
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      needsChoice: user.needsChoice,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// get user profile (protected route)

router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        needsChoice: req.user.needsChoice,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Me Route - Check current user authentication
router.get('/me', auth, async (req, res) => {
  try {
    const userData = {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      needsChoice: req.user.needsChoice,
      createdAt: req.user.createdAt
    };

    res.json({
      user: userData
    });

  } catch (error) {
    console.error('Me route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile (protected route)

router.put('/profile', auth, async (req, res) => {
  try {
    const { needsChoice } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { needsChoice },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        needsChoice: user.needsChoice,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// logout route 
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;