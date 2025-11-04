/**
 * Live Attendance Tracking Script
 * Uses face-api.js for real-time face recognition
 */

const API_BASE = '/api';
let stream = null;
let isMonitoring = false;
let faceMatcher = null;
let students = [];
let detectedStudents = new Map(); // rollNumber -> { duration, startTime, detections, engagement }
let monitoringInterval = null;
let currentClassId = null;
let currentClassName = null;
let classDuration = 0;
let monitoringStartTime = null;

// Monitoring settings (with defaults)
let settings = {
    detectionThreshold: 0.6,      // Face recognition threshold (0.4-0.8)
    presencePercentage: 75,       // Minimum % of class time needed (50-90)
    showBoundingBoxes: true,       // Show boxes around detected faces
    autoSaveAttendance: true        // Auto-save when stopping
};

// Initialize on page load
window.addEventListener('DOMContentLoaded', async () => {
    console.log('🔄 Initializing live tracking page...');
    
    // Wait a bit for scripts to load
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Wait for face-api.js to be fully loaded
    let attempts = 0;
    while (typeof faceapi === 'undefined' && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        attempts++;
    }
    
    if (typeof faceapi === 'undefined') {
        console.error('❌ face-api.js not loaded after waiting');
        showAlert('⚠️ Face-api.js library not loaded. Please refresh the page.', 'error');
        return;
    }
    
    console.log('✅ face-api.js library found');
    
    // Wait for TensorFlow.js to be ready
    if (typeof tf !== 'undefined') {
        console.log('✅ TensorFlow.js found');
        // Initialize TensorFlow backend if needed
        await tf.ready();
        console.log('✅ TensorFlow.js ready');
    } else {
        console.warn('⚠️ TensorFlow.js not found, but continuing...');
    }
    
    try {
        await loadModels();
        await loadClasses();
        setupEventListeners();
        console.log('✅ Initialization complete');
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showAlert('❌ Failed to initialize. Check console for details.', 'error');
    }
});

/**
 * Load face-api.js models
 * 
 * IMPORTANT: Face-api.js models must be downloaded and hosted locally for this to work.
 * Download models from: https://github.com/justadudewhohacks/face-api.js-models
 * Extract to: frontend/models/ directory
 * 
 * Alternative: Use a model hosting service or CDN that hosts these weights
 */
async function loadModels() {
    showAlert('Loading face recognition models... This may take a moment.', 'info');
    console.log('🔄 Starting model loading...');
    
    // Check if faceapi is available
    if (typeof faceapi === 'undefined') {
        const error = 'face-api.js library not loaded. Please check the script tags.';
        console.error('❌', error);
        throw new Error(error);
    }
    
    // List of CDN paths to try in order
    const cdnPaths = [
        '/models', // Local first
        'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights',
        'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model',
        'https://unpkg.com/@vladmandic/face-api/model'
    ];
    
    // Try each CDN path
    for (let i = 0; i < cdnPaths.length; i++) {
        const modelsPath = cdnPaths[i];
        console.log(`🔄 Trying to load models from: ${modelsPath} (attempt ${i + 1}/${cdnPaths.length})`);
        
        try {
            // Test if path is accessible (for local)
            if (modelsPath.startsWith('/')) {
                try {
                    const testResponse = await fetch(`${modelsPath}/tiny_face_detector_model-weights_manifest.json`);
                    if (!testResponse.ok) {
                        console.log(`⚠️ Local models not found, skipping...`);
                        continue;
                    }
                } catch {
                    console.log(`⚠️ Local models not accessible, skipping...`);
                    continue;
                }
            }
            
            // Try loading models
            console.log(`⏳ Loading models from ${modelsPath}...`);
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath),
                faceapi.nets.faceLandmark68Net.loadFromUri(modelsPath),
                faceapi.nets.faceRecognitionNet.loadFromUri(modelsPath)
            ]);
            
            console.log(`✅ Successfully loaded models from: ${modelsPath}`);
            showAlert('✅ Face recognition models loaded successfully!', 'success');
            return true;
            
        } catch (error) {
            console.warn(`❌ Failed to load from ${modelsPath}:`, error.message);
            if (i === cdnPaths.length - 1) {
                // Last attempt failed
                console.error('❌ All CDN attempts failed');
                showAlert('❌ Failed to load models from all sources. See console for details.', 'error');
                console.log('');
                console.log('📥 SOLUTION: Download models manually:');
                console.log('   1. Go to: https://github.com/justadudewhohacks/face-api.js-models');
                console.log('   2. Download the repository');
                console.log('   3. Copy the weights folder contents to: frontend/models/');
                console.log('   4. Reload the page');
                return false;
            }
            // Continue to next CDN
            continue;
        }
    }
    
    return false;
}

