const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// ─── GET /api/analytics/organizer ────────────────────────
// Organizer's own analytics
router.get('/organizer', auth, roleCheck('organizer', 'admin'), async (req, res) => {
  try {
    // Get all organizer's events
    const events = await Event.find({
      organizer: req.user.id
    });
    const eventIds = events.map(e => e._id);

    // Get all bookings for these events
    const bookings = await Booking.find({
      event: {
        $in: eventIds
      },
      paymentStatus: {
        $in: ['paid', 'free']
      },
    }).populate('event', 'title date category');

    // Total revenue
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // Total bookings
    const totalBookings = bookings.length;

    // Total check-ins
    const totalCheckedIn = bookings.filter(b => b.isCheckedIn).length;

    // Revenue per event
    const revenueByEvent = events.map(ev => {
      const evBookings = bookings.filter(b => b.event ?._id ?.toString() === ev._id.toString());
      const revenue = evBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      const checkedIn = evBookings.filter(b => b.isCheckedIn).length;
      return {
        name: ev.title.length > 20 ? ev.title.slice(0, 20) + '...' : ev.title,
        fullTitle: ev.title,
        revenue,
        bookings: evBookings.length,
        checkedIn,
        date: ev.date,
        category: ev.category,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Bookings over time (last 7 days)
    const last7Days = Array.from({
      length: 7
    }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const bookingsByDay = last7Days.map(day => ({
      date: day.slice(5), // MM-DD
      bookings: bookings.filter(b =>
        b.createdAt ?.toISOString().split('T')[0] === day
      ).length,
    }));

    // Category breakdown
    const categoryMap = {};
    events.forEach(ev => {
      categoryMap[ev.category] = (categoryMap[ev.category] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
    }));

    // Ticket status breakdown
    const ticketStatus = [{
        name: 'Paid',
        value: bookings.filter(b => b.paymentStatus === 'paid').length
      },
      {
        name: 'Free',
        value: bookings.filter(b => b.paymentStatus === 'free').length
      },
      {
        name: 'Cancelled',
        value: await Booking.countDocuments({
          event: {
            $in: eventIds
          },
          status: 'cancelled'
        })
      },
    ];

    res.json({
      summary: {
        totalEvents: events.length,
        totalBookings,
        totalRevenue,
        totalCheckedIn,
        attendanceRate: totalBookings > 0 ?
          Math.round((totalCheckedIn / totalBookings) * 100) :
          0,
      },
      revenueByEvent,
      bookingsByDay,
      categoryBreakdown,
      ticketStatus,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

// ─── GET /api/analytics/admin ─────────────────────────────
// Platform-wide analytics (admin only)
router.get('/admin', auth, roleCheck('admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      totalEvents,
      totalBookings,
      totalOrganizers,
    ] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments({
        status: 'published'
      }),
      Booking.countDocuments({
        paymentStatus: {
          $in: ['paid', 'free']
        }
      }),
      User.countDocuments({
        role: 'organizer'
      }),
    ]);

    const allBookings = await Booking.find({
      paymentStatus: {
        $in: ['paid', 'free']
      },
    });
    const totalRevenue = allBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    res.json({
      totalUsers,
      totalEvents,
      totalBookings,
      totalOrganizers,
      totalRevenue,
    });
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

// ─── GET /api/analytics/student ──────────────────────────
// Student's own stats
router.get('/student', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({
        user: req.user.id
      })
      .populate('event', 'title date category location');

    const upcoming = bookings.filter(b =>
      new Date(b.event ?.date) > new Date() && b.status === 'active'
    );
    const attended = bookings.filter(b => b.isCheckedIn);
    const totalSpent = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // Categories attended
    const catMap = {};
    bookings.forEach(b => {
      if (b.event ?.category) {
        catMap[b.event.category] = (catMap[b.event.category] || 0) + 1;
      }
    });
    const favoriteCategories = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count
      }));

    res.json({
      totalBooked: bookings.length,
      upcomingCount: upcoming.length,
      attendedCount: attended.length,
      totalSpent,
      favoriteCategories,
      recentBookings: bookings.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

module.exports = router;