import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth, API_BASE } from '../context/AuthContext';
import ReportTable from '../components/ReportTable';

const DEPTS = ['CSE', 'ECE', 'MECH', 'CIVIL'];
const BATCHES = ['', '2021-2025', '2022-2026', '2023-2027'];

export default function RiskPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ department: user?.department || 'CSE', batch: '' });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true); setReportData(null);
    try {
      const params = { ...filters };
      if (!params.batch) delete params.batch;
      const res = await axios.post(`${API_BASE}/reports/generate`, { reportType: 'academicRisk', params });
      setReportData(res.data);
      toast.success(`${res.data.data?.length || 0} at-risk students identified`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-content fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '6px' }}>🔴 Academic Risk Report</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Identify students at academic risk based on CGPA, backlogs, and attendance</p>
      </div>

      <div className="alert alert-info" style={{ marginBottom: '20px' }}>
        ℹ️ Students are flagged as at-risk if they have: <strong>CGPA below 5.0</strong>, <strong>3 or more backlogs</strong>, or <strong>average attendance below 75%</strong>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div className="form-group" style={{ flex: '0 0 140px' }}>
            <label className="form-label">Department</label>
            <select className="form-select" value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}>
              {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: '0 0 160px' }}>
            <label className="form-label">Batch</label>
            <select className="form-select" value={filters.batch} onChange={e => setFilters(f => ({ ...f, batch: e.target.value }))}>
              {BATCHES.map(b => <option key={b} value={b}>{b || 'All'}</option>)}
            </select>
          </div>
        </div>
        <button className="btn btn-primary" onClick={generate} disabled={loading}
          style={{ background: 'linear-gradient(135deg, #f43f5e, #ef4444)' }}>
          {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Analyzing...</> : '🔴 Identify At-Risk Students'}
        </button>
      </div>

      {reportData && (
        <div style={{ marginTop: '20px' }}>
          <ReportTable reportType="academicRisk" reportData={reportData} />
        </div>
      )}
    </div>
  );
}
