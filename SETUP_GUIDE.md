# 🚀 EduTrack Setup & Testing Guide

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment (.env)
```env
PORT=5000
JWT_SECRET=yourSecretKey123
MONGO_URI=mongodb://localhost:27017/attendance_db
```

### 3. Start MongoDB
```bash
# Windows (if installed)
mongod

# Or use MongoDB Atlas (cloud) - update MONGO_URI in .env
```

### 4. Start Backend Server
```bash
npm start
```
✅ Should show: `🚀 Server running on port 5000`

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment (.env)
Create `.env.local` in frontend directory:
```env
VITE_Backend_Url=http://localhost:5000/
```

### 3. Start Frontend Dev Server
```bash
npm run dev
```
✅ Should show: `Local: http://localhost:5173/`

---

## 🧪 Testing the Features

### Test User Credentials

#### Teacher Account
```
Email: teacher@school.edu
Password: password123
Role: Teacher
```

#### Student Account
```
Email: student@school.edu
Password: password123
Role: Student
```

#### Admin Account
```
Email: admin@school.edu
Password: password123
Role: Admin
```

---

## ✅ Feature Testing Checklist

### Authentication
- [ ] Create new account with "Teacher" role
- [ ] Login with created account
- [ ] Verify token saved in localStorage
- [ ] Logout functionality works
- [ ] Create account with "Student" role
- [ ] Verify different menu for students

### Student Management (Teacher Only)
- [ ] Navigate to "Manage Students"
- [ ] Click "Add Student" button
- [ ] Fill form and submit
- [ ] Student appears in table
- [ ] Delete student functionality
- [ ] View all students list

### Curriculum Management
- [ ] Navigate to "Curriculum"
- [ ] Click "Add Subject"
- [ ] Create subject with code
- [ ] Subject appears in list
- [ ] Progress bar shows 0% initially
- [ ] Can add multiple subjects

### Attendance
- [ ] Go to "Mark Attendance"
- [ ] Select date
- [ ] Mark attendance (Present/Absent/Late)
- [ ] Click "Save Attendance"
- [ ] View "Attendance Report"
- [ ] Filter by date/status
- [ ] Export to CSV

### Activities
- [ ] Go to "Add Activity"
- [ ] Select student and add activity
- [ ] Activity appears in "Activity List"
- [ ] Can delete activities

### Certificates
- [ ] Go to "Certificates"
- [ ] Click "Upload Certificate"
- [ ] Fill certificate details
- [ ] Certificate appears in table
- [ ] Can download/view certificate
- [ ] Delete certificate

### Dashboard
- [ ] View all stats cards
- [ ] Check attendance percentage
- [ ] View recent activities
- [ ] View total students

### Navigation
- [ ] Teacher sees: Dashboard, Students, Curriculum, Mark Attendance, etc.
- [ ] Student sees: Dashboard, My Attendance, My Activities
- [ ] Admin sees: Full teacher menu
- [ ] Sidebar responsive on mobile

---

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error**
```
❌ MongoDB connection error: Invalid scheme...
✅ Solution: Ensure MongoDB is running or update MONGO_URI in .env
```

**Port Already in Use**
```
✅ Solution: Kill process on port 5000 or change PORT in .env
```

**JWT Error**
```
✅ Solution: Ensure JWT_SECRET is set in .env
```

### Frontend Issues

**Backend URL Error**
```
✅ Solution: Check VITE_Backend_Url in .env.local matches backend port
```

**CORS Errors**
```
✅ Solution: Ensure backend CORS allows http://localhost:5173
```

**Token Not Found**
```
✅ Solution: Clear browser storage (DevTools > Application > Clear storage)
```

---

## 📊 Database Collections

After first login, MongoDB will create:

```
{
  "users": [...],           // User accounts
  "students": [...],        // Student records
  "attendances": [...],     // Attendance records
  "subjects": [...],        // Subjects/Courses
  "curriculumtopics": [...], // Syllabus topics
  "certificates": [...],    // Certificates
  "activities": [...]       // Activities
}
```

---

## 🎯 Quick Test Flow

1. **Start Apps**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm start
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

2. **Open Browser**
   - Go to http://localhost:5173

3. **Create Teacher Account**
   - Click "Sign up"
   - Select "Teacher" role
   - Fill details and submit
   - Auto-redirects to Dashboard

4. **Add Student**
   - Go to "Manage Students"
   - Click "Add Student"
   - Add 3-4 students
   - Click "Save"

5. **Mark Attendance**
   - Go to "Mark Attendance"
   - Select today's date
   - Mark Present/Absent/Late for each
   - Click "Save Attendance"

6. **Create Subject**
   - Go to "Curriculum"
   - Click "Add Subject"
   - Create "Mathematics" subject
   - Note: Progress shows 0%

7. **Add Activity**
   - Go to "Add Activity"
   - Select a student
   - Add "Chess Competition - 1st Prize"
   - Submit

8. **Upload Certificate**
   - Go to "Certificates"
   - Click "Upload Certificate"
   - Add certificate for student activity
   - Submit

9. **View Reports**
   - Go to "Attendance Report"
   - Filter and view
   - Export to CSV

10. **Test Student View**
    - Create a Student account
    - Login
    - Verify only sees: Dashboard, My Attendance, My Activities

---

## 📞 Support & Debug

Enable debug mode in browser console:
```javascript
// Show all API requests
localStorage.setItem('debug', 'true')
```

---

## 🎓 Architecture Overview

```
┌─────────────────────────────────────────┐
│           Frontend (React + TS)         │
│  - Dashboard.tsx                        │
│  - ManageStudents.tsx                   │
│  - ManageCurriculum.tsx                 │
│  - AttendanceMark.tsx                   │
│  - ManageCertificates.tsx               │
└────────────┬────────────────────────────┘
             │ REST API (HTTP)
             ↓
┌─────────────────────────────────────────┐
│         Backend (Node + Express)        │
│  - /auth (Authentication)               │
│  - /students (Student management)       │
│  - /subjects (Curriculum)               │
│  - /attendance (Attendance)             │
│  - /certificates (Certificates)        │
│  - /activity (Activities)               │
└────────────┬────────────────────────────┘
             │ Mongoose ODM
             ↓
┌─────────────────────────────────────────┐
│      MongoDB Database (Collections)     │
│  - users, students, attendance          │
│  - subjects, curriculumtopics          │
│  - certificates, activities             │
└─────────────────────────────────────────┘
```

---

**Happy Testing! 🎉**
