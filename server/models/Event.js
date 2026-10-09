const mongoose = require('mongoose');

const TicketTierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }, // "General", "VIP", "Early Bird"
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true
  },
  sold: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  perks: {
    type: [String],
    default: []
  }, // ["Free T-shirt", "Front row"]
});

const SpeakerSchema = new mongoose.Schema({
  name: {
    type: String
  },
  role: {
    type: String
  },
  avatar: {
    type: String,
    default: ''
  },
});

const ScheduleSchema = new mongoose.Schema({
  time: {
    type: String
  },
  title: {
    type: String
  },
  description: {
    type: String,
    default: ''
  },
  speaker: {
    type: String,
    default: ''
  },
});

const EventSchema = new mongoose.Schema({
  // Basic
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Tech', 'Music', 'Sports', 'Art', 'Business', 'Food', 'Health', 'Comedy', 'Other'],
    required: true,
  },
  tags: {
    type: [String],
    default: []
  },

  // Media
  banner: {
    type: String,
    default: ''
  },

  // Date & Venue
  date: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  venue: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    required: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  onlineLink: {
    type: String,
    default: ''
  },
  coordinates: {
    lat: {
      type: Number
    },
    lng: {
      type: Number
    },
  },

  // Tickets
  ticketTiers: [TicketTierSchema],
  capacity: {
    type: Number,
    required: true
  },
  bookedCount: {
    type: Number,
    default: 0
  },
  isFree: {
    type: Boolean,
    default: false
  },

  // Content
  speakers: [SpeakerSchema],
  schedule: [ScheduleSchema],
  teamSize: {
    type: Number,
    default: 1
  }, // for team events

  // Meta
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  isApproved: {
    type: Boolean,
    default: true
  }, // admin approval (future)
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },

  // Bookmarks
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
}, {
  timestamps: true
});

// Virtual: tickets available
EventSchema.virtual('spotsLeft').get(function () {
  return this.capacity - this.bookedCount;
});

// Text search index
EventSchema.index({
  title: 'text',
  description: 'text',
  location: 'text',
  tags: 'text'
});

module.exports = mongoose.model('Event', EventSchema);