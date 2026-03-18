import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${API_BASE}/auth/me`)
        .then(r => setUser(r.data))
        .catch(() => { setToken(null); localStorage.removeItem('token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    const res = await axios.post(`${API_BASE}/auth/login`, { username, password });
    if (res.data.requireOtp) {
      return res.data; // Return email & flag to handle OTP step
    }
    const { token: t, user: u } = res.data;
    localStorage.setItem('token', t);
    setToken(t);
    setUser(u);
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    return u;
  };

  const signup = async (userData) => {
    const res = await axios.post(`${API_BASE}/auth/signup`, userData);
    return res.data; // returns message and requireOtp info
  };

  const verifyOtp = async (email, otp) => {
    const res = await axios.post(`${API_BASE}/auth/verify-otp`, { email, otp });
    const { token: t, user: u } = res.data;
    localStorage.setItem('token', t);
    setToken(t);
    setUser(u);
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    return u;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, verifyOtp, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export { API_BASE };
