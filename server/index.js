const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/payments', require('./routes/payments')); // ← ADD
app.use('/api/bookings', require('./routes/bookings')); // ← ADD
app.use('/api/checkin', require('./routes/checkin')); // ← ADD
app.use('/api/analytics', require('./routes/analytics')); // ← ADD
app.use('/api/admin', require('./routes/admin')); // ← ADD



app.get('/', (req, res) => res.send('EventFlow API running ⚡'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.log('❌ DB Error:', err));