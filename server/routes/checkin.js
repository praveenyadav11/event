const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// ─── POST /api/checkin/scan ───────────────────────────────
// Validates QR and marks attendee as checked in
router.post('/scan', auth, roleCheck('organizer', 'admin'), async (req, res) => {
  try {
    const {
      qrData,
      eventId
    } = req.body;

    // Parse QR data
    let parsed;
    try {
      parsed = JSON.parse(qrData);
    } catch {
      return res.status(400).json({
        success: false,
        msg: 'Invalid QR code',
        type: 'invalid',
      });
    }

    const {
      bookingRef,
      eventId: qrEventId
    } = parsed;

    if (!bookingRef) return res.status(400).json({
      success: false,
      msg: 'Invalid QR code format',
      type: 'invalid',
    });

    // Find booking by ref
    const booking = await Booking.findOne({
        bookingRef
      })
      .populate('user', 'name email')
      .populate('event', 'title date location');

    if (!booking) return res.status(404).json({
      success: false,
      msg: 'Booking not found',
      type: 'invalid',
    });

    // Check if booking is for this event
    if (eventId && booking.event._id.toString() !== eventId) {
      return res.status(400).json({
        success: false,
        msg: 'This ticket is for a different event',
        type: 'wrong_event',
        event: booking.event.title,
      });
    }

    // Check if cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        msg: 'This ticket has been cancelled',
        type: 'cancelled',
      });
    }

    // Check if already checked in
    if (booking.isCheckedIn) {
      return res.status(400).json({
        success: false,
        msg: 'Already checked in',
        type: 'already_checked_in',
        checkedInAt: booking.checkedInAt,
        attendee: {
          name: booking.user ?.name,
          email: booking.user ?.email,
        },
      });
    }

    // ✅ Valid — mark as checked in
    booking.isCheckedIn = true;
    booking.checkedInAt = new Date();
    booking.checkedInBy = req.user.id;
    booking.status = 'used';
    await booking.save();

    // Get updated attendance count
    const checkedInCount = await Booking.countDocuments({
      event: booking.event._id,
      isCheckedIn: true,
    });

    res.json({
      success: true,
      msg: 'Check-in successful!',
      type: 'success',
      checkedInCount,
      attendee: {
        name: booking.user ?.name,
        email: booking.user ?.email,
        ticketTier: booking.ticketTier,
        quantity: booking.quantity,
        bookingRef: booking.bookingRef,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      type: 'error',
    });
  }
});

// ─── GET /api/checkin/stats/:eventId ─────────────────────
// Get attendance stats for an event
router.get('/stats/:eventId', auth, roleCheck('organizer', 'admin'), async (req, res) => {
  try {
    const {
      eventId
    } = req.params;

    const [total, checkedIn, cancelled] = await Promise.all([
      Booking.countDocuments({
        event: eventId,
        status: {
          $in: ['active', 'used']
        }
      }),
      Booking.countDocuments({
        event: eventId,
        isCheckedIn: true
      }),
      Booking.countDocuments({
        event: eventId,
        status: 'cancelled'
      }),
    ]);

    const event = await Event.findById(eventId).select('title capacity bookedCount');

    res.json({
      total,
      checkedIn,
      pending: total - checkedIn,
      cancelled,
      capacity: event ?.capacity || 0,
      eventTitle: event ?.title || '',
    });
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

// ─── GET /api/checkin/attendees/:eventId ─────────────────
// Get list of all checked-in attendees
router.get('/attendees/:eventId', auth, roleCheck('organizer', 'admin'), async (req, res) => {
  try {
    const bookings = await Booking.find({
        event: req.params.eventId,
        isCheckedIn: true,
      })
      .populate('user', 'name email')
      .sort({
        checkedInAt: -1
      });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

module.exports = router;