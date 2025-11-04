/**
 * Student Registration Script
 * Handles webcam access, face capture, and student registration
 */

let stream = null;
let capturedImage = null;

// Initialize webcam on page load
window.addEventListener('DOMContentLoaded', async () => {
    await initWebcam();
    setupEventListeners();
});

/**
 * Initialize webcam
 */
async function initWebcam() {
    try {
        const video = document.getElementById('video');
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: 640, 
                height: 480,
                facingMode: 'user' // Front-facing camera
            } 
        });
        video.srcObject = stream;
        showAlert('Webcam access granted', 'success');
    } catch (error) {
        console.error('Error accessing webcam:', error);
        showAlert('Failed to access webcam. Please allow camera permissions.', 'error');
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    document.getElementById('captureBtn').addEventListener('click', captureFace);
    document.getElementById('retakeBtn').addEventListener('click', retakeCapture);
    document.getElementById('registrationForm').addEventListener('submit', handleRegistration);
}

/**
 * Capture face from webcam
 */
function captureFace() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to base64 image
    capturedImage = canvas.toDataURL('image/jpeg', 0.8);
    
    // Show preview
    document.getElementById('previewImg').src = capturedImage;
    document.getElementById('capturedImagePreview').style.display = 'block';
    
    // Update button states
    document.getElementById('captureBtn').style.display = 'none';
    document.getElementById('retakeBtn').style.display = 'block';
    document.getElementById('submitBtn').disabled = false;
    
    showAlert('Face captured successfully! You can retake if needed.', 'success');
}

/**
 * Retake capture
 */
function retakeCapture() {
    capturedImage = null;
    document.getElementById('capturedImagePreview').style.display = 'none';
    document.getElementById('captureBtn').style.display = 'block';
    document.getElementById('retakeBtn').style.display = 'none';
    document.getElementById('submitBtn').disabled = true;
    showAlert('Ready to capture again', 'info');
}

/**
 * Handle form submission
 */
async function handleRegistration(e) {
    e.preventDefault();
    
    if (!capturedImage) {
        showAlert('Please capture your face first', 'error');
        return;
    }
    
    const formData = {
        name: document.getElementById('name').value.trim(),
        rollNumber: document.getElementById('rollNumber').value.trim().toUpperCase(),
        className: document.getElementById('className').value.trim(),
        referenceImage: capturedImage
    };
    
    // Validate
    if (!formData.name || !formData.rollNumber || !formData.className) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    // Disable submit button
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';
    
    try {
        const response = await fetch('/api/students/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert(`✅ ${data.message}`, 'success');
    
            // Show custom popup modal
            showSuccessModal(formData.name, formData.rollNumber, formData.className);
            
            // Reset form after modal is closed (handled by the modal button)
        } else {
            showAlert(`❌ Error: ${data.error}`, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register Student';
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAlert('❌ Failed to register. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register Student';
    }
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
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Stop webcam when leaving page
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});
/**
 * Show success modal with student details
 */
function showSuccessModal(name, rollNumber, className) {
    document.getElementById('modalStudentName').textContent = name;
    document.getElementById('modalRollNumber').textContent = rollNumber;
    document.getElementById('modalClassName').textContent = className;
    document.getElementById('successModal').style.display = 'block';
}

/**
 * Close success modal and reset form
 */
function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
    document.getElementById('registrationForm').reset();
    retakeCapture();
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Register Student';
}
