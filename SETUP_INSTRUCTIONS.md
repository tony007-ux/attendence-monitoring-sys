# 🚀 Complete Setup Instructions

## Prerequisites

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MongoDB** (v5 or higher)
   - **Windows**: Download from https://www.mongodb.com/try/download/community
   - **Mac**: `brew install mongodb-community && brew services start mongodb-community`
   - **Linux**: `sudo apt-get install mongodb && sudo systemctl start mongodb`

3. **Webcam/Camera** - Required for face capture and recognition

## Installation Steps

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- express (web framework)
- mongoose (MongoDB ODM)
- cors (CORS middleware)
- dotenv (environment variables)
- multer (file uploads)
- node-cron (scheduling)

### Step 3: Configure Environment

Create a `.env` file in the `backend` directory:

**Windows (PowerShell):**
```powershell
cd backend
Copy-Item .env.example .env
```

**Mac/Linux:**
```bash
cd backend
cp .env.example .env
```

Edit `.env` and set your MongoDB connection:

```
MONGODB_URI=mongodb://localhost:27017/attendance-monitoring
PORT=3000
```

**For MongoDB Atlas (Cloud):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance-monitoring
PORT=3000
```

### Step 4: Start MongoDB

**Windows:**
- MongoDB should start automatically as a service
- Or run: `mongod` in a separate terminal

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongodb
```

### Step 5: Start the Server

From the `backend` directory:

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

You should see:
```
✅ Connected to MongoDB successfully
🚀 Server running on http://localhost:3000
```

### Step 6: Access the Application

Open your browser and go to:
- **Home**: http://localhost:3000
- **Student Registration**: http://localhost:3000/register
- **Admin Dashboard**: http://localhost:3000/admin
- **Live Tracking**: http://localhost:3000/live
- **Analytics**: http://localhost:3000/analytics

## First-Time Usage

### 1. Register Students

1. Go to **Student Registration** page
2. Fill in:
   - Full Name
   - Roll Number (must be unique)
   - Class Name
3. Click "Capture Face" to take a photo
4. Click "Register Student"

**Important**: Each student needs to register only once!

### 2. Schedule Classes (Admin)

1. Go to **Admin Dashboard**
2. Fill in:
   - Class Name (e.g., CS-301)
   - Start Time (24-hour format, e.g., 09:00)
   - End Time (e.g., 10:30)
   - Day of Week (or "Daily" for every day)
3. Click "Add Class Schedule"

**Note**: The system automatically starts monitoring at scheduled times.

### 3. Monitor Attendance

1. Go to **Live Tracking** page
2. Select a class from dropdown
3. Click "Start Monitoring"
4. Allow webcam access when prompted
5. Students detected in the camera will be tracked automatically
6. Click "Stop Monitoring" when done

**Attendance Rule**: Students must be visible for at least 75% of class duration to be marked "Present".

### 4. View Analytics

1. Go to **Analytics** page
2. Search by roll number, or
3. Click "Load All Students" to see all efficiency data

## Face Recognition Models

The system uses **face-api.js** which loads models from CDN by default. For better performance:

1. Download models from: https://github.com/justadudewhohacks/face-api.js-models
2. Extract to: `frontend/models/` directory
3. The system will automatically use local models if available

## Project Structure

```
attendance-monitoring/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # Background services
│   ├── server.js        # Main server file
│   ├── package.json     # Dependencies
│   └── .env             # Environment config (create this)
├── frontend/
│   ├── js/              # JavaScript files
│   ├── *.html           # HTML pages
│   └── styles.css       # Global styles
└── README.md            # Full documentation
```

## Troubleshooting

### MongoDB Connection Error

**Error**: `MongoDB connection error`

**Solutions**:
- Ensure MongoDB is running: `mongod` or check services
- Verify connection string in `.env`
- Check MongoDB is on port 27017 (default)

### Webcam Not Working

**Error**: `Failed to access webcam`

**Solutions**:
- Allow camera permissions in browser
- Close other applications using webcam
- Try Chrome or Firefox (better support)

### Face Recognition Models Not Loading

**Error**: Models fail to load from CDN

**Solutions**:
- Check internet connection
- Download models locally (see above)
- Check browser console for specific errors

### Port Already in Use

**Error**: `Port 3000 already in use`

**Solution**: Change PORT in `.env` file to a different port (e.g., 3001)

## API Endpoints

- `POST /api/students/register` - Register student
- `GET /api/students` - Get all students
- `POST /api/classes/add` - Add class schedule
- `GET /api/classes` - Get all classes
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance` - Get attendance records
- `GET /api/efficiency` - Get efficiency for all students
- `GET /api/efficiency/:studentId` - Get efficiency for specific student

## Development Mode

For development with auto-reload:

```bash
cd backend
npm run dev
```

This uses `nodemon` to automatically restart the server when files change.

## Production Deployment

For production:

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2: `pm2 start server.js`
3. Configure MongoDB with authentication
4. Use HTTPS for security
5. Add authentication/authorization

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review code comments
3. Check browser console for errors
4. Check server logs for backend errors

---

**Made with ❤️ for automated attendance management**

