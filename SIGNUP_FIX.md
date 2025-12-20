# Fix: Signup Already Registered Error

## Problem
Users are getting "already registered" error when trying to signup with a new email.

## Root Cause
- Possible duplicate emails in MongoDB from previous tests
- Or improper unique index on email field

## Solution - Quick Fix

### Step 1: Run Cleanup Script
```bash
cd backend
node utils/cleanupDuplicates.js
```

This will:
- Remove any duplicate email entries from database
- Fix the unique index on email field
- Show how many duplicates were cleaned up

### Step 2: Clear Browser Data
1. Open DevTools (F12)
2. Go to Storage/Application tab
3. Delete `attendance_app_token` and `attendance_app_user` localStorage items
4. Clear all cookies for localhost

### Step 3: Test Signup Again
1. Go to login page
2. Click "Create Account"
3. Use a NEW email address (e.g., `student@test.com`)
4. Fill in all fields: Name, Email, Password, Role
5. Click Register

## What Was Fixed in Code

### Backend (authController.js)
✅ Better email validation (lowercase + trim)
✅ Clear error message when email already exists
✅ Proper MongoDB duplicate key error handling (error code 11000)
✅ Additional input validation

### Frontend (Login.tsx)
✅ Added email validation before submit
✅ Added password validation before submit
✅ Convert email to lowercase before sending
✅ Form reset after successful registration
✅ Better error messages to user

## If Still Having Issues

Try one of these:

### Option A: Fresh MongoDB
```bash
# Drop entire database and start fresh
# In MongoDB Compass or MongoDB CLI:
db.dropDatabase()
```

### Option B: Check MongoDB Directly
```javascript
// In MongoDB Compass, find duplicates:
db.users.aggregate([
  { $group: { _id: "$email", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])
```

### Option C: Use Demo Account
- Email: `admin@school.edu`
- Password: `password123`

## Testing New Signup
1. Use unique email each time (e.g., `test1@example.com`, `test2@example.com`)
2. Try different roles (student, teacher, admin)
3. Password minimum 6 characters
4. All fields required

✅ Now signup should work smoothly!
