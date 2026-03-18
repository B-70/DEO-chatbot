import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const chartDefaults = {
  plugins: { legend: { labels: { color: '#8899bb', font: { family: 'Inter' } } } },
  scales: { x: { ticks: { color: '#8899bb' }, grid: { color: 'rgba(30,45,74,0.5)' } }, y: { ticks: { color: '#8899bb' }, grid: { color: 'rgba(30,45,74,0.5)' } } }
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const dept = user?.department;
      const [att, marks, cgpa, risk] = await Promise.all([
        axios.post(`${API_BASE}/reports/generate`, { reportType: 'departmentAttendance', params: { department: dept } }),
        axios.post(`${API_BASE}/reports/generate`, { reportType: 'subjectPerformance', params: { department: dept } }),
        axios.post(`${API_BASE}/reports/generate`, { reportType: 'cgpaDistribution', params: { department: dept } }),
        axios.post(`${API_BASE}/reports/generate`, { reportType: 'academicRisk', params: { department: dept } }),
      ]);
      setStats({ att: att.data, marks: marks.data, cgpa: cgpa.data, risk: risk.data });
    } catch { /* may fail before seed */ }
    finally { setLoading(false); }
  };

  const quickActions = [
    { label: 'AI Chatbot', icon: '🤖', desc: 'Ask anything about your data', to: '/chat', color: 'var(--accent-blue)' },
    { label: 'Attendance', icon: '📋', desc: 'Section & subject attendance', to: '/reports/attendance', color: 'var(--accent-emerald)' },
    { label: 'Marks', icon: '📝', desc: 'Internal & external marks', to: '/reports/marks', color: 'var(--accent-purple)' },
    { label: 'Backlogs', icon: '⚠️', desc: 'Students with pending courses', to: '/reports/backlogs', color: 'var(--accent-amber)' },
    { label: 'CGPA & Rankings', icon: '🏆', desc: 'Top performers & rankings', to: '/reports/cgpa', color: 'var(--accent-cyan)' },
    { label: 'Academic Risk', icon: '🔴', desc: 'At-risk student identification', to: '/reports/risk', color: 'var(--accent-rose)' },
  ];

  const cgpaData = stats?.cgpa?.distribution;
  const attData = stats?.att?.data;

  return (
    <div className="page-content fade-in">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '6px' }}>
          Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · {user?.department} Department · {user?.role?.toUpperCase()}
        </p>
      </div>

      {/* Summary stats */}
      <div className="stats-grid" style={{ marginBottom: '28px' }}>
        {[
          { label: 'Total Students', value: stats?.cgpa?.data?.length || '—', icon: '👥', color: 'var(--accent-blue)', glow: 'glow-blue' },
          { label: 'At-Risk Students', value: stats?.risk?.data?.length || '—', icon: '⚠️', color: 'var(--accent-rose)', glow: 'glow-rose' },
          { label: 'Subjects Tracked', value: stats?.marks?.data?.length || '—', icon: '📚', color: 'var(--accent-purple)', glow: 'glow-purple' },
          { label: 'Avg Pass Rate', value: stats?.marks?.data?.length ? Math.round(stats.marks.data.reduce((a, s) => a + s.passRate, 0) / stats.marks.data.length) + '%' : '—', icon: '📈', color: 'var(--accent-emerald)', glow: 'glow-emerald' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.glow}`}>
            <div className="stat-icon" style={{ background: `${s.color}22` }}><span style={{ fontSize: '20px' }}>{s.icon}</span></div>
            <div className="stat-value" style={{ color: s.color }}>{loading ? <div className="spinner" /> : s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      {!loading && stats && (
        <div className="grid-2" style={{ marginBottom: '28px' }}>
          {/* Attendance bar chart */}
          {attData && attData.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: '16px', fontWeight: '700' }}>📊 Subject-wise Attendance</h3>
              <Bar
                data={{
                  labels: attData.map(d => d.subject.length > 15 ? d.subject.slice(0, 15) + '…' : d.subject),
                  datasets: [{
                    label: 'Avg Attendance %',
                    data: attData.map(d => d.averageAttendance),
                    backgroundColor: attData.map(d => d.averageAttendance >= 75 ? 'rgba(16,185,129,0.7)' : d.averageAttendance >= 60 ? 'rgba(245,158,11,0.7)' : 'rgba(244,63,94,0.7)'),
                    borderRadius: 6,
                  }]
                }}
                options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } }, responsive: true }}
              />
            </div>
          )}

          {/* CGPA doughnut */}
          {cgpaData && (
            <div className="card">
              <h3 style={{ marginBottom: '16px', fontWeight: '700' }}>🎓 CGPA Distribution</h3>
              <Doughnut
                data={{
                  labels: Object.keys(cgpaData),
                  datasets: [{
                    data: Object.values(cgpaData),
                    backgroundColor: ['rgba(244,63,94,0.8)', 'rgba(245,158,11,0.8)', 'rgba(59,130,246,0.8)', 'rgba(139,92,246,0.8)', 'rgba(6,182,212,0.8)', 'rgba(16,185,129,0.8)'],
                    borderWidth: 0,
                  }]
                }}
                options={{ responsive: true, plugins: { legend: { position: 'right', labels: { color: '#8899bb', font: { family: 'Inter' } } } } }}
              />
            </div>
          )}
        </div>
      )}

      {/* Quick actions */}
      <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>⚡ Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {quickActions.map(action => (
          <div key={action.to} className="card" style={{ cursor: 'pointer', borderLeft: `3px solid ${action.color}` }}
            onClick={() => navigate(action.to)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = action.color; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>{action.icon}</div>
            <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px', color: action.color }}>{action.label}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{action.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
