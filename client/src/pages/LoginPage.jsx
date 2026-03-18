import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, signup, verifyOtp } = useAuth();
  const navigate = useNavigate();
  
  const [view, setView] = useState('login'); // 'login', 'signup', 'otp'
  const [form, setForm] = useState({ 
    username: '', password: '', email: '', name: '', department: 'CSE', otp: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await login(form.username, form.password);
      if (res?.requireOtp) {
        setForm(f => ({ ...f, email: res.email }));
        toast.success(res.message || 'OTP sent to your email.');
        setView('otp');
      } else {
        toast.success('Welcome back! 🎉');
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await signup(form);
      if (data.requireOtp) {
        toast.success(data.message || 'OTP sent to your email. Please verify.');
        setView('otp');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await verifyOtp(form.email, form.otp);
      toast.success('Authentication successful! 🎉');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-page">
      <div className="login-bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="login-card fade-in" style={{ maxWidth: view === 'signup' ? '480px' : '420px', transition: 'max-width 0.3s ease' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(59,130,246,0.3)' }}>
            🎓
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '6px' }}>
            <span className="text-gradient">DataBot</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Department Report Intelligence System
          </p>
        </div>

        <div className="card" style={{ border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
          
          {/* OTP VIEW */}
          {view === 'otp' && (
            <div className="fade-in">
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>✉️</div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>Check your email</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  We've sent a verification code to <strong style={{color: 'var(--text-primary)'}}>{form.email}</strong>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ textAlign: 'center' }}>Verification Code (OTP)</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={form.otp}
                    onChange={e => setForm(f => ({ ...f, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    required
                    style={{ fontSize: '24px', letterSpacing: '8px', textAlign: 'center', fontWeight: '700', padding: '16px' }}
                  />
                </div>

                {error && (
                  <div className="alert alert-error">
                    <span>⚠️</span> {error}
                  </div>
                )}

                <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Verifying...</> : 'Verify & Sign In'}
                </button>
                
                <button type="button" className="btn btn-ghost" onClick={() => setView('login')} style={{ justifyContent: 'center', marginTop: '8px' }}>
                  Back to Login
                </button>
              </form>
            </div>
          )}

          {/* LOGIN VIEW */}
          {view === 'login' && (
            <div className="fade-in">
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius)' }}>
                <button style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontWeight: '600', cursor: 'default' }}>
                  Sign In
                </button>
                <button onClick={() => setView('signup')} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', fontWeight: '500', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--text-primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Username or Email</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Enter your username or email"
                    value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    required
                    autoComplete="username"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <div className="alert alert-error">
                    <span>⚠️</span> {error}
                  </div>
                )}

                <button className="btn btn-primary btn-lg" type="submit" disabled={loading}
                  style={{ marginTop: '4px', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Signing in...</> : '🔐 Sign In'}
                </button>
              </form>
            </div>
          )}

          {/* SIGNUP VIEW */}
          {view === 'signup' && (
            <div className="fade-in">
               <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius)' }}>
                <button onClick={() => setView('login')} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', fontWeight: '500', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--text-primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
                  Sign In
                </button>
                <button style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontWeight: '600', cursor: 'default' }}>
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="grid-2" style={{ gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" type="text" placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select className="form-select" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                      <option value="CSE">Computer Science (CSE)</option>
                      <option value="ECE">Electronics (ECE)</option>
                      <option value="MECH">Mechanical (MECH)</option>
                      <option value="CIVIL">Civil (CIVIL)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" placeholder="john@university.edu" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>

                <div className="grid-2" style={{ gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input className="form-input" type="text" placeholder="johndoe" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input className="form-input" type="password" placeholder="Create a password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
                  </div>
                </div>

                {error && (
                  <div className="alert alert-error">
                    <span>⚠️</span> {error}
                  </div>
                )}

                <button className="btn btn-primary btn-lg" type="submit" disabled={loading}
                  style={{ marginTop: '8px', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Sending OTP...</> : '✨ Create Account'}
                </button>
              </form>
            </div>
          )}

        </div>


      </div>
    </div>
  );
}
