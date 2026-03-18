const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const reportCtrl = require('../controllers/reportController');

const REPORT_MAP = {
  sectionAttendance: reportCtrl.sectionAttendance,
  subjectAttendance: reportCtrl.subjectAttendance,
  lowAttendance: reportCtrl.lowAttendance,
  exactAttendance: reportCtrl.exactAttendance,
  departmentAttendance: reportCtrl.departmentAttendance,
  internalMarks: reportCtrl.internalMarks,
  externalMarks: reportCtrl.externalMarks,
  semesterResults: reportCtrl.semesterResults,
  subjectPerformance: reportCtrl.subjectPerformance,
  backlogReport: reportCtrl.backlogReport,
  pendingCompletions: reportCtrl.pendingCompletions,
  cgpaDistribution: reportCtrl.cgpaDistribution,
  topPerformers: reportCtrl.topPerformers,
  studentRanking: reportCtrl.studentRanking,
  academicRisk: reportCtrl.academicRisk
};

// POST /api/reports/generate
router.post('/generate', auth, async (req, res) => {
  try {
    const { reportType, params } = req.body;
    if (!REPORT_MAP[reportType]) return res.status(400).json({ message: 'Unknown report type' });

    // Default department from user unless admin
    const finalParams = { ...params };
    if (req.user.role !== 'admin' && !finalParams.department) {
      finalParams.department = req.user.department;
    }

    const data = await REPORT_MAP[reportType](finalParams);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reports/types
router.get('/types', auth, (req, res) => {
  res.json({ types: Object.keys(REPORT_MAP) });
});

module.exports = router;
