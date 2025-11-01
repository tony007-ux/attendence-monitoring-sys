# 🚀 Server Setup Complete!

## ✅ Server Status

Your attendance monitoring server has been set up and started!

### Server Information

- **Status**: Running in background
- **URL**: http://localhost:3000
- **MongoDB**: Connected to `mongodb://localhost:27017/attendance-monitoring`
- **Port**: 3000

## 🌐 Access Your Application

Open your web browser and visit:

### Main Pages:
- **Home Page**: http://localhost:3000
- **Student Registration**: http://localhost:3000/register
- **Admin Dashboard**: http://localhost:3000/admin
- **Live Tracking**: http://localhost:3000/live
- **Analytics**: http://localhost:3000/analytics

## 📋 Next Steps

### 1. Test the Server
Open your browser and go to: **http://localhost:3000**

You should see the home page with navigation cards.

### 2. Register a Student
1. Go to: http://localhost:3000/register
2. Fill in student details
3. Capture face with webcam
4. Click "Register Student"

### 3. Schedule a Class (Admin)
1. Go to: http://localhost:3000/admin
2. Add a class schedule with:
   - Class name (e.g., CS-301)
   - Start time and end time
   - Day of week

### 4. Monitor Attendance
1. Go to: http://localhost:3000/live
2. Select a class
3. Click "Start Monitoring"
4. Allow webcam access
5. The system will automatically detect faces

## 🔧 Server Commands

### Stop the Server
Press `Ctrl+C` in the terminal where it's running, or:
```powershell
Get-Process node | Stop-Process
```

### Restart the Server
```bash
cd "C:\Users\lenovo\OneDrive\Desktop\cursor project\backend"
npm start
```

### Check Server Status
Open browser and go to: http://localhost:3000

## 🐛 Troubleshooting

### Server Not Responding?

1. **Check if MongoDB is running:**
   ```powershell
   Test-NetConnection -ComputerName localhost -Port 27017
   ```

2. **Check if port 3000 is in use:**
   ```powershell
   netstat -ano | findstr :3000
   ```

3. **Check server logs:**
   - Look at the terminal where you ran `npm start`
   - Check for error messages

### MongoDB Connection Issues?

1. **Verify MongoDB is installed and running:**
   - Check Windows Services for "MongoDB"
   - Or run: `Get-Service MongoDB`

2. **Test MongoDB connection:**
   ```powershell
   Test-NetConnection -ComputerName localhost -Port 27017
   ```

### Webcam Not Working?

1. **Allow camera permissions** in your browser
2. **Check if another app is using the webcam**
3. **Try Chrome or Firefox** (better webcam support)

## 📝 Server Configuration

- **Config File**: `backend/.env`
- **Database**: MongoDB (local)
- **Dependencies**: Installed in `backend/node_modules/`

## ✨ You're All Set!

Your attendance monitoring system is ready to use. Start by:
1. Registering students
2. Scheduling classes
3. Monitoring attendance
4. Viewing analytics

**Happy Monitoring! 🎓**

