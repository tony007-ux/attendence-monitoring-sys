/**
 * Student Routes
 * Handles student registration and retrieval
 */

const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Register a new student
router.post('/register', async (req, res) => {
  try {
    const { name, rollNumber, className, referenceImage } = req.body;

    // Validation
    if (!name || !rollNumber || !className || !referenceImage) {
      return res.status(400).json({ 
        error: 'All fields are required (name, rollNumber, className, referenceImage)' 
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ rollNumber: rollNumber.toUpperCase() });
    if (existingStudent) {
      return res.status(400).json({ error: 'Student with this roll number already exists' });
    }

    // Create new student
    const student = new Student({
      name: name.trim(),
      rollNumber: rollNumber.toUpperCase().trim(),
      className: className.trim(),
      referenceImage: referenceImage // Base64 image
    });

    await student.save();

    res.status(201).json({ 
      message: 'Student registered successfully',
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        className: student.className
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register student', message: error.message });
  }
});

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find({})
      .select('-referenceImage -faceDescriptor') // Exclude large fields
      .sort({ rollNumber: 1 });
    
    res.json({ students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students', message: error.message });
  }
});

// Get student by roll number
router.get('/:rollNumber', async (req, res) => {
  try {
    const student = await Student.findOne({ rollNumber: req.params.rollNumber.toUpperCase() })
      .select('-referenceImage -faceDescriptor');
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ student });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Failed to fetch student', message: error.message });
  }
});

// Update face descriptor for a student
router.post('/:rollNumber/descriptor', async (req, res) => {
  try {
    const { faceDescriptor } = req.body;
    
    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({ error: 'Valid face descriptor array is required' });
    }

    const student = await Student.findOneAndUpdate(
      { rollNumber: req.params.rollNumber.toUpperCase() },
      { faceDescriptor: faceDescriptor },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Face descriptor updated successfully', studentId: student._id });
  } catch (error) {
    console.error('Update descriptor error:', error);
    res.status(500).json({ error: 'Failed to update face descriptor', message: error.message });
  }
});

// Get student reference image (for face matching)
router.get('/:rollNumber/reference', async (req, res) => {
  try {
    const student = await Student.findOne({ rollNumber: req.params.rollNumber.toUpperCase() })
      .select('referenceImage faceDescriptor');
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ 
      referenceImage: student.referenceImage,
      faceDescriptor: student.faceDescriptor 
    });
  } catch (error) {
    console.error('Get reference error:', error);
    res.status(500).json({ error: 'Failed to fetch reference', message: error.message });
  }
});

module.exports = router;