/**
 * Load all registered students and create face matcher
 */
async function loadStudents() {
    try {
        console.log('📡 Fetching students from API...');
        const response = await fetch(`${API_BASE}/students`);
        const data = await response.json();
        
        if (response.ok) {
            students = data.students || [];
            console.log(`📚 Found ${students.length} registered students`);
            
            if (students.length === 0) {
                console.warn('⚠️ No students registered in the system');
                showAlert('⚠️ No students registered. Please register at least one student first.', 'error');
                return;
            }
            
            // Process students sequentially to avoid TensorFlow backend conflicts
            const labeledDescriptors = [];
            for (const student of students) {
                try {
                    console.log(`🔄 Processing student: ${student.rollNumber}`);
                    
                    // Check if models are loaded
                    if (!faceapi || !faceapi.nets || !faceapi.nets.tinyFaceDetector.isLoaded) {
                        console.error(`❌ Models not loaded for ${student.rollNumber}`);
                        labeledDescriptors.push(null);
                        continue;
                    }
                    
                    const refResponse = await fetch(`${API_BASE}/students/${student.rollNumber}/reference`);
                    const refData = await refResponse.json();
                    
                    if (!refData.referenceImage) {
                        console.warn(`⚠️ No reference image for ${student.rollNumber}`);
                        labeledDescriptors.push(null);
                        continue;
                    }
                        
                    // Handle base64 image (might already include data:image prefix)
                    let imageData = refData.referenceImage;
                    if (!imageData.startsWith('data:')) {
                        imageData = `data:image/jpeg;base64,${imageData}`;
                    }
                    
                    // Create image element
                    const img = document.createElement('img');
                    img.crossOrigin = 'anonymous';
                    
                    // Load image and compute descriptor
                    await new Promise((resolve, reject) => {
                        img.onload = () => {
                            console.log(`✅ Image loaded for ${student.rollNumber}`);
                            resolve();
                        };
                        img.onerror = (err) => {
                            console.error(`❌ Image load error for ${student.rollNumber}:`, err);
                            reject(err);
                        };
                        img.src = imageData;
                    });
                    
                    // Wait for image to be fully ready
                    await new Promise(resolve => setTimeout(resolve, 200));
                    
                    // Ensure image is fully rendered
                    if (!img.complete || img.naturalWidth === 0) {
                        console.warn(`⚠️ Image not fully loaded for ${student.rollNumber}, waiting longer...`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    
                    // Convert image to canvas for better TensorFlow compatibility
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth || img.width;
                    canvas.height = img.naturalHeight || img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    console.log(`🖼️ Canvas created: ${canvas.width}x${canvas.height} for ${student.rollNumber}`);
                    
                    // Compute face descriptor with error handling
                    let detection;
                    try {
                        // Ensure TensorFlow backend is ready and initialized
                        if (typeof tf !== 'undefined') {
                            try {
                                await tf.ready();
                                
                                // Force backend initialization
                                const backend = tf.getBackend();
                                if (!backend) {
                                    console.warn('⚠️ No TensorFlow backend, initializing...');
                                    // Try to set webgl backend
                                    try {
                                        await tf.setBackend('webgl');
                                        await tf.ready();
                                    } catch (e) {
                                        console.warn('WebGL backend failed, trying CPU:', e);
                                        await tf.setBackend('cpu');
                                        await tf.ready();
                                    }
                                }
                                console.log(`✅ TensorFlow backend: ${tf.getBackend()}`);
                            } catch (tfError) {
                                console.warn('⚠️ TensorFlow ready check failed:', tfError);
                            }
                        }
                        
                        // Verify models are still loaded
                        if (!faceapi.nets.tinyFaceDetector.isLoaded) {
                            console.error('❌ Models unloaded during processing');
                            labeledDescriptors.push(null);
                            continue;
                        }
                        
                        console.log(`🔍 Starting face detection for ${student.rollNumber}...`);
                        
                        // Small delay to ensure everything is ready
                        await new Promise(resolve => setTimeout(resolve, 50));
                        
                        // Use canvas with explicit options
                        const options = new faceapi.TinyFaceDetectorOptions();
                        detection = await faceapi
                            .detectSingleFace(canvas, options)
                            .withFaceLandmarks()
                            .withFaceDescriptor();
                        
                        console.log(`✅ Face detection complete for ${student.rollNumber}`);
                    } catch (detectError) {
                        console.error(`❌ Face detection error for ${student.rollNumber}:`, detectError);
                        console.error('Error details:', detectError.message);
                        
                        // Try alternative: use img with simpler options
                        try {
                            console.log(`🔄 Trying alternative detection method for ${student.rollNumber}...`);
                            detection = await faceapi
                                .detectSingleFace(img)
                                .withFaceLandmarks()
                                .withFaceDescriptor();
                            console.log(`✅ Alternative method worked for ${student.rollNumber}`);
                        } catch (altError) {
                            console.error(`❌ Alternative method also failed:`, altError);
                            labeledDescriptors.push(null);
                            continue;
                        }
                    }
                    
                    if (detection && detection.descriptor) {
                        console.log(`✅ Face descriptor computed for ${student.rollNumber}`);
                        labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(
                            student.rollNumber,
                            [detection.descriptor]
                        ));
                    } else {
                        console.warn(`⚠️ No face detected in reference image for ${student.rollNumber}`);
                        labeledDescriptors.push(null);
                    }
                } catch (error) {
                    console.error(`❌ Error loading descriptor for ${student.rollNumber}:`, error);
                    labeledDescriptors.push(null);
                }
            }
            
            // Filter out nulls and create face matcher
            const validDescriptors = labeledDescriptors.filter(d => d !== null);
            console.log(`📊 Valid descriptors: ${validDescriptors.length} out of ${students.length} students`);
            
            if (validDescriptors.length > 0) {
                // Use threshold from settings
                faceMatcher = new faceapi.FaceMatcher(validDescriptors, settings.detectionThreshold);
                console.log(`✅ Face matcher created with ${validDescriptors.length} students (threshold: ${settings.detectionThreshold})`);
                showAlert(`✅ Loaded ${validDescriptors.length} student profiles`, 'success');
            } else {
                console.warn('⚠️ No valid student faces found');
                showAlert('⚠️ No valid student faces found. Please register students first.', 'error');
                faceMatcher = null; // Explicitly set to null
            }
        }
    } catch (error) {
        console.error('Error loading students:', error);
        showAlert('Error loading students', 'error');
    }
}

/**
 * Load classes for dropdown
 */
async function loadClasses() {
    try {
        const response = await fetch(`${API_BASE}/classes`);
        const data = await response.json();
        
        const select = document.getElementById('selectedClass');
        select.innerHTML = '<option value="">Select a class...</option>';
        
        if (response.ok && data.classes) {
            data.classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls._id;
                option.textContent = `${cls.className} (${cls.startTime} - ${cls.endTime})`;
                option.dataset.duration = cls.duration;
                option.dataset.className = cls.className;
                select.appendChild(option);
            });
            
            document.getElementById('startMonitoringBtn').disabled = false;
        }
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    document.getElementById('startMonitoringBtn').addEventListener('click', startMonitoring);
    document.getElementById('stopMonitoringBtn').addEventListener('click', stopMonitoring);
    
    // Settings event listeners
    const thresholdSlider = document.getElementById('detectionThreshold');
    const thresholdValue = document.getElementById('thresholdValue');
    const presenceSlider = document.getElementById('presencePercentage');
    const presenceValue = document.getElementById('presenceValue');
    
    thresholdSlider.addEventListener('input', (e) => {
        settings.detectionThreshold = parseFloat(e.target.value);
        thresholdValue.textContent = settings.detectionThreshold.toFixed(2);
    });
    
    presenceSlider.addEventListener('input', (e) => {
        settings.presencePercentage = parseInt(e.target.value);
        presenceValue.textContent = settings.presencePercentage + '%';
    });
    
    document.getElementById('showBoundingBoxes').addEventListener('change', (e) => {
        settings.showBoundingBoxes = e.target.checked;
    });
    
    document.getElementById('autoSaveAttendance').addEventListener('change', (e) => {
        settings.autoSaveAttendance = e.target.checked;
    });
}

