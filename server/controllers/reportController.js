const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');

// ─── Attendance Reports ────────────────────────────────────────────────────────

async function sectionAttendance({ department, section, semester, batch, academicYear }) {
  const query = { department };
  if (section) query.section = section;
  if (semester) query.semester = Number(semester);
  if (batch) query.batch = batch;
  if (academicYear) query.academicYear = academicYear;

  const records = await Attendance.find(query).populate('student', 'name rollNo');
  const grouped = {};
  for (const r of records) {
    const key = r.rollNo;
    if (!grouped[key]) grouped[key] = { rollNo: r.rollNo, name: r.student?.name || '', subjects: [], overall: 0, totalPct: 0, count: 0 };
    grouped[key].subjects.push({ subject: r.subject, percentage: r.percentage, attended: r.attendedClasses, total: r.totalClasses });
    grouped[key].totalPct += r.percentage;
    grouped[key].count++;
  }
  const result = Object.values(grouped).map(s => ({ ...s, overall: s.count ? Math.round(s.totalPct / s.count) : 0 }));
  result.sort((a, b) => b.overall - a.overall);
  return { type: 'sectionAttendance', data: result, filters: query };
}

async function subjectAttendance({ department, subject, semester, batch, academicYear }) {
  const query = { department };
  if (subject) query.subject = new RegExp(subject, 'i');
  if (semester) query.semester = Number(semester);
  if (batch) query.batch = batch;
  if (academicYear) query.academicYear = academicYear;

  const records = await Attendance.find(query).populate('student', 'name rollNo');
  const result = records.map(r => ({
    rollNo: r.rollNo,
    name: r.student?.name || '',
    subject: r.subject,
    attended: r.attendedClasses,
    total: r.totalClasses,
    percentage: r.percentage
  }));
  result.sort((a, b) => a.rollNo.localeCompare(b.rollNo));
  return { type: 'subjectAttendance', data: result, filters: query };
}

async function lowAttendance({ department, threshold = 75, semester, batch, academicYear }) {
  const query = { department, percentage: { $lt: Number(threshold) } };
  if (semester) query.semester = Number(semester);
  if (batch) query.batch = batch;
  if (academicYear) query.academicYear = academicYear;

  const records = await Attendance.find(query).populate('student', 'name rollNo section');
  const result = records.map(r => ({
    rollNo: r.rollNo,
    name: r.student?.name || '',
    section: r.section,
    subject: r.subject,
    attended: r.attendedClasses,
    total: r.totalClasses,
    percentage: r.percentage
  }));
  result.sort((a, b) => a.percentage - b.percentage);
  return { type: 'lowAttendance', data: result, threshold, filters: query };
}

// Exact / range attendance — for queries like "students with exactly 55% attendance"
// Uses a ±3% tolerance for "exact" queries, or accepts explicit minPct/maxPct range
async function exactAttendance({ department, percentage, minPct, maxPct, semester, batch, academicYear }) {
  const pct = Number(percentage);
  const min = minPct != null ? Number(minPct) : pct - 3;
  const max = maxPct != null ? Number(maxPct) : pct + 3;

  const query = { department, percentage: { $gte: min, $lte: max } };
  if (semester) query.semester = Number(semester);
  if (batch) query.batch = batch;
  if (academicYear) query.academicYear = academicYear;

  const records = await Attendance.find(query).populate('student', 'name rollNo section');
  const result = records.map(r => ({
    rollNo: r.rollNo,
    name: r.student?.name || '',
    section: r.section,
    subject: r.subject,
    attended: r.attendedClasses,
    total: r.totalClasses,
    percentage: r.percentage
  }));
  result.sort((a, b) => a.percentage - b.percentage);
  return { type: 'exactAttendance', data: result, targetPct: pct, range: { min, max }, filters: query };
}

async function departmentAttendance({ department, semester, academicYear }) {
  const query = { department };
  if (semester) query.semester = Number(semester);
  if (academicYear) query.academicYear = academicYear;

  const records = await Attendance.find(query);
  const subjectMap = {};
  for (const r of records) {
    if (!subjectMap[r.subject]) subjectMap[r.subject] = { subject: r.subject, totalPct: 0, count: 0 };
    subjectMap[r.subject].totalPct += r.percentage;
    subjectMap[r.subject].count++;
  }
  const data = Object.values(subjectMap).map(s => ({ subject: s.subject, averageAttendance: Math.round(s.totalPct / s.count) }));
  data.sort((a, b) => b.averageAttendance - a.averageAttendance);
  return { type: 'departmentAttendance', data, filters: query };
}

// ─── Marks Reports ─────────────────────────────────────────────────────────────

