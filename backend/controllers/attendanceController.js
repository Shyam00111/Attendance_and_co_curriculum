// controllers/attendanceController.js
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Mark attendance for students
// @route   POST /api/attendance/mark
// @access  Private (Teacher/Admin)
const markAttendance = async (req, res) => {
  try {
    const { records } = req.body;
    console.log('=== ATTENDANCE MARK REQUEST ===');
    console.log('Records received:', JSON.stringify(records));
    console.log('User ID:', req.user.id);
    
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
      console.log(`\nProcessing record: studentId=${studentId}, date=${date}, status=${status}`);

      // Validate student exists
      const student = await Student.findById(studentId);
      console.log('Student found:', student ? student.name : 'NOT FOUND');
      
      if (!student) {
        results.push({
          studentId,
          success: false,
          message: 'Student not found'
        });
        continue;
      }

      // Parse and normalize the date (remove time component)
      let attendanceDate = new Date(date);
      console.log('Original date:', date);
      console.log('Parsed date object:', attendanceDate);
      
      attendanceDate = new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate());
      console.log('Normalized date:', attendanceDate);

      // First try to find existing record
      console.log('Searching for existing attendance...');
      let attendance = await Attendance.findOne({
        studentId: studentId,
        date: attendanceDate
      });
      
      console.log('Existing attendance found:', attendance ? 'YES' : 'NO');

      if (attendance) {
        // Update existing record
        console.log('Updating existing record...');
        attendance.status = status;
        attendance.markedBy = req.user.id;
        await attendance.save();
        console.log('Updated attendance:', attendance);
      } else {
        // Create new record
        console.log('Creating new attendance record...');
        attendance = new Attendance({
          studentId: studentId,
          date: attendanceDate,
          status: status,
          markedBy: req.user.id
        });
        console.log('New attendance object created:', attendance);
        await attendance.save();
        console.log('New attendance saved:', attendance);
      }

      results.push({
        studentId,
        success: true,
        data: attendance
      });
    }

    console.log('=== FINAL RESULTS ===');
    console.log(JSON.stringify(results, null, 2));
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('=== ATTENDANCE ERROR ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
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