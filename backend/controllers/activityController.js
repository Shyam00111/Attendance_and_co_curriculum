// controllers/activityController.js
const Activity = require('../models/Activity');
const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Add a new activity
// @route   POST /api/activity/add
// @access  Private
const addActivity = async (req, res) => {
  try {
    const { studentId, title, description, category, date } = req.body;
    
    console.log('=== ADD ACTIVITY REQUEST ===');
    console.log('Body:', { studentId, title, description, category, date });
    console.log('User ID:', req.user.id);

    // Validate student exists
    const student = await Student.findById(studentId);
    console.log('Student found:', student ? student.name : 'NOT FOUND');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Create activity
    console.log('Creating activity with data:', { studentId, title, description, category, date, addedBy: req.user.id });
    const activity = await Activity.create({
      studentId,
      title,
      description,
      category,
      date: new Date(date),
      addedBy: req.user.id
    });

    console.log('Activity created:', activity);

    // Populate student info
    await activity.populate('studentId', 'name email');
    console.log('Activity after populate:', activity);

    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('=== ACTIVITY ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
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