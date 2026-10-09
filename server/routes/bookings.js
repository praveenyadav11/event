const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// ─── GET /api/bookings/my-tickets ────────────────────────
router.get('/my-tickets', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({
        user: req.user.id
      })
      .populate('event', 'title banner date location category organizer')
      .sort({
        createdAt: -1
      });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

// ─── GET /api/bookings/:id ────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event', 'title banner date location venue category organizer')
      .populate('user', 'name email');

    if (!booking) return res.status(404).json({
      msg: 'Booking not found'
    });

    // Only owner or organizer can view
    if (booking.user._id.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'organizer')
      return res.status(403).json({
        msg: 'Not authorized'
      });

    res.json(booking);
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

// ─── GET /api/bookings/event/:eventId ─ all bookings for an event
router.get('/event/:eventId', auth, roleCheck('organizer', 'admin'), async (req, res) => {
  try {
    const bookings = await Booking.find({
        event: req.params.eventId
      })
      .populate('user', 'name email phone')
      .sort({
        createdAt: -1
      });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

// ─── POST /api/bookings/:id/cancel ───────────────────────
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({
      msg: 'Booking not found'
    });

    if (booking.user.toString() !== req.user.id)
      return res.status(403).json({
        msg: 'Not authorized'
      });

    if (booking.status === 'cancelled')
      return res.status(400).json({
        msg: 'Already cancelled'
      });

    if (booking.isCheckedIn)
      return res.status(400).json({
        msg: 'Cannot cancel after check-in'
      });

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    // Restore event capacity
    const event = await Event.findById(booking.event);
    if (event) {
      event.bookedCount = Math.max(0, event.bookedCount - booking.quantity);
      const tier = event.ticketTiers.find(t => t.name === booking.ticketTier);
      if (tier) tier.sold = Math.max(0, tier.sold - booking.quantity);
      await event.save();
    }

    res.json({
      msg: 'Booking cancelled successfully'
    });
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

module.exports = router;