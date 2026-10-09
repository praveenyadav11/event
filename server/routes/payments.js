const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');
const QRCode = require('qrcode');

// ── Helper: generate UPI payment string ──────────────────
const generateUPIString = (amount, txnRef, eventTitle, upiId, merchantName) => {
  const note = `Ticket: ${eventTitle}`.slice(0, 50);
  return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}&tr=${txnRef}`;
};

// ─── POST /api/payments/create-order ─────────────────────
router.post('/create-order', auth, async (req, res) => {
  try {
    const {
      eventId,
      tierIndex,
      quantity = 1
    } = req.body;

    // Step 1 — Get event
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({
      msg: 'Event not found'
    });

    // Step 2 — Get organizer's UPI ID from their profile
    const organizer = await User.findById(event.organizer);
    const merchantUPI = organizer ?.upiId || process.env.MERCHANT_UPI_ID || 'eventflow@upi';
    const merchantName = organizer ?.name || process.env.MERCHANT_NAME || 'EventFlow';

    // Step 3 — Check availability
    const spotsLeft = event.capacity - event.bookedCount;
    if (spotsLeft < quantity)
      return res.status(400).json({
        msg: `Only ${spotsLeft} spots remaining`
      });

    const tier = event.ticketTiers[tierIndex];
    if (!tier) return res.status(400).json({
      msg: 'Invalid ticket tier'
    });

    const tierSpotsLeft = tier.quantity - tier.sold;
    if (tierSpotsLeft < quantity)
      return res.status(400).json({
        msg: `Only ${tierSpotsLeft} tickets left in this tier`
      });

    const totalAmount = tier.price * quantity;

    // ── FREE ticket ───────────────────────────────────────
    if (totalAmount === 0) {
      const booking = await Booking.create({
        event: eventId,
        user: req.user.id,
        ticketTier: tier.name,
        ticketPrice: 0,
        quantity,
        totalAmount: 0,
        paymentStatus: 'free',
        status: 'active',
      });

      // Generate ticket QR
      const qrCode = await QRCode.toDataURL(JSON.stringify({
        bookingRef: booking.bookingRef,
        eventId,
        userId: req.user.id,
      }), {
        width: 300,
        margin: 2
      });

      booking.qrCode = qrCode;
      await booking.save();

      // Update event counts
      event.bookedCount += quantity;
      tier.sold += quantity;
      await event.save();

      return res.json({
        free: true,
        bookingId: booking._id,
        bookingRef: booking.bookingRef,
      });
    }

    // ── PAID ticket — generate UPI QR ─────────────────────
    const txnRef = `EF${Date.now()}`;

    // Create pending booking
    const booking = await Booking.create({
      event: eventId,
      user: req.user.id,
      ticketTier: tier.name,
      ticketPrice: tier.price,
      quantity,
      totalAmount,
      paymentStatus: 'pending',
      razorpayOrderId: txnRef,
    });

    // Generate UPI payment QR using organizer's UPI
    const upiString = generateUPIString(
      totalAmount,
      txnRef,
      event.title,
      merchantUPI, // ← organizer's UPI ID
      merchantName, // ← organizer's name
    );

    const paymentQR = await QRCode.toDataURL(upiString, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
    });

    res.json({
      free: false,
      bookingId: booking._id,
      paymentQR,
      upiString,
      txnRef,
      totalAmount,
      merchantUPI, // shown on payment page
      merchantName, // shown on payment page
      event: {
        title: event.title
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

// ─── POST /api/payments/confirm ──────────────────────────
router.post('/confirm', auth, async (req, res) => {
  try {
    const {
      bookingId,
      upiId
    } = req.body;

    if (!upiId || !upiId.includes('@'))
      return res.status(400).json({
        msg: 'Please enter a valid UPI ID (e.g. name@upi)'
      });

    const booking = await Booking.findById(bookingId).populate('event');
    if (!booking)
      return res.status(404).json({
        msg: 'Booking not found'
      });

    if (booking.user.toString() !== req.user.id)
      return res.status(403).json({
        msg: 'Not authorized'
      });

    if (booking.paymentStatus === 'paid')
      return res.status(400).json({
        msg: 'Already paid'
      });

    // Generate ticket QR
    const qrCode = await QRCode.toDataURL(JSON.stringify({
      bookingRef: booking.bookingRef,
      eventId: booking.event._id,
      userId: req.user.id,
    }), {
      width: 300,
      margin: 2
    });

    booking.paymentStatus = 'paid';
    booking.status = 'active';
    booking.qrCode = qrCode;
    booking.razorpayPaymentId = `UPI-${upiId}-${Date.now()}`;
    await booking.save();

    // Update event counts
    const event = await Event.findById(booking.event._id);
    const tier = event.ticketTiers.find(t => t.name === booking.ticketTier);
    event.bookedCount += booking.quantity;
    if (tier) tier.sold += booking.quantity;
    await event.save();

    res.json({
      msg: 'Payment confirmed!',
      bookingId: booking._id,
      bookingRef: booking.bookingRef,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

module.exports = router;