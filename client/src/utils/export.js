import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function exportToPDF(title, columns, rows) {
  const doc = new jsPDF();
  doc.setFillColor(10, 14, 26);
  doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(136, 153, 187);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

  autoTable(doc, {
    startY: 48,
    head: [columns],
    body: rows,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 244, 255] },
  });
  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
}

export function exportToExcel(title, columns, rows) {
  const wsData = [columns, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
}

export function exportToCSV(title, columns, rows) {
  const csvContent = [columns, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${title.replace(/\s+/g, '_')}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

export function getAttendanceClass(pct) {
  if (pct >= 75) return 'att-high';
  if (pct >= 60) return 'att-med';
  return 'att-low';
}

export function getGradeClass(grade) {
  if (['O'].includes(grade)) return 'grade-O';
  if (['A+', 'A'].includes(grade)) return 'grade-A';
  if (['B+', 'B'].includes(grade)) return 'grade-B';
  if (['C'].includes(grade)) return 'grade-C';
  return 'grade-F';
}

export function formatReportTitle(type) {
  const map = {
    sectionAttendance: 'Section Attendance Report',
    subjectAttendance: 'Subject Attendance Report',
    lowAttendance: 'Low Attendance Report',
    departmentAttendance: 'Department Attendance Analysis',
    internalMarks: 'Internal Marks Report',
    externalMarks: 'External Marks Report',
    semesterResults: 'Semester Result Summary',
    subjectPerformance: 'Subject Performance Analysis',
    backlogReport: 'Backlog Report',
    pendingCompletions: 'Pending Completions Report',
    cgpaDistribution: 'CGPA Distribution Report',
    topPerformers: 'Top Performers Report',
    studentRanking: 'Student Ranking Report',
    academicRisk: 'Academic Risk Report'
  };
  return map[type] || type;
}
