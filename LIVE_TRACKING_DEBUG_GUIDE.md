# 🔍 Live Tracking Debugging Guide

## ✅ Major Fixes Applied

### 1. **Enhanced Library Loading**
- ✅ Added retry mechanism for face-api.js loading
- ✅ Multiple CDN fallbacks (jsdelivr → unpkg)
- ✅ Better error detection and reporting

### 2. **Improved Model Loading**
- ✅ Tries 4 different sources in order:
  1. Local `/models` directory
  2. GitHub raw content
  3. JSDelivr CDN
  4. Unpkg CDN
- ✅ Detailed logging at each step
- ✅ Clear error messages if all fail

### 3. **Better Initialization**
- ✅ Waits properly for scripts to load
- ✅ Checks model loading status before starting
- ✅ Comprehensive console logging

### 4. **Enhanced Error Handling**
- ✅ Checks if models are loaded before use
- ✅ Validates face matcher exists
- ✅ Specific error messages for each failure point

## 🧪 How to Debug

### Step 1: Open Browser Console
1. Press **F12** or right-click → **Inspect**
2. Go to **Console** tab
3. Clear the console (🚫 icon)

### Step 2: Reload Page
- Refresh the page: http://localhost:3000/live
- Watch for initialization messages

### Expected Console Output:
```
🔄 Initializing live tracking page...
✅ face-api.js library found
🔄 Starting model loading...
🔄 Trying to load models from: /models (attempt 1/4)
⚠️ Local models not found, skipping...
🔄 Trying to load models from: https://raw.githubusercontent.com/... (attempt 2/4)
⏳ Loading models from https://raw.githubusercontent.com/...
✅ Successfully loaded models from: https://raw.githubusercontent.com/...
✅ Initialization complete
```

### Step 3: Try Starting Monitoring

**Before clicking "Start Monitoring":**
1. Select a class from dropdown
2. Check console for any errors

**After clicking "Start Monitoring":**
Expected output:
```
🔄 Starting monitoring...
📚 Selected class: CS-301, Duration: 5400s
👥 Loading students...
✅ Face matcher ready with 5 students
🎥 Starting face detection loop...
✅ Monitoring active
```

## 🐛 Common Issues & Solutions

### Issue 1: "face-api.js library not loaded"
**Symptoms:** Error message appears immediately

**Solutions:**
1. Check internet connection
2. Try refreshing the page
3. Check browser console for script loading errors
4. Try disabling browser extensions
5. Use a different browser (Chrome recommended)

### Issue 2: "Failed to load models from all sources"
**Symptoms:** Models won't load from any CDN

**Solutions:**
1. **Download models manually:**
   - Go to: https://github.com/justadudewhohacks/face-api.js-models
   - Download the repository
   - Extract the `weights` folder
   - Copy all files to: `frontend/models/`
   - Reload page

2. **Check network connectivity:**
   - Some networks block GitHub raw content
   - Try a different network or VPN

### Issue 3: "No student profiles loaded"
**Symptoms:** Can't start monitoring even with models loaded

**Solutions:**
1. Register at least one student first
   - Go to: http://localhost:3000/register
   - Register a student with face capture
   - Return to live tracking page

### Issue 4: Webcam Not Working
**Symptoms:** Camera permission denied or no video

**Solutions:**
1. **Permission Denied:**
   - Click camera icon in browser address bar
   - Select "Allow"
   - Refresh page

2. **No Camera Found:**
   - Check if camera is connected
   - Check if another app is using camera
   - Restart browser

### Issue 5: Faces Not Detected
**Symptoms:** Video shows but no face boxes

**Solutions:**
1. Ensure good lighting
2. Face the camera directly
3. Move closer to camera
4. Check console for detection errors
5. Verify student is registered

## 📊 Debug Checklist

Use this checklist to diagnose issues:

- [ ] Browser console shows no red errors
- [ ] face-api.js loaded (see ✅ in console)
- [ ] Models loaded successfully
- [ ] Classes loaded in dropdown
- [ ] At least one student registered
- [ ] Camera permission granted
- [ ] Video feed displays
- [ ] Face detection running (see console logs)
- [ ] Face boxes appear around detected faces

## 🔧 Advanced Debugging

### Enable Detailed Logging

The code already has extensive logging. To see more details:

1. Open console
2. Look for emoji-prefixed messages:
   - 🔄 = Process starting
   - ✅ = Success
   - ❌ = Error
   - ⚠️ = Warning
   - 📚 = Class info
   - 👥 = Student info
   - 🎥 = Video/Detection

### Test Each Component

**Test 1: Library Loading**
```javascript
// In browser console, type:
typeof faceapi
// Should return: "object"
```

**Test 2: Models Loading**
```javascript
// In browser console, type:
faceapi.nets.tinyFaceDetector.isLoaded
// Should return: true
```

**Test 3: Face Detection**
```javascript
// In browser console, type:
faceapi.detectAllFaces
// Should return: function
```

## 📝 What to Report

If it still doesn't work, provide:
1. Browser console errors (screenshot or copy)
2. Which step fails (models, webcam, detection)
3. Browser name and version
4. Any error messages shown

## ✅ Success Indicators

When everything works, you should see:
- ✅ Green boxes around detected faces
- ✅ Student names above boxes
- ✅ Detected students table updating
- ✅ Presence duration counting
- ✅ Console showing detection logs

---

**Last Updated:** After comprehensive fixes
**Status:** Ready for testing with enhanced debugging

