/**
 * Main server file for Attendance Monitoring System
 * Handles API requests and connects to MongoDB
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Import Routes
const studentRoutes = require('./routes/studentRoutes');
const classRoutes = require('./routes/classRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const efficiencyRoutes = require('./routes/efficiencyRoutes');

// Import Attendance Monitoring Service
const { initAttendanceMonitoring } = require('./services/attendanceMonitor');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance-monitoring';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB successfully');
  // Initialize automatic attendance monitoring after DB connection
  await initAttendanceMonitoring();
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  console.log('💡 Make sure MongoDB is running on your system');
});

// API Routes
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/efficiency', efficiencyRoutes);

// Serve frontend pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

app.get('/live', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/live.html'));
});

app.get('/analytics', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/analytics.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Registration: http://localhost:${PORT}/register`);
  console.log(`👨‍🏫 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`📹 Live Tracking: http://localhost:${PORT}/live`);
  console.log(`📊 Analytics: http://localhost:${PORT}/analytics`);
});

module.exports = app;

