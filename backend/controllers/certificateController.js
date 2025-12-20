// controllers/certificateController.js
const Certificate = require('../models/Certificate');

// @desc    Upload certificate for activity
// @route   POST /api/certificates
// @access  Private
const uploadCertificate = async (req, res) => {
  try {
    const { studentId, activity, issueDate, certificateUrl } = req.body;

    if (!studentId || !activity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide student ID and activity title'
      });
    }

    const certificate = await Certificate.create({
      student: studentId,
      activity,
      issueDate: issueDate || new Date(),
      certificateUrl
    });

    res.status(201).json({
      success: true,
      message: 'Certificate uploaded successfully',
      data: certificate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get certificates for a student
// @route   GET /api/certificates/student/:studentId
// @access  Private
const getStudentCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.params.studentId })
      .sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Private
const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate('student')
      .sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete certificate
// @route   DELETE /api/certificates/:id
// @access  Private
const deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findByIdAndDelete(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Certificate deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  uploadCertificate,
  getStudentCertificates,
  getAllCertificates,
  deleteCertificate
};
