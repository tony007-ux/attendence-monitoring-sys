# 🎓 College Attendance Monitoring System

A complete web-based attendance monitoring system that uses face recognition to automatically track student attendance. Built with HTML, CSS, JavaScript (frontend), Node.js + Express (backend), and MongoDB (database).

## ✨ Features

- **Student Registration**: Students can register with their face captured via webcam
- **Automatic Attendance**: Face recognition automatically detects and marks attendance
- **Class Scheduling**: Admin can schedule classes with specific times
- **Real-time Monitoring**: Live video feed with face detection and recognition
- **Efficiency Tracking**: Calculate and display attendance efficiency for each student
- **75% Rule**: Students must be visible for at least 75% of class duration to be marked present
- **Beautiful UI**: Clean, modern, and responsive design

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Face Recognition**: face-api.js (TensorFlow.js based)

## 📁 Project Structure

```
attendance-monitoring/
├── backend/
│   ├── models/
│   │   ├── Student.js          # Student data model
│   │   ├── Class.js            # Class schedule model
│   │   └── Attendance.js       # Attendance records model
│   ├── routes/
│   │   ├── studentRoutes.js    # Student API endpoints
│   │   ├── classRoutes.js      # Class management endpoints
│   │   ├── attendanceRoutes.js # Attendance endpoints
│   │   └── efficiencyRoutes.js # Efficiency calculation endpoints
│   ├── services/
│   │   └── attendanceMonitor.js # Automatic monitoring service
│   ├── server.js               # Main server file
│   └── package.json            # Backend dependencies
├── frontend/
│   ├── js/
│   │   ├── register.js         # Registration script
│   │   ├── admin.js            # Admin dashboard script
│   │   ├── live.js             # Live tracking script
│   │   └── analytics.js        # Analytics script
│   ├── index.html              # Home page
│   ├── register.html           # Student registration page
│   ├── admin.html              # Admin dashboard
│   ├── live.html               # Live attendance tracking
│   ├── analytics.html          # Efficiency analytics
│   └── styles.css              # Global styles
└── README.md                   # This file
```

## 🚀 Installation & Setup

### Prerequisites

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
3. **Webcam/Camera** - For face capture and recognition

### Step 1: Install MongoDB

**Windows:**
- Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
- Install and start MongoDB service
- MongoDB will run on `mongodb://localhost:27017` by default

