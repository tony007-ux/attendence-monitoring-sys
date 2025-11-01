/**
 * Automatic Attendance Monitoring Service
 * Monitors class schedules and automatically triggers attendance tracking
 */

const cron = require('node-cron');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

let monitoringJobs = new Map(); // Store active monitoring jobs

/**
 * Initialize attendance monitoring service
 * Checks class schedules and starts monitoring at appropriate times
 */
async function initAttendanceMonitoring() {
    console.log('🔔 Initializing automatic attendance monitoring...');
    
    // Load all active classes
    const classes = await Class.find({ isActive: true });
    
    // Schedule monitoring for each class
    classes.forEach(scheduleClass);
    
    // Check for new classes every minute
    cron.schedule('* * * * *', async () => {
        await updateMonitoringSchedules();
    });
    
    console.log('✅ Attendance monitoring service initialized');
}

/**
 * Schedule monitoring for a class
 */
function scheduleClass(classData) {
    const classId = classData._id.toString();
    
    // Cancel existing job if any
    if (monitoringJobs.has(classId)) {
        const oldJob = monitoringJobs.get(classId);
        oldJob.destroy();
    }
    
    // Parse start and end times
    const [startHour, startMinute] = classData.startTime.split(':').map(Number);
    const [endHour, endMinute] = classData.endTime.split(':').map(Number);
    
    // Determine cron schedule based on day of week
    let cronSchedule;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    if (classData.dayOfWeek === 'Daily') {
        // Run every day at start time
        cronSchedule = `${startMinute} ${startHour} * * *`;
    } else {
        // Run on specific day
        const dayIndex = days.indexOf(classData.dayOfWeek);
        if (dayIndex !== -1) {
            cronSchedule = `${startMinute} ${startHour} * * ${dayIndex}`;
        } else {
            console.warn(`Invalid day of week: ${classData.dayOfWeek}`);
            return;
        }
    }
    
    // Create cron job to start monitoring
    const job = cron.schedule(cronSchedule, async () => {
        console.log(`⏰ Starting attendance monitoring for ${classData.className} at ${classData.startTime}`);
        await startMonitoringForClass(classData);
        
        // Schedule end of monitoring
        const durationMs = classData.duration * 60 * 1000;
        setTimeout(async () => {
            console.log(`⏰ Stopping attendance monitoring for ${classData.className}`);
            await stopMonitoringForClass(classData);
        }, durationMs);
    }, {
        scheduled: true,
        timezone: 'Asia/Kolkata' // Adjust to your timezone
    });
    
    monitoringJobs.set(classId, job);
    console.log(`📅 Scheduled monitoring for ${classData.className} - ${classData.dayOfWeek} at ${classData.startTime}`);
}

/**
 * Start monitoring for a specific class
 * This function marks the start of attendance tracking
 * Note: Actual face recognition happens on the frontend
 */
async function startMonitoringForClass(classData) {
    try {
        // Get all students in this class
        const students = await Student.find({ className: classData.className });
        
        // Initialize attendance records (marked as Absent by default)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (const student of students) {
            // Check if attendance already exists for today
            const existing = await Attendance.findOne({
                studentId: student._id,
                classId: classData._id,
                date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
            });
            
            if (!existing) {
                // Create default Absent record
                const attendance = new Attendance({
                    studentId: student._id,
                    rollNumber: student.rollNumber,
                    studentName: student.name,
                    className: classData.className,
                    classId: classData._id,
                    status: 'Absent',
                    presenceDuration: 0,
                    requiredDuration: Math.floor(classData.duration * 60 * 0.75), // 75% in seconds
                    classDuration: classData.duration * 60 // Total duration in seconds
                });
                
                await attendance.save();
            }
        }
        
        console.log(`✅ Initialized attendance tracking for ${students.length} students in ${classData.className}`);
    } catch (error) {
        console.error('Error starting monitoring:', error);
    }
}

/**
 * Stop monitoring for a specific class
 * Finalize attendance records
 */
async function stopMonitoringForClass(classData) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get all attendance records for today
        const attendanceRecords = await Attendance.find({
            classId: classData._id,
            date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
        });
        
        // Update any records that are still in default state
        // (This is handled by the frontend during live monitoring)
        console.log(`✅ Finalized attendance for ${classData.className}`);
    } catch (error) {
        console.error('Error stopping monitoring:', error);
    }
}

/**
 * Update monitoring schedules
 * Called periodically to pick up new or modified classes
 */
async function updateMonitoringSchedules() {
    try {
        const classes = await Class.find({ isActive: true });
        
        // Schedule any new classes
        classes.forEach(classData => {
            const classId = classData._id.toString();
            if (!monitoringJobs.has(classId)) {
                scheduleClass(classData);
            }
        });
    } catch (error) {
        console.error('Error updating monitoring schedules:', error);
    }
}

module.exports = {
    initAttendanceMonitoring,
    scheduleClass,
    updateMonitoringSchedules
};

