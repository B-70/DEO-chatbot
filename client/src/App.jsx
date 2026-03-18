import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import AttendancePage from './pages/AttendancePage';
import MarksPage from './pages/MarksPage';
import BacklogsPage from './pages/BacklogsPage';
import CGPAPage from './pages/CGPAPage';
import RiskPage from './pages/RiskPage';
import Sidebar from './components/Sidebar';

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--text-secondary)' }}>Loading DataBot...</div>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontFamily: 'Inter' },
            success: { iconTheme: { primary: 'var(--accent-emerald)', secondary: '#fff' } },
            error: { iconTheme: { primary: 'var(--accent-rose)', secondary: '#fff' } }
          }}
        />
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
          <Route path="/chat" element={<ProtectedLayout><ChatPage /></ProtectedLayout>} />
          <Route path="/reports/attendance" element={<ProtectedLayout><AttendancePage /></ProtectedLayout>} />
          <Route path="/reports/marks" element={<ProtectedLayout><MarksPage /></ProtectedLayout>} />
          <Route path="/reports/backlogs" element={<ProtectedLayout><BacklogsPage /></ProtectedLayout>} />
          <Route path="/reports/cgpa" element={<ProtectedLayout><CGPAPage /></ProtectedLayout>} />
          <Route path="/reports/risk" element={<ProtectedLayout><RiskPage /></ProtectedLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
