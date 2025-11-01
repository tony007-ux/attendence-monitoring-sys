/**
 * Student Model
 * Stores student registration information and reference face descriptor
 */

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  className: {
    type: String,
    required: true,
    trim: true
  },
  referenceImage: {
    type: String, // Base64 encoded image or file path
    required: true
  },
  faceDescriptor: {
    type: [Number], // Face descriptor array from face-api.js
    required: false // Will be populated when face is detected
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
studentSchema.index({ rollNumber: 1 });
studentSchema.index({ className: 1 });

module.exports = mongoose.model('Student', studentSchema);

