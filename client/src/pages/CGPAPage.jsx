import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth, API_BASE } from '../context/AuthContext';
import ReportTable from '../components/ReportTable';

const DEPTS = ['CSE', 'ECE', 'MECH', 'CIVIL'];
const BATCHES = ['', '2021-2025', '2022-2026', '2023-2027'];

export default function CGPAPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('distribution');
  const [filters, setFilters] = useState({ department: user?.department || 'CSE', batch: '', limit: 10 });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'distribution', label: '📊 CGPA Distribution', reportType: 'cgpaDistribution' },
    { id: 'top', label: '🏆 Top Performers', reportType: 'topPerformers' },
    { id: 'ranking', label: '📈 Student Ranking', reportType: 'studentRanking' },
  ];
  const active = tabs.find(t => t.id === activeTab);

  const generate = async () => {
    setLoading(true); setReportData(null);
    try {
      const params = { ...filters };
      if (!params.batch) delete params.batch;
      const res = await axios.post(`${API_BASE}/reports/generate`, { reportType: active.reportType, params });
      setReportData(res.data);
      toast.success(`Report generated: ${res.data.data?.length || 0} records`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-content fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '6px' }}>🏆 CGPA & Student Rankings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View CGPA distributions, top performers, and complete student rankings</p>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setReportData(null); }}
            style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', font: 'inherit', fontSize: '13px', fontWeight: '600', transition: 'all 0.15s ease',
              background: activeTab === t.id ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent',
              color: activeTab === t.id ? '#fff' : 'var(--text-secondary)' }}>
            {t.label}
          </button>
        ))}
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
          {activeTab === 'top' && (
            <div className="form-group" style={{ flex: '0 0 120px' }}>
              <label className="form-label">Top N</label>
              <input className="form-input" type="number" min={1} max={100} value={filters.limit} onChange={e => setFilters(f => ({ ...f, limit: e.target.value }))} />
            </div>
          )}
        </div>
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