/**
 * Start monitoring
 */
async function startMonitoring() {
    console.log('🔄 Starting monitoring...');
    
    const classSelect = document.getElementById('selectedClass');
    const selectedOption = classSelect.options[classSelect.selectedIndex];
    
    if (!selectedOption || !selectedOption.value) {
        showAlert('Please select a class first', 'error');
        return;
    }
    
    currentClassId = classSelect.value;
    currentClassName = selectedOption.dataset.className;
    classDuration = parseInt(selectedOption.dataset.duration) * 60; // Convert to seconds
    monitoringStartTime = Date.now();
    
    // Log current settings
    console.log('⚙️ Monitoring Settings:');
    console.log(`  - Detection Threshold: ${settings.detectionThreshold}`);
    console.log(`  - Minimum Presence: ${settings.presencePercentage}%`);
    console.log(`  - Show Bounding Boxes: ${settings.showBoundingBoxes}`);
    console.log(`  - Auto-save: ${settings.autoSaveAttendance}`);
    
    console.log(`📚 Selected class: ${currentClassName}, Duration: ${classDuration}s`);
    
    // Check if models are loaded
    if (!faceapi || !faceapi.nets || !faceapi.nets.tinyFaceDetector.isLoaded) {
        showAlert('⚠️ Face recognition models not loaded yet. Please wait...', 'error');
        console.error('❌ Models not loaded');
        return;
    }
    
    // Ensure models are fully loaded before loading students
    console.log('🔍 Verifying models are loaded...');
    if (!faceapi || !faceapi.nets || !faceapi.nets.tinyFaceDetector.isLoaded) {
        showAlert('⚠️ Face recognition models not fully loaded yet. Please wait...', 'error');
        console.error('❌ Models not loaded');
        return;
    }
    console.log('✅ Models verified as loaded');
    
    // Load students
    console.log('👥 Loading students...');
    await loadStudents();
    
    if (!faceMatcher) {
        showAlert('Cannot start monitoring: No student profiles loaded. Please register students first.', 'error');
        console.error('❌ No face matcher available');
        return;
    }
    
    console.log(`✅ Face matcher ready with ${students.length} students`);
    
    // Initialize webcam
    console.log('🎥 Requesting webcam access...');
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: 'user' }
        });
        console.log('✅ Webcam access granted');
        
        const video = document.getElementById('video');
        const canvas = document.getElementById('overlay');
        
        video.srcObject = stream;
        console.log('📹 Video stream attached');
        
        // Wait for video to be ready before setting canvas dimensions
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                // Set canvas dimensions to match video
                canvas.width = video.videoWidth || 640;
                canvas.height = video.videoHeight || 480;
                console.log(`📐 Video metadata loaded: ${canvas.width}x${canvas.height}`);
                resolve();
            };
            
            // Fallback if metadata doesn't fire
            setTimeout(() => {
                if (canvas.width === 0 || canvas.height === 0) {
                    canvas.width = video.videoWidth || 640;
                    canvas.height = video.videoHeight || 480;
                }
                console.log(`📐 Canvas dimensions set (fallback): ${canvas.width}x${canvas.height}`);
                resolve();
            }, 500);
        });
        
        isMonitoring = true;
        detectedStudents.clear();
        
        // Update UI
        document.getElementById('startMonitoringBtn').style.display = 'none';
        document.getElementById('stopMonitoringBtn').style.display = 'block';
        classSelect.disabled = true;
        document.getElementById('statusText').textContent = `Monitoring ${currentClassName}...`;
        
        // Small delay to ensure video is playing
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Start detection loop
        console.log('🎥 Starting face detection loop...');
        detectFaces();
        
        showAlert('Monitoring started. Detecting faces...', 'success');
        console.log('✅ Monitoring active');
    } catch (error) {
        console.error('Error starting webcam:', error);
        let errorMsg = 'Failed to access webcam';
        if (error.name === 'NotAllowedError') {
            errorMsg = 'Camera permission denied. Please allow camera access.';
        } else if (error.name === 'NotFoundError') {
            errorMsg = 'No camera found. Please connect a camera.';
        }
        showAlert(errorMsg, 'error');
    }
}

