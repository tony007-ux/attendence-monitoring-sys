# 📊 MongoDB Database - What We're Storing

## ✅ Yes, We ARE Using MongoDB!

Your attendance monitoring system uses **MongoDB** as the database to store all data persistently.

---

## 🗄️ What Data is Stored in MongoDB?

### 1. **Student Collection** (`students`)
Stores all registered students:

```javascript
{
  name: "John Doe",                    // Student full name
  rollNumber: "CS2024001",             // Unique roll number (uppercase)
  className: "CS-301",                 // Class name
  referenceImage: "data:image/...",     // Base64 encoded face image
  faceDescriptor: [0.12, -0.45, ...],  // Face recognition data (128 numbers)
  registeredAt: "2024-01-15T10:30:00", // Registration timestamp
  createdAt: "2024-01-15T10:30:00",    // Auto-generated
  updatedAt: "2024-01-15T10:30:00"     // Auto-updated
}
```

**Purpose**: Stores student profiles with their face reference images.

---

### 2. **Class Collection** (`classes`)
Stores class schedules:

```javascript
{
  className: "CS-301",                 // Class name
  startTime: "09:00",                  // 24-hour format
  endTime: "10:30",                    // 24-hour format
  dayOfWeek: "Monday",                 // or "Daily"
  duration: 90,                        // Duration in minutes
  isActive: true,                      // Whether monitoring is active
  createdAt: "2024-01-15T08:00:00",
  updatedAt: "2024-01-15T08:00:00"
}
```

**Purpose**: Stores class schedules for automatic attendance monitoring.

---

### 3. **Attendance Collection** (`attendances`)
Stores attendance records:

```javascript
{
  studentId: ObjectId("..."),          // Reference to Student
  rollNumber: "CS2024001",             // Quick lookup
  studentName: "John Doe",             // Quick reference
  className: "CS-301",                 // Class name
  classId: ObjectId("..."),            // Reference to Class
  date: "2024-01-15T09:00:00",         // Class date/time
  status: "Present",                   // or "Absent"
  presenceDuration: 4800,               // Seconds student was detected
  requiredDuration: 4050,              // Required seconds (75% of class)
  classDuration: 5400,                 // Total class duration in seconds
  detectionLog: [                      // Detailed detection history
    { timestamp: "2024-01-15T09:05:00", confidence: 0.92 },
    { timestamp: "2024-01-15T09:10:00", confidence: 0.88 },
    // ... more detections
  ],
  createdAt: "2024-01-15T10:30:00",
  updatedAt: "2024-01-15T10:30:00"
}
```

**Purpose**: Stores individual attendance records for each class session.

---

## 🔌 MongoDB Connection

### Connection String (in `backend/.env`):
```
MONGODB_URI=mongodb://localhost:27017/attendance-monitoring
```

- **Host**: `localhost`
- **Port**: `27017` (default MongoDB port)
- **Database Name**: `attendance-monitoring`

---

## 📈 Database Benefits

1. **Persistent Storage**: All data survives server restarts
2. **Fast Queries**: Indexed fields for quick lookups
3. **Scalable**: Can handle thousands of students and classes
4. **Flexible Schema**: Easy to add new fields
5. **Relationships**: Uses references between collections

---

## 🗂️ Database Structure Summary

```
attendance-monitoring (Database)
├── students (Collection)
│   ├── Stores: Name, Roll Number, Class, Face Image, Face Descriptor
│   └── Indexes: rollNumber, className
│
├── classes (Collection)
│   ├── Stores: Class Name, Times, Day, Duration, Active Status
│   └── Indexes: className, startTime
│
└── attendances (Collection)
    ├── Stores: Student ID, Class ID, Date, Status, Duration, Detection Log
    └── Indexes: studentId+date, className+date, date
```

---

## 💾 Data Flow

1. **Registration**: Student data → MongoDB `students` collection
2. **Class Setup**: Class schedule → MongoDB `classes` collection
3. **Attendance**: Detection results → MongoDB `attendances` collection
4. **Analytics**: Read from MongoDB → Calculate efficiency → Display

---

## 🔍 How to View Data

### Option 1: MongoDB Compass (GUI Tool)
1. Download from: https://www.mongodb.com/products/compass
2. Connect to: `mongodb://localhost:27017`
3. Browse database: `attendance-monitoring`

### Option 2: MongoDB Shell (Command Line)
```bash
# Connect to MongoDB
mongo

# Use the database
use attendance-monitoring

# View students
db.students.find()

# View classes
db.classes.find()

# View attendance
db.attendances.find()
```

### Option 3: Node.js (In Your Code)
The backend already has API endpoints to view data:
- `GET /api/students` - Get all students
- `GET /api/classes` - Get all classes
- `GET /api/attendance` - Get attendance records

---

## ✅ Confirmation

**YES, we are 100% using MongoDB!**

- ✅ Database: MongoDB
- ✅ Connection: Local MongoDB instance
- ✅ Collections: Students, Classes, Attendances
- ✅ Storage: All data is persistent and saved
- ✅ Location: `mongodb://localhost:27017/attendance-monitoring`

All student registrations, class schedules, and attendance records are stored in MongoDB and persist even after server restarts!

