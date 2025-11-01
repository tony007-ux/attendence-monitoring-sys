/**
 * Class Model
 * Stores class schedule information
 */

const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: String, // Format: "HH:MM" (24-hour format)
    required: true
  },
  endTime: {
    type: String, // Format: "HH:MM" (24-hour format)
    required: true
  },
  dayOfWeek: {
    type: String, // "Monday", "Tuesday", etc. or "Daily"
    required: true,
    default: "Daily"
  },
  duration: {
    type: Number, // Duration in minutes
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
classSchema.index({ className: 1, startTime: 1 });

module.exports = mongoose.model('Class', classSchema);

