/**
 * Attendance Model
 * Stores individual attendance records for each class session
 */

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  rollNumber: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  className: {
    type: String,
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    required: true,
    default: 'Absent'
  },
  presenceDuration: {
    type: Number, // Duration in seconds that student was detected
    default: 0
  },
  requiredDuration: {
    type: Number, // Required duration in seconds (75% of class duration)
    required: true
  },
  classDuration: {
    type: Number, // Total class duration in seconds
    required: true
  },
  detectionLog: [{
    timestamp: Date,
    confidence: Number
  }]
}, {
  timestamps: true
});

// Index for faster queries
attendanceSchema.index({ studentId: 1, date: 1 });
attendanceSchema.index({ className: 1, date: 1 });
attendanceSchema.index({ date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);