/**
 * Stop monitoring
 */
async function stopMonitoring() {
    isMonitoring = false;
    
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
    }
    
    // Stop webcam
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    // Mark attendance for all detected students (if auto-save enabled)
    if (settings.autoSaveAttendance) {
        await markAttendanceForAll();
    }
    
    // Update UI
    document.getElementById('startMonitoringBtn').style.display = 'block';
    document.getElementById('stopMonitoringBtn').style.display = 'none';
    document.getElementById('selectedClass').disabled = false;
    document.getElementById('statusText').textContent = 'Not monitoring';
    
    showAlert('Monitoring stopped. Attendance has been saved.', 'success');
    
    // Clear video
    const video = document.getElementById('video');
    video.srcObject = null;
    
    const canvas = document.getElementById('overlay');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Detect faces in video stream
 */
async function detectFaces() {
    if (!isMonitoring) return;
    
    const video = document.getElementById('video');
    const canvas = document.getElementById('overlay');
    const ctx = canvas.getContext('2d');
    
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(detectFaces);
        return;
    }
    
    try {
        // Ensure canvas is properly sized
        if (canvas.width === 0 || canvas.height === 0) {
            const width = video.videoWidth || 640;
            const height = video.videoHeight || 480;
            canvas.width = width;
            canvas.height = height;
            console.log(`📐 Canvas resized to: ${width}x${height}`);
        }
        
        // Check if faceMatcher is available
        if (!faceMatcher) {
            console.warn('⚠️ Face matcher not ready yet, waiting...');
            setTimeout(() => requestAnimationFrame(detectFaces), 100);
            return;
        }
        
        // Check if models are loaded
        if (!faceapi.nets.tinyFaceDetector.isLoaded) {
            console.warn('⚠️ Models not loaded yet, waiting...');
            setTimeout(() => requestAnimationFrame(detectFaces), 100);
            return;
        }
        
        // Detect faces
        const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptors();
        
        // Log detection count (only occasionally to avoid spam)
        if (Math.random() < 0.1 && detections.length > 0) {
            console.log(`👤 Detected ${detections.length} face(s) in frame`);
        }
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Match faces
        detections.forEach(detection => {
            if (!detection.descriptor) return;
            
            const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
            
            // Use threshold from settings
            if (bestMatch.label !== 'unknown' && bestMatch.distance < settings.detectionThreshold) {
                const rollNumber = bestMatch.label;
                const student = students.find(s => s.rollNumber === rollNumber);
                
                // Update detection tracking
                const now = Date.now();
                if (!detectedStudents.has(rollNumber)) {
                    detectedStudents.set(rollNumber, {
                        duration: 0,
                        startTime: now,
                        lastSeen: now,
                        detections: [],
                        engagement: {
                            lookingForward: 0,
                            lookingAway: 0,
                            totalFrames: 0,
                            score: 0
                        }
                    });
                }
                
                const studentData = detectedStudents.get(rollNumber);
                studentData.lastSeen = now;
                studentData.duration = Math.floor((now - studentData.startTime) / 1000);

                // Calculate engagement based on head pose
                const headPose = calculateHeadPose(detection.landmarks);
                const isEngaged = headPose.isLookingForward;

                if (isEngaged) {
                   studentData.engagement.lookingForward++;
                } else {
                   studentData.engagement.lookingAway++;
                }
                   studentData.engagement.totalFrames++;
                   studentData.engagement.score = Math.round((studentData.engagement.lookingForward / studentData.engagement.totalFrames) * 100);

                   studentData.detections.push({
                   timestamp: new Date(),
                   confidence: 1 - bestMatch.distance,
                   engagement: isEngaged
                });
                
                // Draw detection box (only if enabled in settings)
                if (settings.showBoundingBoxes) {
                    const box = detection.detection.box;
                    ctx.strokeStyle = '#00ff00';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(box.x, box.y, box.width, box.height);
                    
                    // Draw label with engagement
const engagementScore = studentData.engagement.score || 0;
const engagementColor = engagementScore >= 80 ? '#00ff00' : 
                        engagementScore >= 50 ? '#ffa500' : '#ff0000';

ctx.fillStyle = engagementColor;
ctx.font = '16px Arial';
ctx.fillText(`${student ? student.name : rollNumber} - ${engagementScore}%`, box.x, box.y - 5);

// Change box color based on engagement
ctx.strokeStyle = engagementColor;
                }
            }
        });
        
        // Update detected students display
        updateDetectedStudentsDisplay();
        
        // Continue detection
        requestAnimationFrame(detectFaces);
    } catch (error) {
        console.error('Detection error:', error);
        requestAnimationFrame(detectFaces);
    }
}
/**
 * Calculate head pose from facial landmarks
 * Determines if student is looking forward or away
 */
