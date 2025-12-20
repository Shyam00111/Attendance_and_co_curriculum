// controllers/subjectController.js
const Subject = require('../models/Subject');
const CurriculumTopic = require('../models/CurriculumTopic');

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private (Teacher)
const createSubject = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const teacherId = req.user?.id || req.body.teacherId;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject name and code'
      });
    }

    const subject = await Subject.create({
      name,
      code,
      description,
      teacher: teacherId,
      totalTopics: 0,
      completedTopics: 0
    });

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all subjects for a teacher
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res) => {
  try {
    const teacherId = req.user?.id || req.body.teacherId;

    const subjects = await Subject.find({ teacher: teacherId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single subject with topics
// @route   GET /api/subjects/:id
// @access  Private
const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const topics = await CurriculumTopic.find({ subject: req.params.id });

    res.status(200).json({
      success: true,
      data: {
        ...subject.toObject(),
        topics
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add topic to subject
// @route   POST /api/subjects/:id/topics
// @access  Private
const addTopic = async (req, res) => {
  try {
    const { topicName, description } = req.body;
    const subjectId = req.params.id;

    if (!topicName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide topic name'
      });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const topic = await CurriculumTopic.create({
      subject: subjectId,
      topicName,
      description,
      isCompleted: false
    });

    // Update total topics count
    subject.totalTopics += 1;
    await subject.save();

    res.status(201).json({
      success: true,
      message: 'Topic added successfully',
      data: topic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark topic as completed
// @route   PUT /api/topics/:id/complete
// @access  Private
const completeTopic = async (req, res) => {
  try {
    const topic = await CurriculumTopic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    if (!topic.isCompleted) {
      topic.isCompleted = true;
      topic.completedDate = new Date();
      await topic.save();

      // Update subject
      const subject = await Subject.findById(topic.subject);
      subject.completedTopics += 1;
      await subject.save();
    }

    res.status(200).json({
      success: true,
      message: 'Topic marked as completed',
      data: topic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete topic
// @route   DELETE /api/topics/:id
// @access  Private
const deleteTopic = async (req, res) => {
  try {
    const topic = await CurriculumTopic.findByIdAndDelete(req.params.id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Update subject counts
    const subject = await Subject.findById(topic.subject);
    if (subject) {
      subject.totalTopics -= 1;
      if (topic.isCompleted) {
        subject.completedTopics -= 1;
      }
      await subject.save();
    }

    res.status(200).json({
      success: true,
      message: 'Topic deleted successfully',
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
  createSubject,
  getSubjects,
  getSubject,
  addTopic,
  completeTopic,
  deleteTopic
};
