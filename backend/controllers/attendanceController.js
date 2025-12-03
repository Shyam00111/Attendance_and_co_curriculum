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