function calculateHeadPose(landmarks) {
    // Get key facial points
    const nose = landmarks.positions[30]; // Nose tip
    const leftEye = landmarks.positions[36]; // Left eye outer corner
    const rightEye = landmarks.positions[45]; // Right eye outer corner
    const leftMouth = landmarks.positions[48]; // Left mouth corner
    const rightMouth = landmarks.positions[54]; // Right mouth corner
    
    // Calculate face center
    const faceCenter = {
        x: (leftEye.x + rightEye.x) / 2,
        y: (leftEye.y + rightEye.y) / 2
    };
    
    // Calculate horizontal deviation (how far nose is from center)
    const horizontalDeviation = Math.abs(nose.x - faceCenter.x);
    const eyeDistance = Math.abs(rightEye.x - leftEye.x);
    const deviationRatio = horizontalDeviation / eyeDistance;
    
    // Calculate vertical tilt
    const verticalDeviation = Math.abs(nose.y - faceCenter.y);
    const verticalRatio = verticalDeviation / eyeDistance;
    
    // Thresholds for "looking forward"
    const isLookingForward = deviationRatio < 0.3 && verticalRatio < 0.5;
    
    return {
        isLookingForward,
        horizontalDeviation: deviationRatio,
        verticalDeviation: verticalRatio,
        direction: deviationRatio < 0.3 ? 'forward' : (nose.x > faceCenter.x ? 'right' : 'left')
    };
}