**Mac (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### Step 2: Clone/Download Project

Download or clone this project to your local machine.

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 4: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
copy .env.example .env
```

Edit `.env` and set your MongoDB connection string:

```
MONGODB_URI=mongodb://localhost:27017/attendance-monitoring
PORT=3000
```

**For MongoDB Atlas (Cloud):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance-monitoring
PORT=3000
```

### Step 5: Start the Server

```bash
# From the backend directory
npm start

# Or for development with auto-reload
npm run dev
```

The server will start on `http://localhost:3000`

### Step 6: Access the Application

Open your web browser and navigate to:

- **Home**: http://localhost:3000
- **Student Registration**: http://localhost:3000/register
- **Admin Dashboard**: http://localhost:3000/admin
- **Live Tracking**: http://localhost:3000/live
- **Analytics**: http://localhost:3000/analytics

## 📖 Usage Guide

### 1. Register Students

1. Go to **Student Registration** page
2. Fill in:
   - Full Name
   - Roll Number (must be unique)
   - Class Name
3. Click "Capture Face" to take a photo using your webcam
4. Review the captured image
5. Click "Register Student"

**Note**: Each student needs to register only once. The captured face image is stored as their reference profile.

### 2. Schedule Classes (Admin)

1. Go to **Admin Dashboard**
2. In the "Add Class Schedule" section, enter:
   - Class Name (e.g., CS-301)
   - Start Time (24-hour format, e.g., 09:00)
   - End Time (e.g., 10:30)
   - Day of Week (or "Daily" for every day)
3. Click "Add Class Schedule"

**Note**: The system will automatically start monitoring at the scheduled start time.

### 3. Live Attendance Monitoring

1. Go to **Live Tracking** page
2. Select a class from the dropdown
3. Click "Start Monitoring"
4. Allow webcam access when prompted
5. The system will:
   - Detect faces in real-time
   - Match detected faces with registered students
   - Track presence duration for each student
   - Display detected students with their status
6. Click "Stop Monitoring" when done (attendance is automatically saved)

**How Attendance is Marked:**
- Students must be detected for **75% of the class duration** to be marked "Present"
- Otherwise, they are marked "Absent"
- Detection happens continuously during the monitoring period

### 4. View Analytics

1. Go to **Analytics** page
2. **Search Individual Student**: Enter roll number and click "Search"
3. **View All Students**: Click "Load All Students" to see efficiency of all registered students

**Efficiency Calculation:**
```
Efficiency = (Classes Attended / Total Classes) × 100
```

## 🔧 API Endpoints

### Student Endpoints

- `POST /api/students/register` - Register a new student
- `GET /api/students` - Get all students
- `GET /api/students/:rollNumber` - Get student by roll number
- `GET /api/students/:rollNumber/reference` - Get student's reference image

### Class Endpoints

- `POST /api/classes/add` - Add a new class schedule
- `GET /api/classes` - Get all classes
- `PUT /api/classes/:id` - Update a class
- `DELETE /api/classes/:id` - Delete a class

### Attendance Endpoints

- `POST /api/attendance/mark` - Mark attendance for a student
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/today/:className` - Get today's attendance for a class
- `GET /api/attendance/stats` - Get attendance statistics

### Efficiency Endpoints

- `GET /api/efficiency` - Get efficiency for all students
- `GET /api/efficiency/:studentId` - Get efficiency for a specific student
- `GET /api/efficiency/roll/:rollNumber` - Get efficiency by roll number

## 🎯 How It Works

1. **Registration Phase**: Students register with their face image stored as reference
2. **Scheduling Phase**: Admin creates class schedules with specific times
3. **Monitoring Phase**: 
   - System automatically starts monitoring at scheduled class times
   - Live video feed captures faces
   - face-api.js detects and recognizes faces
   - Matches detected faces with registered student profiles
   - Tracks presence duration
4. **Marking Phase**: 
   - At end of class, attendance is automatically saved
   - Students with ≥75% presence are marked "Present"
   - Others marked "Absent"
5. **Analytics Phase**: Efficiency calculated and displayed

## 🔒 Security Notes

- This is a **development/educational project**
- For production use, consider adding:
  - User authentication (login system)
  - HTTPS encryption
  - Input validation and sanitization
  - Rate limiting
  - Secure storage of sensitive data

## 🐛 Troubleshooting

### MongoDB Connection Error

**Error**: `MongoDB connection error`

**Solution**:
- Ensure MongoDB is running: `mongod` or check MongoDB service
- Verify connection string in `.env` file
- Check if MongoDB is running on default port 27017

### Webcam Not Working

**Error**: `Failed to access webcam`

**Solution**:
- Allow camera permissions in browser
- Check if another application is using the webcam
- Try a different browser (Chrome/Firefox recommended)

### Face Recognition Models Not Loading

**Error**: `Error loading face recognition models`

**Solution**:
- Check internet connection (models load from CDN)
- For offline use, download face-api.js weights and host locally
- Update model paths in `frontend/js/live.js`

### Port Already in Use

**Error**: `Port 3000 already in use`

**Solution**:
- Change PORT in `.env` file
- Or stop the application using port 3000

## 📝 Notes

- **Face Recognition**: Uses face-api.js which runs in the browser
- **Storage**: Student images are stored as Base64 strings in MongoDB
- **Performance**: For large classes (>50 students), consider optimizing face matching
- **Privacy**: Ensure compliance with privacy laws in your region

## 🤝 Contributing

Feel free to fork, modify, and improve this project!

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

- [face-api.js](https://github.com/justadudewhohacks/face-api.js) - Face recognition library
- [TensorFlow.js](https://www.tensorflow.org/js) - Machine learning framework
- [Express.js](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database

---

**Made with ❤️ for automated attendance management**

For issues or questions, please check the troubleshooting section or review the code comments.

