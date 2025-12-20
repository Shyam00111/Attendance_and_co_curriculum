// models/Certificate.js
const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  activity: {
    type: String,
    required: [true, 'Please add activity title'],
    trim: true,
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  certificateUrl: {
    type: String,
    trim: true,
  },
  certificateFile: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Certificate', certificateSchema);
