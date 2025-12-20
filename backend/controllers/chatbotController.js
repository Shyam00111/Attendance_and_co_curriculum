// controllers/chatbotController.js
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// Knowledge base for chatbot responses
const knowledgeBase = {
  greetings: {
    keywords: ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon'],
    response: 'Hello! 👋 Welcome to EduTrack. How can I help you today? You can ask me about attendance, curriculum, students, activities, certificates, or general information.'
  },
  
  attendance: {
    keywords: ['attendance', 'mark attendance', 'present', 'absent', 'late', 'attendance rate'],
    response: 'You can mark attendance by going to "Mark Attendance" in the sidebar. Select the date and mark each student as Present, Absent, or Late. Then click "Save Attendance". You can also view reports in "Attendance Report" with filters and CSV export.'
  },
  
  curriculum: {
    keywords: ['curriculum', 'subject', 'syllabus', 'topic', 'course'],
    response: 'Curriculum management allows you to create subjects and track topics. Go to "Curriculum" in the sidebar. Click "Add Subject" to create a new course. Add topics to the subject and mark them as completed to track progress with visual indicators.'
  },
  
  students: {
    keywords: ['student', 'add student', 'manage students', 'enrollment'],
    response: 'To manage students, go to "Manage Students" in the sidebar. Click "Add Student" to add new students with their name, email, roll number, and class. You can view all students in a table and delete them if needed.'
  },
  
  activities: {
    keywords: ['activity', 'activity management', 'event', 'achievement', 'sport', 'club'],
    response: 'Co-curriculum activities can be managed through "Add Activity" and "Activity List" in the sidebar. You can record student participation in events, sports, clubs, and workshops. Each activity can be categorized and tracked for internal evaluation.'
  },
  
  certificates: {
    keywords: ['certificate', 'certificate management', 'award', 'proof', 'achievement'],
    response: 'Upload certificates through "Certificates" in the sidebar. Click "Upload Certificate" to record student achievements with activity title, issue date, and link to digital proof. View all certificates in a table with download options.'
  },
  
  dashboard: {
    keywords: ['dashboard', 'stats', 'statistics', 'overview', 'analytics', 'report'],
    response: 'The Dashboard shows real-time statistics including total students, present/absent today, attendance rate percentage, and total activities. It provides a quick overview of your class performance and upcoming data trends.'
  },
  
  roles: {
    keywords: ['role', 'teacher', 'student', 'admin', 'access', 'permission'],
    response: 'EduTrack supports three roles: Students can view their attendance and activities. Teachers can manage students, mark attendance, create curriculum, and upload certificates. Admins have full system access. Your role determines which features you can access.'
  },
  
  login: {
    keywords: ['login', 'signup', 'sign up', 'register', 'account', 'password'],
    response: 'To login, enter your email and password. When signing up, select your role (Student/Teacher/Admin). Teachers get full management access, students have limited viewing access. Use "Forgot Password" if needed (currently manual reset required).'
  },
  
  reports: {
    keywords: ['report', 'export', 'csv', 'download', 'attendance report'],
    response: 'You can generate reports through "Attendance Report" in the sidebar. Filter by date, status, or student. The report shows detailed attendance records. Click "Export CSV" to download the data for use in Excel or other programs.'
  },
  
  help: {
    keywords: ['help', 'how to', 'tutorial', 'guide', 'support', 'feature'],
    response: 'I can help with any EduTrack feature! Ask me about: Attendance, Curriculum, Students, Activities, Certificates, Dashboard, Roles, Login, or Reports. For detailed guides, check the documentation files in the project root.'
  },
  
  features: {
    keywords: ['features', 'what can', 'capability', 'available'],
    response: 'EduTrack includes: Student Attendance Management, Curriculum Tracking, Co-Curriculum Activities, Certificate Management, Student Management, Role-Based Access, Dashboard Analytics, and Secure Authentication. All major educational management features are included!'
  }
};

// @desc    Send chat message and get chatbot response
// @route   POST /api/chatbot/message
// @access  Public
const sendMessage = async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      });
    }

    // Process user message
    const userMessage = message.toLowerCase().trim();
    let botResponse = '';
    let confidence = 0;

    // Check against knowledge base
    for (const [key, data] of Object.entries(knowledgeBase)) {
      for (const keyword of data.keywords) {
        if (userMessage.includes(keyword)) {
          botResponse = data.response;
          confidence = 0.95;
          break;
        }
      }
      if (botResponse) break;
    }

    // Get user stats if requested
    if ((userMessage.includes('my attendance') || userMessage.includes('attendance percentage')) && userId) {
      try {
        const user = await User.findById(userId);
        if (user && user.role === 'student') {
          const attendance = await Attendance.find({ student: userId });
          const present = attendance.filter(a => a.status === 'present').length;
          const total = attendance.length;
          const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
          botResponse = `Your attendance information:\n📊 Total Records: ${total}\n✅ Present: ${present}\n📈 Attendance Rate: ${percentage}%\n\nKeep up your attendance!`;
          confidence = 0.98;
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    }

    // Get student count if teacher
    if ((userMessage.includes('how many students') || userMessage.includes('total students')) && userId) {
      try {
        const user = await User.findById(userId);
        if (user && (user.role === 'teacher' || user.role === 'admin')) {
          const studentCount = await Student.countDocuments({ teacher: userId });
          botResponse = `You have **${studentCount}** students enrolled in your classes. 👥`;
          confidence = 0.98;
        }
      } catch (error) {
        console.error('Error fetching student count:', error);
      }
    }

    // Default response if no match
    if (!botResponse) {
      botResponse = "I'm not sure about that. You can ask me about: Attendance, Curriculum, Students, Activities, Certificates, Dashboard, Roles, Login, or Reports. Type 'help' for more information.";
      confidence = 0.3;
    }

    res.status(200).json({
      success: true,
      data: {
        userMessage: message,
        botResponse: botResponse,
        confidence: confidence,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get chatbot suggestions based on user role
// @route   GET /api/chatbot/suggestions/:role
// @access  Public
const getSuggestions = async (req, res) => {
  try {
    const { role } = req.params;

    const suggestions = {
      teacher: [
        '📚 How do I create a subject?',
        '👥 How do I add students?',
        '✅ How do I mark attendance?',
        '📜 How do I upload certificates?',
        '📊 How do I view reports?'
      ],
      student: [
        '📊 What is my attendance percentage?',
        '📋 How do I view my attendance?',
        '🏆 How do I view my activities?',
        '📚 What is curriculum?',
        '❓ What features can I access?'
      ],
      admin: [
        '📚 Curriculum management?',
        '👥 Student management?',
        '✅ Attendance tracking?',
        '📊 System analytics?',
        '🔐 Role-based access?'
      ],
      default: [
        '👋 Hello! How can I help?',
        '📚 Tell me about EduTrack features',
        '🔐 How do I login?',
        '❓ What can you help me with?',
        '📖 Show me the help guide'
      ]
    };

    const roleSuggestions = suggestions[role] || suggestions.default;

    res.status(200).json({
      success: true,
      data: {
        suggestions: roleSuggestions,
        role: role || 'guest'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  sendMessage,
  getSuggestions
};
