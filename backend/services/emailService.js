const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your_email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your_app_password',
  },
});

// Email templates
const emailTemplates = {
  attendanceAlert: (userName, attendancePercentage) => ({
    subject: '📊 Attendance Alert - EduTrack',
    html: `
      <h2>Hello ${userName},</h2>
      <p>Your current attendance is <strong>${attendancePercentage}%</strong></p>
      <p>Please maintain regular attendance to stay on track with your studies.</p>
      <p>Log in to EduTrack to view your attendance details.</p>
      <p>Best regards,<br/>EduTrack Team</p>
    `,
  }),

  activityUpdate: (userName, activityName) => ({
    subject: '🏆 New Activity Added - EduTrack',
    html: `
      <h2>Hello ${userName},</h2>
      <p>A new activity "<strong>${activityName}</strong>" has been added!</p>
      <p>Check your dashboard to see more details and participate.</p>
      <p>Best regards,<br/>EduTrack Team</p>
    `,
  }),

  certificateAwarded: (userName, certificateName) => ({
    subject: '🎖️ Certificate Awarded - EduTrack',
    html: `
      <h2>Congratulations ${userName}!</h2>
      <p>You have been awarded the certificate: <strong>${certificateName}</strong></p>
      <p>Download your certificate from your EduTrack dashboard.</p>
      <p>Best regards,<br/>EduTrack Team</p>
    `,
  }),

  announcement: (userName, announcement) => ({
    subject: '📢 Announcement - EduTrack',
    html: `
      <h2>Hello ${userName},</h2>
      <p>${announcement}</p>
      <p>Log in to EduTrack for more details.</p>
      <p>Best regards,<br/>EduTrack Team</p>
    `,
  }),

  lowAttendanceWarning: (userName, attendancePercentage) => ({
    subject: '⚠️ Low Attendance Warning - EduTrack',
    html: `
      <h2>Alert: ${userName}</h2>
      <p>Your attendance has dropped to <strong>${attendancePercentage}%</strong></p>
      <p><strong>This requires immediate attention!</strong></p>
      <p>Contact your teacher or administrator for more information.</p>
      <p>Log in to EduTrack to view detailed attendance records.</p>
      <p>Best regards,<br/>EduTrack Team</p>
    `,
  }),
};

// Send email
const sendEmail = async (email, template) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('⚠️ Email service not configured. Notification created but not sent.');
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: template.subject,
      html: template.html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending email: ${error.message}`);
    return false;
  }
};

// Create and send notification
const createNotification = async (userId, type, title, message, data = null) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error(`❌ Error creating notification: ${error.message}`);
    return null;
  }
};

// Send attendance alert
const sendAttendanceAlert = async (user) => {
  try {
    const Attendance = require('../models/Attendance');
    const totalRecords = await Attendance.countDocuments({ studentId: user._id });
    const presentRecords = await Attendance.countDocuments({
      studentId: user._id,
      status: 'Present',
    });

    const attendancePercentage =
      totalRecords > 0 ? ((presentRecords / totalRecords) * 100).toFixed(2) : 0;

    const notification = await createNotification(
      user._id,
      'attendance',
      'Attendance Alert',
      `Your attendance is ${attendancePercentage}%`,
      { attendancePercentage }
    );

    const template = emailTemplates.attendanceAlert(user.name, attendancePercentage);
    const sent = await sendEmail(user.email, template);

    if (sent) {
      notification.sent = true;
      notification.sentAt = new Date();
      await notification.save();
    }

    return notification;
  } catch (error) {
    console.error(`❌ Error sending attendance alert: ${error.message}`);
  }
};

// Send activity update
const sendActivityNotification = async (users, activityName) => {
  try {
    const notifications = [];

    for (const user of users) {
      const notification = await createNotification(
        user._id,
        'activity',
        'New Activity Added',
        `A new activity "${activityName}" has been added`,
        { activityName }
      );

      const template = emailTemplates.activityUpdate(user.name, activityName);
      const sent = await sendEmail(user.email, template);

      if (sent) {
        notification.sent = true;
        notification.sentAt = new Date();
        await notification.save();
      }

      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error(`❌ Error sending activity notification: ${error.message}`);
  }
};

// Send certificate notification
const sendCertificateNotification = async (user, certificateName) => {
  try {
    const notification = await createNotification(
      user._id,
      'certificate',
      'Certificate Awarded',
      `You have been awarded: ${certificateName}`,
      { certificateName }
    );

    const template = emailTemplates.certificateAwarded(user.name, certificateName);
    const sent = await sendEmail(user.email, template);

    if (sent) {
      notification.sent = true;
      notification.sentAt = new Date();
      await notification.save();
    }

    return notification;
  } catch (error) {
    console.error(`❌ Error sending certificate notification: ${error.message}`);
  }
};

// Send low attendance warning
const sendLowAttendanceWarning = async (user, attendancePercentage) => {
  try {
    if (attendancePercentage < 75) {
      const notification = await createNotification(
        user._id,
        'update',
        'Low Attendance Warning',
        `Your attendance is critically low at ${attendancePercentage}%`,
        { attendancePercentage }
      );

      const template = emailTemplates.lowAttendanceWarning(
        user.name,
        attendancePercentage
      );
      const sent = await sendEmail(user.email, template);

      if (sent) {
        notification.sent = true;
        notification.sentAt = new Date();
        await notification.save();
      }

      return notification;
    }
  } catch (error) {
    console.error(`❌ Error sending low attendance warning: ${error.message}`);
  }
};

// Broadcast announcement
const broadcastAnnouncement = async (users, announcementText) => {
  try {
    const notifications = [];

    for (const user of users) {
      const notification = await createNotification(
        user._id,
        'announcement',
        'Announcement',
        announcementText,
        { announcementText }
      );

      const template = emailTemplates.announcement(user.name, announcementText);
      const sent = await sendEmail(user.email, template);

      if (sent) {
        notification.sent = true;
        notification.sentAt = new Date();
        await notification.save();
      }

      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error(`❌ Error broadcasting announcement: ${error.message}`);
  }
};

module.exports = {
  sendEmail,
  createNotification,
  sendAttendanceAlert,
  sendActivityNotification,
  sendCertificateNotification,
  sendLowAttendanceWarning,
  broadcastAnnouncement,
};
