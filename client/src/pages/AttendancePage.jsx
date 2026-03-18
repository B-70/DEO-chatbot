import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth, API_BASE } from '../context/AuthContext';
import ReportTable from '../components/ReportTable';

const DEPTS = ['CSE', 'ECE', 'MECH', 'CIVIL'];
const SECTIONS = ['', 'A', 'B', 'C'];
const SEMESTERS = ['', 1, 2, 3, 4, 5, 6, 7, 8];
const BATCHES = ['', '2021-2025', '2022-2026', '2023-2027'];

function FilterBar({ filters, setFilters, extraFields }) {
  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
      <div className="form-group" style={{ flex: '0 0 140px' }}>
        <label className="form-label">Department</label>
        <select className="form-select" value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}>
          {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className="form-group" style={{ flex: '0 0 100px' }}>
        <label className="form-label">Section</label>
        <select className="form-select" value={filters.section} onChange={e => setFilters(f => ({ ...f, section: e.target.value }))}>
          {SECTIONS.map(s => <option key={s} value={s}>{s || 'All'}</option>)}
        </select>
      </div>
      <div className="form-group" style={{ flex: '0 0 120px' }}>
        <label className="form-label">Semester</label>
        <select className="form-select" value={filters.semester} onChange={e => setFilters(f => ({ ...f, semester: e.target.value }))}>
          {SEMESTERS.map(s => <option key={s} value={s}>{s || 'All'}</option>)}
        </select>
      </div>
      <div className="form-group" style={{ flex: '0 0 150px' }}>
        <label className="form-label">Batch</label>
        <select className="form-select" value={filters.batch} onChange={e => setFilters(f => ({ ...f, batch: e.target.value }))}>
          {BATCHES.map(b => <option key={b} value={b}>{b || 'All'}</option>)}
        </select>
      </div>
      {extraFields}
    </div>
  );
}

export default function AttendancePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('section');
  const [filters, setFilters] = useState({ department: user?.department || 'CSE', section: '', semester: '', batch: '', academicYear: '2024-25', threshold: 75, subject: '' });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'section', label: '📋 Section', reportType: 'sectionAttendance' },
    { id: 'subject', label: '📚 Subject', reportType: 'subjectAttendance' },
    { id: 'low', label: '🚨 Low Attendance', reportType: 'lowAttendance' },
    { id: 'dept', label: '🏫 Department', reportType: 'departmentAttendance' },
  ];

  const active = tabs.find(t => t.id === activeTab);

  const generate = async () => {
    if (!active) return;
    setLoading(true); setReportData(null);
    try {
      const params = { ...filters };
      if (!params.section) delete params.section;
      if (!params.semester) delete params.semester;
      if (!params.batch) delete params.batch;
      if (!params.subject) delete params.subject;
      const res = await axios.post(`${API_BASE}/reports/generate`, { reportType: active.reportType, params });
      setReportData(res.data);
      toast.success(`Report generated: ${res.data.data?.length || 0} records`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate report');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-content fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '6px' }}>📋 Attendance Reports</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Generate section-wise, subject-wise, and department attendance reports</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setReportData(null); }}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', font: 'inherit', fontSize: '13px', fontWeight: '600', transition: 'all 0.15s ease',
              background: activeTab === t.id ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent',
              color: activeTab === t.id ? '#fff' : 'var(--text-secondary)' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        <FilterBar filters={filters} setFilters={setFilters}
          extraFields={
            <>
              {activeTab === 'subject' && (
                <div className="form-group" style={{ flex: '0 0 180px' }}>
                  <label className="form-label">Subject</label>
                  <input className="form-input" value={filters.subject} onChange={e => setFilters(f => ({ ...f, subject: e.target.value }))} placeholder="Subject name..." />
                </div>
              )}
              {activeTab === 'low' && (
                <div className="form-group" style={{ flex: '0 0 130px' }}>
                  <label className="form-label">Threshold (%)</label>
                  <input className="form-input" type="number" min={0} max={100} value={filters.threshold} onChange={e => setFilters(f => ({ ...f, threshold: e.target.value }))} />
                </div>
              )}
            </>
          }
        />
        <button className="btn btn-primary" onClick={generate} disabled={loading}>
          {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Generating...</> : '🔍 Generate Report'}
        </button>
      </div>

      {reportData && (
        <div style={{ marginTop: '20px' }}>
          <ReportTable reportType={active.reportType} reportData={reportData} />
        </div>
      )}
    </div>
  );
}
