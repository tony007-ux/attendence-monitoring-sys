# Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Install MongoDB
- **Windows**: Download from [mongodb.com](https://www.mongodb.com/try/download/community) and install
- **Mac**: `brew install mongodb-community && brew services start mongodb-community`
- **Linux**: `sudo apt-get install mongodb && sudo systemctl start mongodb`

### Step 2: Install Dependencies
```bash
cd backend
npm install
```

### Step 3: Configure
Create `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/attendance-monitoring
PORT=3000
```

### Step 4: Run
```bash
npm start
```

### Step 5: Open Browser
Go to: http://localhost:3000

## 📋 Testing Checklist

1. ✅ Server starts without errors
2. ✅ MongoDB connection successful
3. ✅ Home page loads
4. ✅ Can register a student
5. ✅ Can add a class schedule
6. ✅ Can access live tracking
7. ✅ Webcam permission granted
8. ✅ Face recognition models load

## 🔧 Troubleshooting

**MongoDB not running?**
```bash
# Check if MongoDB is running
# Windows: Check Services or run mongod
# Mac/Linux: brew services start mongodb-community
```

**Port 3000 in use?**
- Change PORT in `.env` file

**Face models not loading?**
- Check internet connection (models load from CDN)
- For offline: Download models from https://github.com/justadudewhohacks/face-api.js-models
- Place in `frontend/models/` directory

## 📚 Next Steps

1. Register test students
2. Create class schedules
3. Test live monitoring
4. Check analytics

For detailed documentation, see [README.md](README.md)

