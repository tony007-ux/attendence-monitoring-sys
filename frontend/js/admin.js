/**
 * Admin Dashboard Script
 * Handles class management and attendance viewing
 */

const API_BASE = '/api';

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadClasses();
    loadTodayAttendance();
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
    document.getElementById('addClassForm').addEventListener('submit', handleAddClass);
}

/**
 * Handle add class form submission
 */
async function handleAddClass(e) {
    e.preventDefault();
    
    const formData = {
        className: document.getElementById('className').value.trim(),
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        dayOfWeek: document.getElementById('dayOfWeek').value
    };
    
    if (!formData.startTime || !formData.endTime) {
        showAlert('Please enter both start and end times', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/classes/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert(`✅ ${data.message}`, 'success');
            document.getElementById('addClassForm').reset();
            loadClasses();
        } else {
            showAlert(`❌ Error: ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('Add class error:', error);
        showAlert('❌ Failed to add class. Please try again.', 'error');
    }
}

/**
 * Load all classes
 */
async function loadClasses() {
    try {
        const response = await fetch(`${API_BASE}/classes`);
        const data = await response.json();
        
        if (response.ok) {
            displayClasses(data.classes || []);
        } else {
            document.getElementById('classesList').innerHTML = 
                '<p style="color: red;">Failed to load classes</p>';
        }
    } catch (error) {
        console.error('Load classes error:', error);
        document.getElementById('classesList').innerHTML = 
            '<p style="color: red;">Error loading classes</p>';
    }
}

/**
 * Display classes in table
 */
function displayClasses(classes) {
    const container = document.getElementById('classesList');
    
    if (classes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No classes scheduled yet.</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Class Name</th>
                    <th>Day</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    classes.forEach(cls => {
        const startTime = formatTime(cls.startTime);
        const endTime = formatTime(cls.endTime);
        const duration = `${cls.duration} min`;
        const status = cls.isActive ? 
            '<span class="status-badge status-present">Active</span>' : 
            '<span class="status-badge status-absent">Inactive</span>';
        
        html += `
            <tr>
                <td>${cls.className}</td>
                <td>${cls.dayOfWeek}</td>
                <td>${startTime}</td>
                <td>${endTime}</td>
                <td>${duration}</td>
                <td>${status}</td>
                <td>
                    <button onclick="toggleClass('${cls._id}', ${!cls.isActive})" class="btn" style="width: auto; padding: 5px 15px; font-size: 0.85rem;">
                        ${cls.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onclick="deleteClass('${cls._id}')" class="btn btn-secondary" style="width: auto; padding: 5px 15px; font-size: 0.85rem; margin-left: 5px;">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

/**
 * Format time from HH:MM to readable format
 */
function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Toggle class active status
 */
async function toggleClass(classId, isActive) {
    try {
        const response = await fetch(`${API_BASE}/classes/${classId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isActive })
        });
        
        if (response.ok) {
            showAlert('Class status updated successfully', 'success');
            loadClasses();
        } else {
            showAlert('Failed to update class status', 'error');
        }
    } catch (error) {
        console.error('Toggle class error:', error);
        showAlert('Error updating class', 'error');
    }
}

/**
 * Delete class
 */
async function deleteClass(classId) {
    if (!confirm('Are you sure you want to delete this class schedule?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/classes/${classId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showAlert('Class deleted successfully', 'success');
            loadClasses();
        } else {
            showAlert('Failed to delete class', 'error');
        }
    } catch (error) {
        console.error('Delete class error:', error);
        showAlert('Error deleting class', 'error');
    }
}

/**
 * Load today's attendance overview
 */
async function loadTodayAttendance() {
    try {
        const response = await fetch(`${API_BASE}/attendance/stats`);
        const data = await response.json();
        
        if (response.ok) {
            displayAttendanceOverview(data);
        } else {
            document.getElementById('attendanceOverview').innerHTML = 
                '<p style="color: red;">Failed to load attendance</p>';
        }
    } catch (error) {
        console.error('Load attendance error:', error);
        document.getElementById('attendanceOverview').innerHTML = 
            '<p style="color: red;">Error loading attendance</p>';
    }
}

/**
 * Display attendance overview
 */
function displayAttendanceOverview(stats) {
    const container = document.getElementById('attendanceOverview');
    
    const html = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>${stats.totalRecords || 0}</h3>
                <p>Total Records</p>
            </div>
            <div class="stat-card">
                <h3 style="color: #11998e;">${stats.presentCount || 0}</h3>
                <p>Present</p>
            </div>
            <div class="stat-card">
                <h3 style="color: #eb3349;">${stats.absentCount || 0}</h3>
                <p>Absent</p>
            </div>
            <div class="stat-card">
                <h3 style="color: #667eea;">${stats.presentPercentage || 0}%</h3>
                <p>Attendance Rate</p>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