/**
 * Update detected students display
 */
function updateDetectedStudentsDisplay() {
    const container = document.getElementById('detectedStudents');
    
    if (detectedStudents.size === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No students detected yet.</p>';
        return;
    }
    
    let html = '<table><thead><tr><th>Roll Number</th><th>Name</th><th>Presence Duration</th><th>Engagement</th><th>Status</th></tr></thead><tbody>';
    
        detectedStudents.forEach((data, rollNumber) => {
            const student = students.find(s => s.rollNumber === rollNumber);
            const presencePercent = (data.duration / classDuration) * 100;
            // Use presence percentage from settings
            const isPresent = presencePercent >= settings.presencePercentage;
        const statusClass = isPresent ? 'status-present' : 'status-absent';
        const statusText = isPresent ? 'Present' : 'Absent';
        
        const engagementScore = data.engagement.score || 0;
const engagementClass = engagementScore >= 80 ? 'engagement-high' : 
                        engagementScore >= 50 ? 'engagement-medium' : 'engagement-low';
const engagementColor = engagementScore >= 80 ? '#00ff00' : 
                        engagementScore >= 50 ? '#ffa500' : '#ff0000';

html += `
    <tr>
        <td>${rollNumber}</td>
        <td>${student ? student.name : 'Unknown'}</td>
        <td>${Math.floor(data.duration / 60)}m ${data.duration % 60}s (${presencePercent.toFixed(1)}%)</td>
        <td>
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 100%; background: #e0e0e0; border-radius: 10px; height: 20px; overflow: hidden;">
                    <div style="width: ${engagementScore}%; background: ${engagementColor}; height: 100%; transition: width 0.3s;"></div>
                </div>
                <span style="color: ${engagementColor}; font-weight: bold; min-width: 45px;">${engagementScore}%</span>
            </div>
        </td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
    </tr>
`;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

/**
 * Mark attendance for all detected students
 */
async function markAttendanceForAll() {
    for (const [rollNumber, data] of detectedStudents.entries()) {
        const student = students.find(s => s.rollNumber === rollNumber);
        if (!student) continue;
        
        try {
            await fetch(`${API_BASE}/attendance/mark`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    studentId: student._id || student.id,
                    rollNumber: rollNumber,
                    className: currentClassName,
                    classId: currentClassId,
                    presenceDuration: data.duration,
                    classDuration: classDuration,
                    detections: data.detections,
                    engagementScore: data.engagement.score,
                    engagementData: data.engagement
                })
            });
        } catch (error) {
            console.error(`Error marking attendance for ${rollNumber}:`, error);
        }
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
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});

