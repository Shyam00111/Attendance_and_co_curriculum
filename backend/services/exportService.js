const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Attendance = require('../models/Attendance');
const Activity = require('../models/Activity');
const User = require('../models/User');

// Generate Attendance Report as Excel
exports.generateAttendanceExcel = async (filters = {}) => {
  try {
    const { startDate, endDate, studentId, classId } = filters;
    
    let query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (studentId) query.studentId = studentId;
    if (classId) query.classId = classId;

    const records = await Attendance.find(query)
      .populate('studentId', 'name email rollNo')
      .sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');

    // Headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Student Name', key: 'studentName', width: 20 },
      { header: 'Roll No', key: 'rollNo', width: 10 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Subject', key: 'subject', width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF366092' } };

    // Data rows
    records.forEach((record) => {
      worksheet.addRow({
        date: new Date(record.date).toLocaleDateString(),
        studentName: record.studentId?.name || 'N/A',
        rollNo: record.studentId?.rollNo || 'N/A',
        status: record.status || 'Absent',
        subject: record.subject || 'N/A',
      });
    });

    // Add summary
    const presentCount = records.filter(r => r.status === 'Present').length;
    const absentCount = records.filter(r => r.status === 'Absent').length;
    
    worksheet.addRow({});
    worksheet.addRow({ studentName: 'Total Present', rollNo: presentCount });
    worksheet.addRow({ studentName: 'Total Absent', rollNo: absentCount });

    return workbook;
  } catch (error) {
    throw new Error(`Failed to generate attendance excel: ${error.message}`);
  }
};

// Generate Activity Report as Excel
exports.generateActivityExcel = async (filters = {}) => {
  try {
    const { startDate, endDate, studentId } = filters;
    
    let query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (studentId) query.participantId = studentId;

    const records = await Activity.find(query)
      .populate('participantId', 'name email rollNo')
      .sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Activity Report');

    worksheet.columns = [
      { header: 'Activity Name', key: 'name', width: 20 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Student Name', key: 'studentName', width: 20 },
      { header: 'Roll No', key: 'rollNo', width: 10 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Points', key: 'points', width: 10 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF366092' } };

    records.forEach((record) => {
      worksheet.addRow({
        name: record.name || 'N/A',
        date: new Date(record.date).toLocaleDateString(),
        studentName: record.participantId?.name || 'N/A',
        rollNo: record.participantId?.rollNo || 'N/A',
        type: record.type || 'General',
        points: record.points || 0,
      });
    });

    // Add summary
    const totalPoints = records.reduce((sum, r) => sum + (r.points || 0), 0);
    worksheet.addRow({});
    worksheet.addRow({ name: 'Total Points Earned', points: totalPoints });

    return workbook;
  } catch (error) {
    throw new Error(`Failed to generate activity excel: ${error.message}`);
  }
};

// Generate PDF Report
exports.generateAttendancePDF = async (filters = {}) => {
  try {
    const { startDate, endDate, studentId } = filters;
    
    let query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (studentId) query.studentId = studentId;

    const records = await Attendance.find(query)
      .populate('studentId', 'name email rollNo')
      .sort({ date: -1 });

    const doc = new PDFDocument();
    
    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('Attendance Report', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();

    // Table header
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 150;
    const col3 = 250;
    const col4 = 350;
    const col5 = 450;
    const rowHeight = 20;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Date', col1, tableTop);
    doc.text('Student', col2, tableTop);
    doc.text('Roll No', col3, tableTop);
    doc.text('Status', col4, tableTop);
    doc.text('Subject', col5, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Table rows
    let yPosition = tableTop + 25;
    doc.fontSize(9).font('Helvetica');
    
    records.slice(0, 50).forEach((record) => {
      doc.text(new Date(record.date).toLocaleDateString(), col1, yPosition);
      doc.text(record.studentId?.name || 'N/A', col2, yPosition);
      doc.text(record.studentId?.rollNo || 'N/A', col3, yPosition);
      doc.text(record.status || 'Absent', col4, yPosition);
      doc.text(record.subject || 'N/A', col5, yPosition);
      yPosition += rowHeight;
    });

    // Summary
    yPosition += 10;
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 10;

    const presentCount = records.filter(r => r.status === 'Present').length;
    const absentCount = records.filter(r => r.status === 'Absent').length;
    const totalPercentage = ((presentCount / records.length) * 100).toFixed(2);

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text(`Total Present: ${presentCount}`, col1, yPosition);
    yPosition += rowHeight;
    doc.text(`Total Absent: ${absentCount}`, col1, yPosition);
    yPosition += rowHeight;
    doc.text(`Attendance %: ${totalPercentage}%`, col1, yPosition);

    return doc;
  } catch (error) {
    throw new Error(`Failed to generate attendance PDF: ${error.message}`);
  }
};
