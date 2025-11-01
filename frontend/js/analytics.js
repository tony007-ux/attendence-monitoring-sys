/**
 * Analytics Script
 * Handles student efficiency calculations and display
 */

const API_BASE = '/api';

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
    document.getElementById('searchBtn').addEventListener('click', searchStudent);
    document.getElementById('searchRollNumber').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchStudent();
    });
    document.getElementById('loadAllBtn').addEventListener('click', loadAllStudents);
}

/**
 * Search for a specific student
 */
async function searchStudent() {
    const rollNumber = document.getElementById('searchRollNumber').value.trim().toUpperCase();
    
    if (!rollNumber) {
        showAlert('Please enter a roll number', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/efficiency/roll/${rollNumber}`);
        const data = await response.json();
        
        if (response.ok) {
            displayStudentDetails(data);
            document.getElementById('studentDetails').style.display = 'block';
        } else {
            showAlert(`❌ ${data.error}`, 'error');
            document.getElementById('studentDetails').style.display = 'none';
        }
    } catch (error) {
        console.error('Search error:', error);
        showAlert('❌ Failed to search student', 'error');
    }
}

/**
 * Load all students efficiency
 */
async function loadAllStudents() {
    try {
        const btn = document.getElementById('loadAllBtn');
        btn.disabled = true;
        btn.textContent = 'Loading...';
        
        const response = await fetch(`${API_BASE}/efficiency`);
        const data = await response.json();
        
        if (response.ok) {
            displayAllStudents(data.efficiencyData || []);
        } else {
            showAlert('Failed to load efficiency data', 'error');
        }
        
        btn.disabled = false;
        btn.textContent = 'Load All Students';
    } catch (error) {
        console.error('Load all error:', error);
        showAlert('Failed to load efficiency data', 'error');
        document.getElementById('loadAllBtn').disabled = false;
    }
}

/**
 * Display all students efficiency
 */
function displayAllStudents(efficiencyData) {
    const container = document.getElementById('allStudentsEfficiency');
    
    if (efficiencyData.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No efficiency data available.</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Roll Number</th>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Total Classes</th>
                    <th>Attended</th>
                    <th>Efficiency</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    efficiencyData.forEach(data => {
        const efficiencyClass = getEfficiencyClass(data.efficiency);
        const efficiencyColor = getEfficiencyColor(data.efficiency);
        
        html += `
            <tr>
                <td>${data.rollNumber}</td>
                <td>${data.studentName}</td>
                <td>${data.className}</td>
                <td>${data.totalClasses}</td>
                <td>${data.classesAttended}</td>
                <td>
                    <span style="color: ${efficiencyColor}; font-weight: bold;">
                        ${data.efficiency}%
                    </span>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

/**
 * Display individual student details
 */
function displayStudentDetails(data) {
    const container = document.getElementById('studentInfo');
    const efficiency = data.efficiency || 0;
    const efficiencyClass = getEfficiencyClass(efficiency);
    const efficiencyColor = getEfficiencyColor(efficiency);
    
    const html = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div class="efficiency-circle ${efficiencyClass}">
                ${efficiency.toFixed(1)}%
            </div>
            <h3 style="margin-top: 15px; color: #667eea;">${data.studentName}</h3>
            <p style="color: #666;">Roll Number: ${data.rollNumber} | Class: ${data.className}</p>
        </div>
        
        <div class="stats-grid" style="margin-bottom: 30px;">
            <div class="stat-card">
                <h3>${data.totalClasses}</h3>
                <p>Total Classes</p>
            </div>
            <div class="stat-card">
                <h3 style="color: #11998e;">${data.classesAttended}</h3>
                <p>Classes Attended</p>
            </div>
            <div class="stat-card">
                <h3 style="color: #eb3349;">${data.classesAbsent}</h3>
                <p>Classes Absent</p>
            </div>
            <div class="stat-card">
                <h3 style="color: ${efficiencyColor};">
                    ${efficiency.toFixed(2)}%
                </h3>
                <p>Efficiency</p>
            </div>
        </div>
        
        ${data.attendanceRecords && data.attendanceRecords.length > 0 ? `
            <h3 style="margin-bottom: 15px; color: #667eea;">Attendance History</h3>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Class</th>
                        <th>Status</th>
                        <th>Presence Duration</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.attendanceRecords.map(record => `
                        <tr>
                            <td>${new Date(record.date).toLocaleDateString()}</td>
                            <td>${record.className}</td>
                            <td>
                                <span class="status-badge ${record.status === 'Present' ? 'status-present' : 'status-absent'}">
                                    ${record.status}
                                </span>
                            </td>
                            <td>${Math.floor(record.presenceDuration / 60)}m ${record.presenceDuration % 60}s</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : '<p style="text-align: center; color: #666;">No attendance records available.</p>'}
    `;
    
    container.innerHTML = html;
}

/**
 * Get efficiency CSS class
 */
function getEfficiencyClass(efficiency) {
    if (efficiency >= 75) return 'efficiency-high';
    if (efficiency >= 50) return 'efficiency-medium';
    return 'efficiency-low';
}

/**
 * Get efficiency color
 */
function getEfficiencyColor(efficiency) {
    if (efficiency >= 75) return '#11998e';
    if (efficiency >= 50) return '#f09819';
    return '#eb3349';
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

