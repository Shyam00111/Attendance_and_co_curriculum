# MERN Backend Documentation

This document provides the complete backend code for the Attendance & Co-Curriculum Management System using Node.js, Express, and MongoDB.

## 📁 Project Structure

```
backend/
├── server.js              # Main server entry point
├── package.json           # Dependencies
├── .env                   # Environment variables
├── config/
│   └── db.js              # Database connection
├── models/
│   ├── User.js            # User model
│   ├── Attendance.js      # Attendance model
│   └── Activity.js        # Activity model
├── routes/
│   ├── auth.js            # Auth routes
│   ├── attendance.js      # Attendance routes
│   └── activity.js        # Activity routes
├── controllers/
│   ├── authController.js
│   ├── attendanceController.js
│   └── activityController.js
└── middleware/
    └── auth.js            # JWT middleware
```

---

## 📦 package.json

```json
{
  "name": "attendance-backend",
  "version": "1.0.0",
  "description": "Backend for Attendance & Co-Curriculum Management System",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

---

## 🔧 .env (Environment Variables)

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/attendance_system
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance_system

# JWT Secret (use a strong random string in production)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development
```

---

## 🗄️ config/db.js (Database Connection)

```javascript
// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

## 📋 Models

### models/User.js

```javascript
// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student'],
    default: 'student'
  }
}, {
  timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

### models/Attendance.js

```javascript
// models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: [true, 'Status is required']
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance for same student on same date
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
```

### models/Activity.js

```javascript
// models/Activity.js
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Sports',
      'Academic',
      'Arts',
      'Community Service',
      'Leadership',
      'Cultural',
      'Technology',
      'Other'
    ]
  },
  date: {
    type: Date,
    required: [true, 'Activity date is required']
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);
```

---

## 🔐 Middleware

### middleware/auth.js

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Role authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
```

---

## 🎮 Controllers

### controllers/authController.js

```javascript
// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student'
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user (include password field)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password match
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { register, login, getMe };
```

### controllers/attendanceController.js

```javascript
// controllers/attendanceController.js
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Mark attendance for students
// @route   POST /api/attendance/mark
// @access  Private (Teacher/Admin)
const markAttendance = async (req, res) => {
  try {
    const { records } = req.body;
    // records: [{ studentId, date, status }]

    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide attendance records'
      });
    }

    const results = [];

    for (const record of records) {
      const { studentId, date, status } = record;

      // Validate student exists
      const student = await User.findById(studentId);
      if (!student || student.role !== 'student') {
        results.push({
          studentId,
          success: false,
          message: 'Student not found'
        });
        continue;
      }

      // Create or update attendance
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);

      const attendance = await Attendance.findOneAndUpdate(
        { studentId, date: attendanceDate },
        {
          studentId,
          date: attendanceDate,
          status,
          markedBy: req.user.id
        },
        { upsert: true, new: true, runValidators: true }
      );

      results.push({
        studentId,
        success: true,
        data: attendance
      });
    }

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get attendance report
// @route   GET /api/attendance/report
// @access  Private
const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, studentId, status } = req.query;

    // Build query
    const query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }

    if (studentId) {
      query.studentId = studentId;
    }

    if (status) {
      query.status = status;
    }

    const attendance = await Attendance.find(query)
      .populate('studentId', 'name email')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    // Calculate statistics
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length
    };

    res.status(200).json({
      success: true,
      count: attendance.length,
      stats,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { markAttendance, getAttendanceReport };
```

### controllers/activityController.js

```javascript
// controllers/activityController.js
const Activity = require('../models/Activity');
const User = require('../models/User');

// @desc    Add a new activity
// @route   POST /api/activity/add
// @access  Private
const addActivity = async (req, res) => {
  try {
    const { studentId, title, description, category, date } = req.body;

    // Validate student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Create activity
    const activity = await Activity.create({
      studentId,
      title,
      description,
      category,
      date: new Date(date),
      addedBy: req.user.id
    });

    // Populate student info
    await activity.populate('studentId', 'name email');

    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all activities
// @route   GET /api/activity/all
// @access  Private
const getAllActivities = async (req, res) => {
  try {
    const { studentId, category, startDate, endDate } = req.query;

    // Build query
    const query = {};

    if (studentId) {
      query.studentId = studentId;
    }

    if (category) {
      query.category = category;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const activities = await Activity.find(query)
      .populate('studentId', 'name email')
      .populate('addedBy', 'name')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete an activity
// @route   DELETE /api/activity/:id
// @access  Private
const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    await activity.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { addActivity, getAllActivities, deleteActivity };
```

---

## 🛣️ Routes

### routes/auth.js

```javascript
// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;
```

### routes/attendance.js

```javascript
// routes/attendance.js
const express = require('express');
const router = express.Router();
const { markAttendance, getAttendanceReport } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// POST /api/attendance/mark - Mark attendance (Teacher/Admin only)
router.post('/mark', authorize('teacher', 'admin'), markAttendance);

// GET /api/attendance/report - Get attendance report
router.get('/report', getAttendanceReport);

module.exports = router;
```

### routes/activity.js

```javascript
// routes/activity.js
const express = require('express');
const router = express.Router();
const { addActivity, getAllActivities, deleteActivity } = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// POST /api/activity/add - Add activity
router.post('/add', addActivity);

// GET /api/activity/all - Get all activities
router.get('/all', getAllActivities);

// DELETE /api/activity/:id - Delete activity (Teacher/Admin only)
router.delete('/:id', authorize('teacher', 'admin'), deleteActivity);

module.exports = router;
```

---

## 🚀 server.js (Main Entry Point)

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/activity', require('./routes/activity'));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Attendance & Co-Curriculum Management API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      attendance: '/api/attendance',
      activity: '/api/activity'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
```

---

## 🏃 How to Run

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup MongoDB

Option A - Local MongoDB:
```bash
# Install MongoDB locally and start the service
mongod
```

Option B - MongoDB Atlas:
- Create a free cluster at https://www.mongodb.com/atlas
- Get your connection string
- Update MONGO_URI in .env

### 3. Configure Environment Variables

```bash
# Copy the .env example and update values
cp .env.example .env
```

### 4. Run the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

---

## 📡 API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/attendance/mark | Mark attendance |
| GET | /api/attendance/report | Get attendance report |

### Activities
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/activity/add | Add new activity |
| GET | /api/activity/all | Get all activities |
| DELETE | /api/activity/:id | Delete activity |

---

## 🔗 Frontend Integration

To connect the React frontend to this backend:

1. Create a `.env` file in your frontend:
```env
VITE_API_URL=http://localhost:5000/api
```

2. Update the AuthContext and data fetching to use Axios:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📝 Example API Requests

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "123456", "role": "teacher"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "123456"}'
```

### Mark Attendance
```bash
curl -X POST http://localhost:5000/api/attendance/mark \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"records": [{"studentId": "STUDENT_ID", "date": "2024-12-03", "status": "present"}]}'
```

### Add Activity
```bash
curl -X POST http://localhost:5000/api/activity/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"studentId": "STUDENT_ID", "title": "Chess Tournament", "description": "Won 1st place", "category": "Sports", "date": "2024-12-03"}'
```
