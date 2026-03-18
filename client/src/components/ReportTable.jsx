import React from 'react';
import { exportToPDF, exportToExcel, exportToCSV, getAttendanceClass, getGradeClass, formatReportTitle } from '../utils/export';

// ─── Attendance Report ────────────────────────────────────────────────────────

function SectionAttendanceTable({ data }) {
  const title = 'Section Attendance Report';
  const cols = ['Roll No', 'Student Name', 'Avg Attendance %'];
  const rows = data.map(r => [r.rollNo, r.name, `${r.overall}%`]);
  return (
    <div className="report-container fade-in" id="report-section-attendance">
      <div className="report-header">
        <div className="report-title">📋 {title}</div>
        <div className="export-btns">
          <button className="btn btn-sm btn-secondary" onClick={() => exportToPDF(title, cols, rows)}>📄 PDF</button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToExcel(title, cols, rows)}>📊 Excel</button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToCSV(title, cols, rows)}>📁 CSV</button>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead><tr><th>#</th><th>Roll No</th><th>Student Name</th><th>Subjects</th><th>Avg Attendance</th></tr></thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={r.rollNo}>
                <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                <td><code style={{ color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono' }}>{r.rollNo}</code></td>
                <td style={{ fontWeight: '500' }}>{r.name}</td>
                <td>{r.subjects?.length || 0} subjects</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="progress-bar" style={{ width: '80px' }}>
                      <div className="progress-fill" style={{ width: `${r.overall}%`, background: r.overall >= 75 ? 'var(--accent-emerald)' : r.overall >= 60 ? 'var(--accent-amber)' : 'var(--accent-rose)' }} />
                    </div>
                    <span className={getAttendanceClass(r.overall)} style={{ fontWeight: '700' }}>{r.overall}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubjectAttendanceTable({ data }) {
  const title = 'Subject Attendance Report';
  const cols = ['Roll No', 'Name', 'Subject', 'Attended', 'Total', 'Percentage'];
  const rows = data.map(r => [r.rollNo, r.name, r.subject, r.attended, r.total, `${r.percentage}%`]);
  return (
    <div className="report-container fade-in">
      <div className="report-header">
        <div className="report-title">📚 {title}</div>
        <div className="export-btns">
          <button className="btn btn-sm btn-secondary" onClick={() => exportToPDF(title, cols, rows)}>📄 PDF</button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToExcel(title, cols, rows)}>📊 Excel</button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToCSV(title, cols, rows)}>📁 CSV</button>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead><tr><th>Roll No</th><th>Name</th><th>Subject</th><th>Attended</th><th>Total</th><th>Percentage</th></tr></thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={i}>
                <td><code style={{ color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono' }}>{r.rollNo}</code></td>
                <td>{r.name}</td>
                <td>{r.subject}</td>
                <td>{r.attended}</td>
                <td>{r.total}</td>
                <td><span className={`${getAttendanceClass(r.percentage)}`} style={{ fontWeight: '700' }}>{r.percentage}%</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LowAttendanceTable({ data, threshold }) {
  const title = `Low Attendance Report (< ${threshold}%)`;
  const cols = ['Roll No', 'Name', 'Section', 'Subject', 'Attended', 'Total', 'Percentage'];
  const rows = data.map(r => [r.rollNo, r.name, r.section, r.subject, r.attended, r.total, `${r.percentage}%`]);
  return (
    <div className="report-container fade-in">
      <div className="report-header">
        <div className="report-title">🚨 {title}</div>
        <div className="export-btns">
          <button className="btn btn-sm btn-secondary" onClick={() => exportToPDF(title, cols, rows)}>📄 PDF</button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToExcel(title, cols, rows)}>📊 Excel</button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToCSV(title, cols, rows)}>📁 CSV</button>
        </div>
      </div>
      <div className="alert alert-error" style={{ marginBottom: '12px' }}>
        ⚠️ {data.length} student-subject records found with attendance below {threshold}%
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead><tr><th>Roll No</th><th>Name</th><th>Section</th><th>Subject</th><th>Attended/Total</th><th>%</th></tr></thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={i}>
                <td><code style={{ color: 'var(--accent-rose)', fontFamily: 'JetBrains Mono' }}>{r.rollNo}</code></td>
                <td style={{ fontWeight: '500' }}>{r.name}</td>
                <td><span className="badge badge-muted">{r.section}</span></td>
                <td>{r.subject}</td>
                <td>{r.attended}/{r.total}</td>
                <td><span className="att-low" style={{ fontWeight: '700' }}>{r.percentage}%</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExactAttendanceTable({ data, targetPct, range }) {
  const title = `Attendance ~ ${targetPct}% Report`;
  const cols = ['Roll No', 'Name', 'Section', 'Subject', 'Attended', 'Total', '%'];
  const rows = data.map(r => [r.rollNo, r.name, r.section, r.subject, r.attended, r.total, `${r.percentage}%`]);
  return (
    <div className="report-container fade-in">
      <div className="report-header">
        <div className="report-title">🎯 {title}</div>
        <div className="export-btns">
          <button className="btn btn-sm btn-secondary" onClick={() => exportToPDF(title, cols, rows)}>📄 PDF</button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToExcel(title, cols, rows)}>📊 Excel</button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToCSV(title, cols, rows)}>📁 CSV</button>
        </div>
      </div>
      <div className="alert" style={{ marginBottom: '12px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: 'var(--accent-blue)', borderRadius: 'var(--radius)', padding: '10px 14px', fontSize: '13px' }}>
        🎯 Showing students with attendance between <strong>{range?.min}%</strong> and <strong>{range?.max}%</strong> (target: {targetPct}%)
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead><tr><th>#</th><th>Roll No</th><th>Name</th><th>Section</th><th>Subject</th><th>Attended/Total</th><th>%</th></tr></thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                <td><code style={{ color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>{r.rollNo}</code></td>
                <td style={{ fontWeight: '500' }}>{r.name}</td>
                <td><span className="badge badge-muted">{r.section}</span></td>
                <td>{r.subject}</td>
                <td>{r.attended}/{r.total}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="progress-bar" style={{ width: '60px' }}>
                      <div className="progress-fill" style={{ width: `${r.percentage}%`, background: r.percentage >= 75 ? 'var(--accent-emerald)' : r.percentage >= 60 ? 'var(--accent-amber)' : 'var(--accent-rose)' }} />
                    </div>
                    <span className={getAttendanceClass(r.percentage)} style={{ fontWeight: '700' }}>{r.percentage}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DeptAttendanceTable({ data }) {
  const title = 'Department Attendance Analysis';
  const cols = ['Subject', 'Average Attendance %'];
  const rows = data.map(r => [r.subject, `${r.averageAttendance}%`]);
  return (
    <div className="report-container fade-in">
      <div className="report-header">
        <div className="report-title">🏫 {title}</div>
        <div className="export-btns">
          <button className="btn btn-sm btn-secondary" onClick={() => exportToPDF(title, cols, rows)}>📄 PDF</button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToExcel(title, cols, rows)}>📊 Excel</button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToCSV(title, cols, rows)}>📁 CSV</button>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead><tr><th>#</th><th>Subject</th><th>Average Attendance</th></tr></thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                <td style={{ fontWeight: '500' }}>{r.subject}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="progress-bar" style={{ width: '100px' }}>
                      <div className="progress-fill" style={{ width: `${r.averageAttendance}%`, background: r.averageAttendance >= 75 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }} />
                    </div>
                    <span className={getAttendanceClass(r.averageAttendance)} style={{ fontWeight: '700' }}>{r.averageAttendance}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Marks Reports ─────────────────────────────────────────────────────────────

function MarksTable({ data, type }) {
  const isInternal = type === 'internalMarks';
  const title = isInternal ? 'Internal Marks Report' : 'External Marks Report';
  const cols = isInternal
    ? ['Roll No', 'Name', 'Subject', 'Internal Marks', 'Grade', 'Result']
    : ['Roll No', 'Name', 'Subject', 'External Marks', 'Total Marks', 'Grade', 'Result'];
  const rows = data.map(r => isInternal
    ? [r.rollNo, r.name, r.subject, r.internalMarks, r.grade, r.result]
    : [r.rollNo, r.name, r.subject, r.externalMarks, r.totalMarks, r.grade, r.result]);
  return (
    <div className="report-container fade-in">
      <div className="report-header">
        <div className="report-title">📝 {title}</div>
        <div className="export-btns">
          <button className="btn btn-sm btn-secondary" onClick={() => exportToPDF(title, cols, rows)}>📄 PDF</button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToExcel(title, cols, rows)}>📊 Excel</button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToCSV(title, cols, rows)}>📁 CSV</button>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead><tr><th>Roll No</th><th>Name</th><th>Subject</th><th>{isInternal ? 'Internal' : 'External'}</th>{!isInternal && <th>Total</th>}<th>Grade</th><th>Result</th></tr></thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={i}>
                <td><code style={{ color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>{r.rollNo}</code></td>
                <td style={{ fontWeight: '500' }}>{r.name}</td>
                <td>{r.subject}</td>
                <td style={{ fontWeight: '600' }}>{isInternal ? r.internalMarks : r.externalMarks}</td>
                {!isInternal && <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{r.totalMarks}</td>}
                <td><span className={`badge ${getGradeClass(r.grade)}`}>{r.grade}</span></td>
                <td><span className={`badge ${r.result === 'Pass' ? 'badge-emerald' : 'badge-rose'}`}>{r.result}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SemesterResultsTable({ data }) {
  const title = 'Semester Result Summary';
  const cols = ['Roll No', 'Name', 'Section', 'Subjects', 'Average', 'Status'];
  const rows = data.map(r => [r.rollNo, r.name, r.section, r.count, r.average, r.allClear ? 'All Clear' : 'Has Fail(s)']);
  return (
    <div className="report-container fade-in">
      <div className="report-header">
        <div className="report-title">📊 {title}</div>
        <div className="export-btns">
          <button className="btn btn-sm btn-secondary" onClick={() => exportToPDF(title, cols, rows)}>📄 PDF</button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToExcel(title, cols, rows)}>📊 Excel</button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToCSV(title, cols, rows)}>📁 CSV</button>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead><tr><th>#</th><th>Roll No</th><th>Name</th><th>Section</th><th>Pass/Total</th><th>Avg Marks</th><th>Status</th></tr></thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={r.rollNo}>
                <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                <td><code style={{ color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>{r.rollNo}</code></td>
                <td style={{ fontWeight: '500' }}>{r.name}</td>
                <td><span className="badge badge-muted">{r.section}</span></td>
                <td>{r.passCount}/{r.count}</td>
                <td style={{ fontWeight: '700' }}>{r.average}</td>
                <td><span className={`badge ${r.allClear ? 'badge-emerald' : 'badge-rose'}`}>{r.allClear ? '✅ All Clear' : '❌ Has Fail(s)'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubjectPerformanceTable({ data }) {
  const title = 'Subject Performance Analysis';
  const cols = ['Subject', 'Avg Marks', 'Pass Rate', 'Pass', 'Fail'];
  const rows = data.map(r => [r.subject, r.averageMarks, `${r.passRate}%`, r.passCount, r.failCount]);
  return (
    <div className="report-container fade-in">
      <div className="report-header">
        <div className="report-title">📈 {title}</div>
        <div className="export-btns">
          <button className="btn btn-sm btn-secondary" onClick={() => exportToPDF(title, cols, rows)}>📄 PDF</button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToExcel(title, cols, rows)}>📊 Excel</button>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead><tr><th>#</th><th>Subject</th><th>Avg Marks</th><th>Pass Rate</th><th>Pass</th><th>Fail</th></tr></thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                <td style={{ fontWeight: '600' }}>{r.subject}</td>
                <td>{r.averageMarks}/100</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="progress-bar" style={{ width: '80px' }}>
                      <div className="progress-fill" style={{ width: `${r.passRate}%`, background: r.passRate >= 75 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }} />
                    </div>
                    <span style={{ fontWeight: '700' }}>{r.passRate}%</span>
                  </div>
                </td>
                <td><span className="badge badge-emerald">{r.passCount}</span></td>
                <td><span className="badge badge-rose">{r.failCount}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Backlog Reports ───────────────────────────────────────────────────────────

function BacklogTable({ data }) {
  const title = 'Backlog Report';
  const cols = ['Roll No', 'Name', 'Section', 'Semester', 'Batch', 'Backlog Count'];
  const rows = data.map(r => [r.rollNo, r.name, r.section, r.semester, r.batch, r.backlogCount]);
  return (
    <div className="report-container fade-in">
      <div className="report-header">
        <div className="report-title">⚠️ {title}</div>
        <div className="export-btns">
          <button className="btn btn-sm btn-secondary" onClick={() => exportToPDF(title, cols, rows)}>📄 PDF</button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToExcel(title, cols, rows)}>📊 Excel</button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToCSV(title, cols, rows)}>📁 CSV</button>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead><tr><th>Roll No</th><th>Name</th><th>Section</th><th>Sem</th><th>Batch</th><th>Backlogs</th><th>Subjects</th></tr></thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={r.rollNo}>
                <td><code style={{ color: 'var(--accent-rose)', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>{r.rollNo}</code></td>
                <td style={{ fontWeight: '500' }}>{r.name}</td>
                <td><span className="badge badge-muted">{r.section}</span></td>
                <td>{r.semester}</td>
                <td>{r.batch}</td>
                <td><span className={`badge ${r.backlogCount >= 3 ? 'badge-rose' : 'badge-amber'}`}>{r.backlogCount}</span></td>
                <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{r.backlogs?.map(b => b.subject).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PendingCompletionsTable({ data }) {
  const title = 'Pending Completions';
  const cols = ['Subject', 'Pending Students'];
  const rows = data.map(r => [r.subject, r.count]);
  return (
    <div className="report-container fade-in">
      <div className="report-header">
        <div className="report-title">📌 {title}</div>
        <div className="export-btns">
          <button className="btn btn-sm btn-secondary" onClick={() => exportToPDF(title, cols, rows)}>📄 PDF</button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToExcel(title, cols, rows)}>📊 Excel</button>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead><tr><th>#</th><th>Subject</th><th>Pending Students</th></tr></thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={r.subject}>
                <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                <td style={{ fontWeight: '600' }}>{r.subject}</td>
                <td><span className={`badge ${r.count > 10 ? 'badge-rose' : r.count > 5 ? 'badge-amber' : 'badge-muted'}`}>{r.count} students</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── CGPA Reports ─────────────────────────────────────────────────────────────

function CGPADistributionTable({ distribution, data }) {
  const title = 'CGPA Distribution Report';
  const cols = ['Roll No', 'Name', 'Section', 'Batch', 'CGPA'];
  const rows = data.map(r => [r.rollNo, r.name, r.section, r.batch, r.cgpa]);
  return (
    <div className="report-container fade-in">
      <div className="report-header">
        <div className="report-title">📊 {title}</div>
        <div className="export-btns">
          <button className="btn btn-sm btn-secondary" onClick={() => exportToPDF(title, cols, rows)}>📄 PDF</button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToExcel(title, cols, rows)}>📊 Excel</button>
        </div>
      </div>
      {distribution && (
        <div className="stats-grid" style={{ marginBottom: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
          {Object.entries(distribution).map(([range, count]) => (
            <div key={range} className="stat-card" style={{ padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent-blue)' }}>{count}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>CGPA {range}</div>
            </div>
          ))}
        </div>
      )}
      <div className="table-wrapper">
        <table className="table">
          <thead><tr><th>#</th><th>Roll No</th><th>Name</th><th>Section</th><th>Batch</th><th>CGPA</th></tr></thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={r.rollNo}>
                <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                <td><code style={{ color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>{r.rollNo}</code></td>
                <td>{r.name}</td>
                <td><span className="badge badge-muted">{r.section}</span></td>
                <td>{r.batch}</td>
                <td>
                  <span style={{ fontWeight: '800', color: r.cgpa >= 8 ? 'var(--accent-emerald)' : r.cgpa >= 6 ? 'var(--accent-blue)' : 'var(--accent-rose)', fontSize: '15px' }}>{r.cgpa}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TopPerformersTable({ data }) {
  const title = 'Top Performers';
  const cols = ['Rank', 'Roll No', 'Name', 'Batch', 'Section', 'CGPA'];
  const rows = data.map(r => [r.rank, r.rollNo, r.name, r.batch, r.section, r.cgpa]);
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className="report-container fade-in">
      <div className="report-header">
        <div className="report-title">🏆 {title}</div>
        <div className="export-btns">
          <button className="btn btn-sm btn-secondary" onClick={() => exportToPDF(title, cols, rows)}>📄 PDF</button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToExcel(title, cols, rows)}>📊 Excel</button>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead><tr><th>Rank</th><th>Roll No</th><th>Name</th><th>Batch</th><th>Section</th><th>CGPA</th></tr></thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.rollNo}>
                <td style={{ fontSize: '20px' }}>{r.rank <= 3 ? medals[r.rank - 1] : `#${r.rank}`}</td>
                <td><code style={{ color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>{r.rollNo}</code></td>
                <td style={{ fontWeight: '600' }}>{r.name}</td>
                <td>{r.batch}</td>
                <td><span className="badge badge-muted">{r.section}</span></td>
                <td><span style={{ fontWeight: '800', fontSize: '16px', color: r.cgpa >= 9 ? 'var(--accent-emerald)' : 'var(--accent-blue)' }}>{r.cgpa}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AcademicRiskTable({ data }) {
  const title = 'Academic Risk Report';
  const cols = ['Roll No', 'Name', 'Section', 'Batch', 'CGPA', 'Backlogs', 'Risk Factors'];
  const rows = data.map(r => [r.rollNo, r.name, r.section, r.batch, r.cgpa, r.backlogCount, r.risks.join(', ')]);
  const riskClass = { 'Low CGPA': 'risk-critical', 'Multiple Backlogs': 'risk-warning', 'Low Attendance': 'risk-info' };
  return (
    <div className="report-container fade-in">
      <div className="report-header">
        <div className="report-title">🔴 {title}</div>
        <div className="export-btns">
          <button className="btn btn-sm btn-secondary" onClick={() => exportToPDF(title, cols, rows)}>📄 PDF</button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToExcel(title, cols, rows)}>📊 Excel</button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToCSV(title, cols, rows)}>📁 CSV</button>
        </div>
      </div>
      <div className="alert alert-error" style={{ marginBottom: '12px' }}>🚨 {data.length} students identified as academically at-risk</div>
      <div className="table-wrapper">
        <table className="table">
          <thead><tr><th>Roll No</th><th>Name</th><th>Section</th><th>CGPA</th><th>Backlogs</th><th>Risk Factors</th></tr></thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.rollNo}>
                <td><code style={{ color: 'var(--accent-rose)', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>{r.rollNo}</code></td>
                <td style={{ fontWeight: '600' }}>{r.name}</td>
                <td><span className="badge badge-muted">{r.section}</span></td>
                <td style={{ fontWeight: '700', color: r.cgpa < 5 ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>{r.cgpa}</td>
                <td><span className={`badge ${r.backlogCount >= 3 ? 'badge-rose' : 'badge-amber'}`}>{r.backlogCount}</span></td>
                <td>{r.risks.map(risk => <span key={risk} className={`risk-tag ${riskClass[risk] || 'risk-info'}`}>{risk}</span>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main dispatcher ──────────────────────────────────────────────────────────

export default function ReportTable({ reportType, reportData }) {
  if (!reportData || !reportData.data) return null;
  const { data, distribution, threshold } = reportData;

  switch (reportType) {
    case 'sectionAttendance': return <SectionAttendanceTable data={data} />;
    case 'subjectAttendance': return <SubjectAttendanceTable data={data} />;
    case 'lowAttendance': return <LowAttendanceTable data={data} threshold={threshold || 75} />;
    case 'exactAttendance': return <ExactAttendanceTable data={data} targetPct={reportData.targetPct} range={reportData.range} />;
    case 'departmentAttendance': return <DeptAttendanceTable data={data} />;
    case 'internalMarks': return <MarksTable data={data} type="internalMarks" />;
    case 'externalMarks': return <MarksTable data={data} type="externalMarks" />;
    case 'semesterResults': return <SemesterResultsTable data={data} />;
    case 'subjectPerformance': return <SubjectPerformanceTable data={data} />;
    case 'backlogReport': return <BacklogTable data={data} />;
    case 'pendingCompletions': return <PendingCompletionsTable data={data} />;
    case 'cgpaDistribution': return <CGPADistributionTable distribution={distribution} data={data} />;
    case 'topPerformers': return <TopPerformersTable data={data} />;
    case 'studentRanking': return <TopPerformersTable data={data} />;
    case 'academicRisk': return <AcademicRiskTable data={data} />;
    default: return (
      <div className="card" style={{ marginTop: '12px' }}>
        <pre style={{ fontSize: '12px', color: 'var(--text-secondary)', overflowX: 'auto' }}>
          {JSON.stringify(reportData, null, 2)}
        </pre>
      </div>
    );
  }
}
