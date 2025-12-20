// models/CurriculumTopic.js
const mongoose = require('mongoose');

const curriculumTopicSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  topicName: {
    type: String,
    required: [true, 'Please add a topic name'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedDate: {
    type: Date,
    default: null,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CurriculumTopic', curriculumTopicSchema);
