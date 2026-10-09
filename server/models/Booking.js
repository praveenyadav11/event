const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  // References
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Ticket details
  ticketTier: {
    type: String,
    required: true
  }, // tier name e.g. "General"
  ticketPrice: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  totalAmount: {
    type: Number,
    required: true
  },

  // QR & ticket
  bookingRef: {
    type: String,
    unique: true
  }, // e.g. "EF-2024-ABC123"
  qrCode: {
    type: String,
    default: ''
  }, // base64 QR image

  // Payment
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'free'],
    default: 'pending',
  },
  razorpayOrderId: {
    type: String,
    default: ''
  },
  razorpayPaymentId: {
    type: String,
    default: ''
  },
  razorpaySignature: {
    type: String,
    default: ''
  },

  // Check-in
  isCheckedIn: {
    type: Boolean,
    default: false
  },
  checkedInAt: {
    type: Date
  },
  checkedInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'cancelled', 'used'],
    default: 'active',
  },
  cancelledAt: {
    type: Date
  },

}, {
  timestamps: true
});

// Generate booking reference before saving
// ADD THIS instead — no hook needed:
BookingSchema.path('bookingRef').default(() => {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `EF-${new Date().getFullYear()}-${rand}`;
});
module.exports = mongoose.model('Booking', BookingSchema);