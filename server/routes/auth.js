const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
const User = require('../models/User');
const auth = require('../middleware/auth');

// ── Email transporter ────────────────────────────────────
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// ── Helper: sign JWT ─────────────────────────────────────
const signToken = (id) =>
  jwt.sign({
    id
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ── Helper: send token response ──────────────────────────
const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

// ─── POST /api/auth/register ─────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role
    } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({
        msg: 'Please fill all fields'
      });

    if (password.length < 6)
      return res.status(400).json({
        msg: 'Password must be at least 6 characters'
      });

    // Only allow student or organizer on register
    // admin is set manually in DB
    const allowedRoles = ['student', 'organizer'];
    const userRole = allowedRoles.includes(role) ? role : 'student';

    const existing = await User.findOne({
      email
    });
    if (existing)
      return res.status(400).json({
        msg: 'Email already registered'
      });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: userRole,
    });

    sendToken(user, 201, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

// ─── POST /api/auth/login ────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password)
      return res.status(400).json({
        msg: 'Please fill all fields'
      });

    const user = await User.findOne({
      email
    });
    if (!user || !user.password)
      return res.status(400).json({
        msg: 'Invalid email or password'
      });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({
        msg: 'Invalid email or password'
      });

    if (!user.isActive)
      return res.status(403).json({
        msg: 'Account suspended. Contact support.'
      });

    sendToken(user, 200, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

// ─── GET /api/auth/me ────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('bookmarkedEvents', 'title banner date');
    res.json(user);
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});
 
// ─── PUT /api/auth/update-profile ────────────────────────
router.put('/update-profile', auth, async (req, res) => {
  try {
    const {
      name,
      phone,
      bio,
      college,
      department,
      year,
      skills,
      upiId
    } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id, {
        name,
        phone,
        bio,
        college,
        department,
        year,
        skills,
        upiId
      }, {
        new: true
      }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

module.exports = router;