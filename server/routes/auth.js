const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendOTPEmail, sendWelcomeEmail } = require('../utils/mailer');

// Helper to generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, password, name, email, department } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (user) {
      if (!user.isVerified) {
        // Resend OTP if user exists but not verified
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        // Update password/details just in case they re-submitted
        user.password = password;
        user.name = name;
        user.department = department;
        await user.save();
        
        console.log(`[AUTH] Signup OTP for ${user.username} (${user.email}): ${otp}`);
        try {
          await sendOTPEmail(user.email, user.name, otp);
        } catch (mailErr) {
          console.error('Failed to send OTP email:', mailErr);
        }
        return res.json({ message: 'OTP sent to your email.', requireOtp: true, email: user.email });
      }
      return res.status(400).json({ message: 'User already exists and is verified.' });
    }

    // Create new user
    const otp = generateOTP();
    user = new User({
      username,
      password,
      name,
      email,
      department: department || 'CSE',
      role: 'deo', // Default role
      isVerified: false,
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    await user.save();
    
    // Send OTP email
    console.log(`[AUTH] Signup OTP for ${user.username} (${user.email}): ${otp}`);
    try {
      await sendOTPEmail(user.email, user.name, otp);
    } catch (mailErr) {
      console.error('Failed to send OTP email:', mailErr);
    }
    res.json({ message: 'OTP sent to your email.', requireOtp: true, email: user.email });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found.' });
    
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    
    const wasUnverified = !user.isVerified;

    // Verify user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Send welcome email only on first verification
    if (wasUnverified) {
      sendWelcomeEmail(user.email, user.name, user.username).catch(err => console.error('Welcome email error:', err));
    }
    
    // Generate token and login automatically
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      message: wasUnverified ? 'Email verified successfully!' : 'Login successful!',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        department: user.department,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    // can login with username or email
    const user = await User.findOne({ 
      $or: [{ username }, { email: username.toLowerCase() }] 
    });
    
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Enforce OTP for every login step
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    
    // Log OTP to console to help with demo accounts testing
    console.log(`[AUTH] Login OTP for ${user.username} (${user.email}): ${otp}`);
    
    try {
      await sendOTPEmail(user.email, user.name, otp);
    } catch (mailErr) {
      console.error('Failed to send OTP email:', mailErr);
      // We still return requireOtp so the UI progresses, even if email failed (useful for debug demo accounts)
    }

    return res.json({ 
      message: user.isVerified ? 'OTP sent to your email to complete sign in.' : 'Email not verified. A new OTP has been sent.', 
      requireOtp: true, 
      email: user.email 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
const { auth } = require('../middleware/auth');
router.get('/me', auth, (req, res) => {
  res.json(req.user);
});

module.exports = router;
