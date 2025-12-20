const exportService = require('../services/exportService');

// Export attendance as Excel
exports.exportAttendanceExcel = async (req, res) => {
  try {
    const { startDate, endDate, studentId, classId } = req.query;
    
    const workbook = await exportService.generateAttendanceExcel({
      startDate,
      endDate,
      studentId,
      classId,
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance_report.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Error exporting attendance', error: error.message });
  }
};

// Export activity as Excel
exports.exportActivityExcel = async (req, res) => {
  try {
    const { startDate, endDate, studentId } = req.query;
    
    const workbook = await exportService.generateActivityExcel({
      startDate,
      endDate,
      studentId,
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="activity_report.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Error exporting activity', error: error.message });
  }
};

// Export attendance as PDF
exports.exportAttendancePDF = async (req, res) => {
  try {
    const { startDate, endDate, studentId } = req.query;
    
    const doc = await exportService.generateAttendancePDF({
      startDate,
      endDate,
      studentId,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance_report.pdf"');

    doc.pipe(res);
    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Error exporting PDF', error: error.message });
  }
};
