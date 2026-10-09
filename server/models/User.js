const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String
  }, // optional — Google OAuth users have no password

  // 3 roles
  role: {
    type: String,
    enum: ['student', 'organizer', 'admin'],
    default: 'student',
  },

  // Profile
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  college: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  year: {
    type: String,
    default: ''
  },

  // Skills (for team finder)
  skills: {
    type: [String],
    default: []
  },
  upiId: {
    type: String,
    default: ''
  }, // ← ADD THIS

  // Google OAuth
  googleId: {
    type: String,
    default: ''
  },

  // Account status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Bookmarks
  bookmarkedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],

}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);