async function internalMarks({ department, section, semester, batch, subject, academicYear }) {
  const query = { department };
  if (section) query.section = section;
  if (semester) query.semester = Number(semester);
  if (batch) query.batch = batch;
  if (subject) query.subject = new RegExp(subject, 'i');
  if (academicYear) query.academicYear = academicYear;

  const records = await Marks.find(query).populate('student', 'name rollNo');
  const result = records.map(r => ({
    rollNo: r.rollNo,
    name: r.student?.name || '',
    subject: r.subject,
    internalMarks: r.internalMarks,
    grade: r.grade,
    result: r.result
  }));
  result.sort((a, b) => b.internalMarks - a.internalMarks);
  return { type: 'internalMarks', data: result, filters: query };
}

async function externalMarks({ department, section, semester, batch, subject, academicYear }) {
  const query = { department };
  if (section) query.section = section;
  if (semester) query.semester = Number(semester);
  if (batch) query.batch = batch;
  if (subject) query.subject = new RegExp(subject, 'i');
  if (academicYear) query.academicYear = academicYear;

  const records = await Marks.find(query).populate('student', 'name rollNo');
  const result = records.map(r => ({
    rollNo: r.rollNo,
    name: r.student?.name || '',
    subject: r.subject,
    externalMarks: r.externalMarks,
    totalMarks: r.totalMarks,
    grade: r.grade,
    result: r.result
  }));
  result.sort((a, b) => b.totalMarks - a.totalMarks);
  return { type: 'externalMarks', data: result, filters: query };
}

async function semesterResults({ department, semester, batch, academicYear }) {
  const query = { department };
  if (semester) query.semester = Number(semester);
  if (batch) query.batch = batch;
  if (academicYear) query.academicYear = academicYear;

  const records = await Marks.find(query).populate('student', 'name rollNo section');
  const grouped = {};
  for (const r of records) {
    const key = r.rollNo;
    if (!grouped[key]) grouped[key] = { rollNo: r.rollNo, name: r.student?.name || '', section: r.section, subjects: [], totalMarks: 0, count: 0, passCount: 0 };
    grouped[key].subjects.push({ subject: r.subject, internal: r.internalMarks, external: r.externalMarks, total: r.totalMarks, grade: r.grade, result: r.result });
    grouped[key].totalMarks += r.totalMarks;
    grouped[key].count++;
    if (r.result === 'Pass') grouped[key].passCount++;
  }
  const result = Object.values(grouped).map(s => ({
    ...s,
    average: s.count ? Math.round(s.totalMarks / s.count) : 0,
    allClear: s.count > 0 && s.passCount === s.count
  }));
  result.sort((a, b) => b.average - a.average);
  return { type: 'semesterResults', data: result, filters: query };
}

async function subjectPerformance({ department, subject, semester, academicYear }) {
  const query = { department };
  if (subject) query.subject = new RegExp(subject, 'i');
  if (semester) query.semester = Number(semester);
  if (academicYear) query.academicYear = academicYear;

  const records = await Marks.find(query);
  const subjectMap = {};
  for (const r of records) {
    const s = r.subject;
    if (!subjectMap[s]) subjectMap[s] = { subject: s, totalMarks: 0, count: 0, pass: 0, fail: 0, gradesDist: {} };
    subjectMap[s].totalMarks += r.totalMarks;
    subjectMap[s].count++;
    if (r.result === 'Pass') subjectMap[s].pass++; else subjectMap[s].fail++;
    subjectMap[s].gradesDist[r.grade] = (subjectMap[s].gradesDist[r.grade] || 0) + 1;
  }
  const data = Object.values(subjectMap).map(s => ({
    subject: s.subject,
    averageMarks: s.count ? Math.round(s.totalMarks / s.count) : 0,
    passRate: s.count ? Math.round((s.pass / s.count) * 100) : 0,
    passCount: s.pass,
    failCount: s.fail,
    gradesDist: s.gradesDist
  }));
  return { type: 'subjectPerformance', data, filters: query };
}

// ─── Backlog Reports ───────────────────────────────────────────────────────────

