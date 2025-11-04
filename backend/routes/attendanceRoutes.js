/**
 * Attendance Routes
 * Handles attendance marking and retrieval
 */

const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Class = require('../models/Class');

// Mark attendance for a student
router.post('/mark', async (req, res) => {
  try {
    const { studentId, rollNumber, className, classId, presenceDuration, classDuration, detections, engagementScore, engagementData } = req.body;

    // Validation
    if (!studentId || !rollNumber || !className || !classId || !classDuration) {
      return res.status(400).json({ 
        error: 'studentId, rollNumber, className, classId, and classDuration are required' 
      });
    }

    // Get student info
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Calculate required duration (75% of class duration)
    const requiredDuration = Math.floor(classDuration * 0.75);
    const presenceSec = presenceDuration || 0;

    // Determine status based on presence duration
    const status = presenceSec >= requiredDuration ? 'Present' : 'Absent';

    // Create or update attendance record for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      {
          studentId: studentId,
          classId: classId,
          date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
      },
      {
          rollNumber: rollNumber,
          studentName: student.name,
          className: className,
          status: status,
          presenceDuration: presenceSec,
          requiredDuration: requiredDuration,
          classDuration: classDuration,
          detectionLog: detections || [],
          engagementScore: engagementScore || 0,
          engagementData: engagementData || { 
              lookingForward: 0, 
              lookingAway: 0, 
              totalFrames: 0, 
              score: 0 
          }
      },
      {
          upsert: true,
          new: true
      }
  );

    res.json({ 
      message: 'Attendance marked successfully',
      attendance: attendance
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Failed to mark attendance', message: error.message });
  }
});

// Get attendance records
router.get('/', async (req, res) => {
  try {
    const { studentId, className, date, startDate, endDate } = req.query;

    let query = {};
    
    if (studentId) query.studentId = studentId;
    if (className) query.className = className;
    if (date) {
      const dateObj = new Date(date);
      const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
      const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate && endDate) {
      query.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(100);

    res.json({ attendance });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance', message: error.message });
  }
});

// Get today's attendance for a class
router.get('/today/:className', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.find({
      className: req.params.className,
      date: { $gte: today, $lt: tomorrow }
    })
    .sort({ studentName: 1 });

    res.json({ attendance });
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s attendance', message: error.message });
  }
});

// Get attendance statistics
router.get('/stats', async (req, res) => {
  try {
    const { className, startDate, endDate } = req.query;

    let query = {};
    if (className) query.className = className;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const totalRecords = await Attendance.countDocuments(query);
    const presentCount = await Attendance.countDocuments({ ...query, status: 'Present' });
    const absentCount = await Attendance.countDocuments({ ...query, status: 'Absent' });

    res.json({
      totalRecords,
      presentCount,
      absentCount,
      presentPercentage: totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics', message: error.message });
  }
});

module.exports = router;

