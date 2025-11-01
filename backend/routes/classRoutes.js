/**
 * Class Routes
 * Handles class schedule management
 */

const express = require('express');
const router = express.Router();
const Class = require('../models/Class');

// Add a new class schedule
router.post('/add', async (req, res) => {
  try {
    const { className, startTime, endTime, dayOfWeek } = req.body;

    // Validation
    if (!className || !startTime || !endTime) {
      return res.status(400).json({ 
        error: 'className, startTime, and endTime are required' 
      });
    }

    // Calculate duration in minutes
    const start = startTime.split(':').map(Number);
    const end = endTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    const duration = endMinutes - startMinutes;

    if (duration <= 0) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    // Create new class
    const newClass = new Class({
      className: className.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      dayOfWeek: dayOfWeek || 'Daily',
      duration: duration
    });

    await newClass.save();

    res.status(201).json({ 
      message: 'Class schedule added successfully',
      class: newClass
    });
  } catch (error) {
    console.error('Add class error:', error);
    res.status(500).json({ error: 'Failed to add class', message: error.message });
  }
});

// Get all classes
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find({ isActive: true })
      .sort({ className: 1, startTime: 1 });
    
    res.json({ classes });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Failed to fetch classes', message: error.message });
  }
});

// Get class by ID
router.get('/:id', async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json({ class: classData });
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ error: 'Failed to fetch class', message: error.message });
  }
});

// Update class
router.put('/:id', async (req, res) => {
  try {
    const { className, startTime, endTime, dayOfWeek, isActive } = req.body;
    
    const updateData = {};
    if (className) updateData.className = className.trim();
    if (startTime) updateData.startTime = startTime.trim();
    if (endTime) updateData.endTime = endTime.trim();
    if (dayOfWeek) updateData.dayOfWeek = dayOfWeek;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Recalculate duration if times are updated
    if (startTime || endTime) {
      const classData = await Class.findById(req.params.id);
      const start = (updateData.startTime || classData.startTime).split(':').map(Number);
      const end = (updateData.endTime || classData.endTime).split(':').map(Number);
      const startMinutes = start[0] * 60 + start[1];
      const endMinutes = end[0] * 60 + end[1];
      updateData.duration = endMinutes - startMinutes;
    }

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json({ 
      message: 'Class updated successfully',
      class: updatedClass
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ error: 'Failed to update class', message: error.message });
  }
});

// Delete class
router.delete('/:id', async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    
    if (!deletedClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ error: 'Failed to delete class', message: error.message });
  }
});

module.exports = router;