async function backlogReport({ department, semester, batch, subject }) {
  const query = { department };
  if (batch) query.batch = batch;
  if (semester) query.semester = Number(semester);

  // Always fetch students that have at least one backlog
  let students = await Student.find({ ...query, 'backlogs.0': { $exists: true } });

  // If a subject was specified, filter to only students whose backlogs include it
  const subjectRegex = subject ? new RegExp(subject, 'i') : null;
  if (subjectRegex) {
    students = students.filter(s => s.backlogs.some(b => subjectRegex.test(b.subject)));
  }

  const result = students.map(s => {
    // Show only the matching backlogs when subject is filtered, otherwise show all
    const relevantBacklogs = subjectRegex
      ? s.backlogs.filter(b => subjectRegex.test(b.subject))
      : s.backlogs;
    return {
      rollNo: s.rollNo,
      name: s.name,
      section: s.section,
      semester: s.semester,
      batch: s.batch,
      backlogCount: relevantBacklogs.length,
      backlogs: relevantBacklogs
    };
  });

  result.sort((a, b) => b.backlogCount - a.backlogCount);
  return { type: 'backlogReport', data: result, filters: { ...query, subject: subject || null } };
}

async function pendingCompletions({ department }) {
  const students = await Student.find({ department, 'backlogs.0': { $exists: true }, status: 'active' });
  const subjectCount = {};
  for (const s of students) {
    for (const b of s.backlogs) {
      subjectCount[b.subject] = (subjectCount[b.subject] || 0) + 1;
    }
  }
  const data = Object.entries(subjectCount).map(([subject, count]) => ({ subject, count })).sort((a, b) => b.count - a.count);
  return { type: 'pendingCompletions', data, department };
}

// ─── CGPA Reports ─────────────────────────────────────────────────────────────

async function cgpaDistribution({ department, batch, semester }) {
  const query = { department };
  if (batch) query.batch = batch;
  if (semester) query.semester = Number(semester);

  const students = await Student.find(query);
  const ranges = { 'Below 5': 0, '5-6': 0, '6-7': 0, '7-8': 0, '8-9': 0, '9-10': 0 };
  const detail = students.map(s => ({ rollNo: s.rollNo, name: s.name, section: s.section, batch: s.batch, cgpa: s.cgpa }));
  for (const s of students) {
    if (s.cgpa < 5) ranges['Below 5']++;
    else if (s.cgpa < 6) ranges['5-6']++;
    else if (s.cgpa < 7) ranges['6-7']++;
    else if (s.cgpa < 8) ranges['7-8']++;
    else if (s.cgpa < 9) ranges['8-9']++;
    else ranges['9-10']++;
  }
  detail.sort((a, b) => b.cgpa - a.cgpa);
  return { type: 'cgpaDistribution', distribution: ranges, data: detail, filters: query };
}

async function topPerformers({ department, batch, limit = 10 }) {
  const query = { department };
  if (batch) query.batch = batch;
  const students = await Student.find(query).sort({ cgpa: -1 }).limit(Number(limit));
  const data = students.map((s, i) => ({ rank: i + 1, rollNo: s.rollNo, name: s.name, batch: s.batch, section: s.section, cgpa: s.cgpa }));
  return { type: 'topPerformers', data, filters: { ...query, limit } };
}

async function studentRanking({ department, batch, semester }) {
  const query = { department };
  if (batch) query.batch = batch;
  if (semester) query.semester = Number(semester);
  const students = await Student.find(query).sort({ cgpa: -1 });
  const data = students.map((s, i) => ({ rank: i + 1, rollNo: s.rollNo, name: s.name, batch: s.batch, section: s.section, semester: s.semester, cgpa: s.cgpa }));
  return { type: 'studentRanking', data, filters: query };
}

// ─── Academic Risk ─────────────────────────────────────────────────────────────

async function academicRisk({ department, batch }) {
  const query = { department };
  if (batch) query.batch = batch;
  const students = await Student.find(query);
  const riskStudents = [];

  for (const s of students) {
    const risks = [];
    if (s.cgpa < 5) risks.push('Low CGPA');
    if (s.backlogs.length >= 3) risks.push('Multiple Backlogs');
    // Fetch attendance
    const attRecords = await Attendance.find({ rollNo: s.rollNo, department });
    if (attRecords.length > 0) {
      const avgAtt = attRecords.reduce((acc, r) => acc + r.percentage, 0) / attRecords.length;
      if (avgAtt < 75) risks.push('Low Attendance');
    }
    if (risks.length > 0) {
      riskStudents.push({ rollNo: s.rollNo, name: s.name, section: s.section, batch: s.batch, cgpa: s.cgpa, backlogCount: s.backlogs.length, risks });
    }
  }
  riskStudents.sort((a, b) => b.risks.length - a.risks.length);
  return { type: 'academicRisk', data: riskStudents, filters: { department, batch } };
}

module.exports = {
  sectionAttendance, subjectAttendance, lowAttendance, exactAttendance, departmentAttendance,
  internalMarks, externalMarks, semesterResults, subjectPerformance,
  backlogReport, pendingCompletions,
  cgpaDistribution, topPerformers, studentRanking,
  academicRisk
};
