/**
 * Efficiency Routes
 * Handles student efficiency and engagement calculations
 */

const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Class = require('../models/Class');

// Calculate efficiency for a specific student
router.get('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { className, startDate, endDate } = req.query;

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Build query
    let query = { studentId: studentId };
    if (className) query.className = className;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Get attendance records
    const attendanceRecords = await Attendance.find(query);
    
    // Calculate statistics
    const totalClasses = attendanceRecords.length;
    const classesAttended = attendanceRecords.filter(a => a.status === 'Present').length;
    const efficiency = totalClasses > 0 ? (classesAttended / totalClasses) * 100 : 0;

    // Calculate average engagement (only for attended classes)
    const attendedRecords = attendanceRecords.filter(a => a.status === 'Present');
    const totalEngagement = attendedRecords.reduce((sum, record) => 
      sum + (record.engagementScore || 0), 0
    );
    const averageEngagement = attendedRecords.length > 0 
      ? (totalEngagement / attendedRecords.length)
      : 0;

    // Additional stats
    const totalAbsences = totalClasses - classesAttended;
    const averagePresenceDuration = attendanceRecords.length > 0
      ? attendanceRecords.reduce((sum, a) => sum + a.presenceDuration, 0) / attendanceRecords.length
      : 0;

    res.json({
      studentId: student._id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      className: className || student.className,
      totalClasses: totalClasses,
      classesAttended: classesAttended,
      classesAbsent: totalAbsences,
      efficiency: parseFloat(efficiency.toFixed(2)),
      averageEngagement: parseFloat(averageEngagement.toFixed(2)),
      averagePresenceDuration: parseFloat(averagePresenceDuration.toFixed(2)),
      attendanceRecords: attendanceRecords.map(a => ({
        date: a.date,
        status: a.status,
        presenceDuration: a.presenceDuration,
        className: a.className,
        engagementScore: a.engagementScore || 0
      }))
    });
  } catch (error) {
    console.error('Get efficiency error:', error);
    res.status(500).json({ error: 'Failed to calculate efficiency', message: error.message });
  }
});

// Get efficiency for all students
router.get('/', async (req, res) => {
  try {
    const { className, startDate, endDate } = req.query;

    // Build query
    let query = {};
    if (className) query.className = className;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Get all students
    const students = await Student.find(className ? { className: className } : {});
    
    // Calculate efficiency for each student
    const efficiencyData = await Promise.all(
      students.map(async (student) => {
        const studentQuery = { ...query, studentId: student._id };
        const attendanceRecords = await Attendance.find(studentQuery);
        
        const totalClasses = attendanceRecords.length;
        const classesAttended = attendanceRecords.filter(a => a.status === 'Present').length;
        const efficiency = totalClasses > 0 ? (classesAttended / totalClasses) * 100 : 0;

        // Calculate average engagement (only for attended classes)
        const attendedRecords = attendanceRecords.filter(a => a.status === 'Present');
        const totalEngagement = attendedRecords.reduce((sum, record) => 
          sum + (record.engagementScore || 0), 0
        );
        const averageEngagement = attendedRecords.length > 0 
          ? (totalEngagement / attendedRecords.length)
          : 0;

        return {
          studentId: student._id,
          studentName: student.name,
          rollNumber: student.rollNumber,
          className: student.className,
          totalClasses: totalClasses,
          classesAttended: classesAttended,
          classesAbsent: totalClasses - classesAttended,
          efficiency: parseFloat(efficiency.toFixed(2)),
          averageEngagement: parseFloat(averageEngagement.toFixed(2))
        };
      })
    );

    // Sort by efficiency (descending)
    efficiencyData.sort((a, b) => b.efficiency - a.efficiency);

    res.json({ efficiencyData });
  } catch (error) {
    console.error('Get all efficiency error:', error);
    res.status(500).json({ error: 'Failed to calculate efficiency', message: error.message });
  }
});

// Get efficiency by roll number
router.get('/roll/:rollNumber', async (req, res) => {
  try {
    const student = await Student.findOne({ rollNumber: req.params.rollNumber.toUpperCase() });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Build query
    const { className, startDate, endDate } = req.query;
    let query = { studentId: student._id };
    if (className) query.className = className;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const attendanceRecords = await Attendance.find(query);
    const totalClasses = attendanceRecords.length;
    const classesAttended = attendanceRecords.filter(a => a.status === 'Present').length;
    const efficiency = totalClasses > 0 ? (classesAttended / totalClasses) * 100 : 0;

    // Calculate average engagement (only for attended classes)
    const attendedRecords = attendanceRecords.filter(a => a.status === 'Present');
    const totalEngagement = attendedRecords.reduce((sum, record) => 
      sum + (record.engagementScore || 0), 0
    );
    const averageEngagement = attendedRecords.length > 0 
      ? (totalEngagement / attendedRecords.length)
      : 0;

    res.json({
      studentId: student._id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      className: className || student.className,
      totalClasses: totalClasses,
      classesAttended: classesAttended,
      classesAbsent: totalClasses - classesAttended,
      efficiency: parseFloat(efficiency.toFixed(2)),
      averageEngagement: parseFloat(averageEngagement.toFixed(2)),
      attendanceRecords: attendanceRecords.map(a => ({
        date: a.date,
        status: a.status,
        presenceDuration: a.presenceDuration,
        className: a.className,
        engagementScore: a.engagementScore || 0
      }))
    });
  } catch (error) {
    console.error('Get efficiency by roll error:', error);
    res.status(500).json({ error: 'Failed to calculate efficiency', message: error.message });
  }
});

module.exports = router;