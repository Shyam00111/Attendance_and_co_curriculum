const Student = require('../models/Student');
const Subject = require('../models/Subject');

// @desc    Add subject to student
// @route   POST /api/enrollment/add-subject
// @access  Private
const addSubjectToStudent = async (req, res) => {
  try {
    const { studentId, subjectId } = req.body;

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Verify subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check if student already enrolled
    if (student.enrolledSubjects.includes(subjectId)) {
      return res.status(400).json({
        success: false,
        message: 'Student already enrolled in this subject'
      });
    }

    // Add subject to student
    student.enrolledSubjects.push(subjectId);
    await student.save();

    // Populate the enrolled subjects for response
    const updatedStudent = await Student.findById(studentId).populate('enrolledSubjects');

    res.json({
      success: true,
      message: 'Subject added to student successfully',
      data: updatedStudent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove subject from student
// @route   POST /api/enrollment/remove-subject
// @access  Private
const removeSubjectFromStudent = async (req, res) => {
  try {
    const { studentId, subjectId } = req.body;

    let student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Remove subject from student
    student.enrolledSubjects = student.enrolledSubjects.filter(
      id => id.toString() !== subjectId
    );
    await student.save();

    const updatedStudent = await Student.findById(studentId).populate('enrolledSubjects');

    res.json({
      success: true,
      message: 'Subject removed from student successfully',
      data: updatedStudent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get student enrolled subjects
// @route   GET /api/enrollment/student/:studentId
// @access  Private
const getStudentSubjects = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId)
      .populate('enrolledSubjects');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      count: student.enrolledSubjects.length,
      data: student.enrolledSubjects
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Bulk add subjects to student
// @route   POST /api/enrollment/bulk-add
// @access  Private
const bulkAddSubjects = async (req, res) => {
  try {
    const { studentId, subjectIds } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Add new subjects (avoid duplicates)
    const newSubjects = subjectIds.filter(
      id => !student.enrolledSubjects.includes(id)
    );

    student.enrolledSubjects = [...student.enrolledSubjects, ...newSubjects];
    await student.save();

    const updatedStudent = await Student.findById(studentId).populate('enrolledSubjects');

    res.json({
      success: true,
      message: `${newSubjects.length} subjects added successfully`,
      data: updatedStudent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  addSubjectToStudent,
  removeSubjectFromStudent,
  getStudentSubjects,
  bulkAddSubjects
};
