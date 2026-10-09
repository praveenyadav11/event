const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  upload
} = require('../config/cloudinary');

// ─── GET /api/events ─ Browse + Search + Filter ──────────
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      location,
      isFree,
      status = 'published',
      sort = 'date',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {
      status
    };

    if (search) query.$text = {
      $search: search
    };
    if (category && category !== 'All') query.category = category;
    if (location) query.location = {
      $regex: location,
      $options: 'i'
    };
    if (isFree === 'true') query.isFree = true;

    const sortObj = {
      date: {
        date: 1
      },
      popular: {
        bookedCount: -1
      },
      newest: {
        createdAt: -1
      },
      featured: {
        isFeatured: -1,
        date: 1
      },
    } [sort] || {
      date: 1
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [events, total] = await Promise.all([
      Event.find(query)
      .populate('organizer', 'name avatar')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit)),
      Event.countDocuments(query),
    ]);

    res.json({
      events,
      total,
      pages: Math.ceil(total / Number(limit)),
      page: Number(page),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

// ─── GET /api/events/featured ────────────────────────────
router.get('/featured', async (req, res) => {
  try {
    const events = await Event.find({
        status: 'published',
        isFeatured: true
      })
      .populate('organizer', 'name avatar')
      .sort({
        date: 1
      })
      .limit(6);
    res.json(events);
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

// ─── GET /api/events/trending ────────────────────────────
router.get('/trending', async (req, res) => {
  try {
    const events = await Event.find({
        status: 'published'
      })
      .populate('organizer', 'name avatar')
      .sort({
        bookedCount: -1,
        views: -1
      })
      .limit(9);
    res.json(events);
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

// ─── GET /api/events/my-events ───────────────────────────
router.get('/my-events', auth, roleCheck('organizer', 'admin'), async (req, res) => {
  try {
    const events = await Event.find({
        organizer: req.user.id
      })
      .sort({
        createdAt: -1
      });
    res.json(events);
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

// ─── GET /api/events/:id ─────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id, {
        $inc: {
          views: 1
        }
      }, // increment view count
      {
        returnDocument: 'after'
      }

    ).populate('organizer', 'name avatar bio college');

    if (!event) return res.status(404).json({
      msg: 'Event not found'
    });
    res.json(event);
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

// ─── POST /api/events ─ Create event ─────────────────────
router.post('/', auth, roleCheck('organizer', 'admin'), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      tags,
      date,
      endDate,
      venue,
      location,
      isOnline,
      onlineLink,
      ticketTiers,
      capacity,
      isFree,
      speakers,
      schedule,
      teamSize,
      status,
    } = req.body;

    if (!title || !description || !category || !date || !location || !capacity)
      return res.status(400).json({
        msg: 'Please fill all required fields'
      });

    const event = await Event.create({
      title,
      description,
      category,
      tags: tags || [],
      date,
      endDate,
      venue,
      location,
      isOnline: isOnline || false,
      onlineLink: onlineLink || '',
      ticketTiers: ticketTiers || [],
      capacity: Number(capacity),
      isFree: isFree || false,
      speakers: speakers || [],
      schedule: schedule || [],
      teamSize: teamSize || 1,
      status: status || 'draft',
      organizer: req.user.id,
    });

    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

// ─── POST /api/events/:id/banner ─ Upload banner ─────────
router.post('/:id/banner',
  auth,
  roleCheck('organizer', 'admin'),
  upload.single('banner'),
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({
        msg: 'Event not found'
      });

      if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin')
        return res.status(403).json({
          msg: 'Not authorized'
        });

      event.banner = req.file.path;
      await event.save();
      res.json({
        banner: event.banner
      });
    } catch (err) {
      res.status(500).json({
        msg: 'Server error'
      });
    }
  }
);

// ─── PUT /api/events/:id ─ Update event ──────────────────
router.put('/:id', auth, roleCheck('organizer', 'admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({
      msg: 'Event not found'
    });

    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({
        msg: 'Not authorized'
      });

    const updated = await Event.findByIdAndUpdate(
      req.params.id, req.body, {
        new: true
      }
    ).populate('organizer', 'name avatar');

    res.json(updated);
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

// ─── DELETE /api/events/:id ──────────────────────────────
router.delete('/:id', auth, roleCheck('organizer', 'admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({
      msg: 'Event not found'
    });

    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({
        msg: 'Not authorized'
      });

    await Event.findByIdAndDelete(req.params.id);
    res.json({
      msg: 'Event deleted'
    });
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

// ─── POST /api/events/:id/bookmark ───────────────────────
router.post('/:id/bookmark', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({
      msg: 'Event not found'
    });

    const isBookmarked = event.bookmarks.includes(req.user.id);
    if (isBookmarked) {
      event.bookmarks.pull(req.user.id);
    } else {
      event.bookmarks.push(req.user.id);
    }
    await event.save();
    res.json({
      bookmarked: !isBookmarked,
      count: event.bookmarks.length
    });
  } catch (err) {
    res.status(500).json({
      msg: 'Server error'
    });
  }
});

module.exports = router;