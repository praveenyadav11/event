const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const adminAuth = [auth, roleCheck('admin')];

router.get('/stats', ...adminAuth, async (req, res) => {
  try {
    const [
      totalUsers, totalStudents, totalOrganizers,
      totalEvents, publishedEvents, totalBookings,
      revenueAgg, checkedIn,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({
        role: 'student'
      }),
      User.countDocuments({
        role: 'organizer'
      }),
      Event.countDocuments(),
      Event.countDocuments({
        status: 'published'
      }),
      Booking.countDocuments({
        paymentStatus: {
          $in: ['paid', 'free']
        }
      }),
      Booking.aggregate([{
          $match: {
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$totalAmount'
            }
          }
        },
      ]),
      Booking.countDocuments({
        isCheckedIn: true
      }),
    ]);

    res.json({
      totalUsers,
      totalStudents,
      totalOrganizers,
      totalEvents,
      publishedEvents,
      totalBookings,
      totalRevenue: revenueAgg[0] ?.total || 0,
      checkedIn,
    });
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

router.get('/users', ...adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({
      createdAt: -1
    });
    res.json({
      users,
      total: users.length
    });
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

router.put('/users/:id', ...adminAuth, async (req, res) => {
  try {
    const {
      isActive,
      role
    } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, {
        isActive,
        role
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

router.delete('/users/:id', ...adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({
      msg: 'User deleted'
    });
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

router.get('/events', ...adminAuth, async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'name email')
      .sort({
        createdAt: -1
      });
    res.json({
      events,
      total: events.length
    });
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

router.put('/events/:id', ...adminAuth, async (req, res) => {
  try {
    const {
      status,
      isFeatured
    } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id, {
        status,
        isFeatured
      }, {
        new: true
      }
    ).populate('organizer', 'name');
    res.json(event);
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

router.delete('/events/:id', ...adminAuth, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    await Booking.deleteMany({
      event: req.params.id
    });
    res.json({
      msg: 'Event deleted'
    });
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

router.get('/bookings', ...adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('event', 'title date')
      .sort({
        createdAt: -1
      })
      .limit(100);
    res.json({
      bookings,
      total: bookings.length
    });
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

module.exports = router;