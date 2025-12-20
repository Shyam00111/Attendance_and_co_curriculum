// routes/certificate.js
const express = require('express');
const {
  uploadCertificate,
  getStudentCertificates,
  getAllCertificates,
  deleteCertificate
} = require('../controllers/certificateController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth.protect, uploadCertificate);
router.get('/', auth.protect, getAllCertificates);
router.get('/student/:studentId', auth.protect, getStudentCertificates);
router.delete('/:id', auth.protect, deleteCertificate);

module.exports = router;
