import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/', icon: '📊', label: 'Dashboard', exact: true },
  { to: '/chat', icon: '🤖', label: 'AI Chatbot' },
  { to: '/reports/attendance', icon: '📋', label: 'Attendance Reports' },
  { to: '/reports/marks', icon: '📝', label: 'Marks & Results' },
  { to: '/reports/backlogs', icon: '⚠️', label: 'Backlog Reports' },
  { to: '/reports/cgpa', icon: '🏆', label: 'CGPA & Rankings' },
  { to: '/reports/risk', icon: '🔴', label: 'Academic Risk' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const roleColors = { admin: 'var(--accent-purple)', deo: 'var(--accent-blue)', hod: 'var(--accent-emerald)', faculty: 'var(--accent-amber)' };
  const roleColor = roleColors[user?.role] || 'var(--accent-blue)';

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🎓</div>
        <div>
          <div className="logo-text">DataBot</div>
          <div className="logo-sub">Report Intelligence</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '8px' }}>
        <div className="nav-section">Navigation</div>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div className="nav-section" style={{ marginTop: '12px' }}>Department</div>
        <div style={{ padding: '8px 16px', margin: '2px 8px' }}>
          <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Current Dept.</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: roleColor }}>{user?.department}</div>
          </div>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar" style={{ background: `${roleColor}33`, color: roleColor }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <div className="user-name">{user?.name}</div>
          <div className="user-role" style={{ color: roleColor, textTransform: 'capitalize' }}>{user?.role}</div>
        </div>
        <button className="btn btn-ghost" style={{ padding: '6px', fontSize: '16px' }} onClick={handleLogout} title="Logout">
          🚪
        </button>
      </div>
    </div>
  );
}
