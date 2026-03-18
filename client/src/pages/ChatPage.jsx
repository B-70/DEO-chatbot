import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { useAuth, API_BASE } from '../context/AuthContext';
import ReportTable from '../components/ReportTable';

const SUGGESTIONS = [
  "Show section attendance for CSE",
  "Students with low attendance below 75%",
  "Show semester results",
  "Top 10 performers in CSE",
  "Students with backlogs",
  "Show internal marks report",
  "Academic risk students",
  "CGPA distribution for batch 2022-2026",
  "Subject performance analysis",
  "Show external marks for semester 3",
];

function TypingIndicator() {
  return (
    <div className="message-wrapper assistant">
      <div className="message-bubble message-assistant">
        <div className="typing-indicator">
          <div className="dot" /><div className="dot" /><div className="dot" />
        </div>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <div className={`message-wrapper ${msg.role}`}>
      {!isUser && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>🤖</div>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>DataBot</span>
        </div>
      )}
      <div className={`message-bubble ${isUser ? 'message-user' : 'message-assistant'}`}>
        {isUser ? (
          <span>{msg.content}</span>
        ) : (
          <div className="markdown-content" style={{ lineHeight: '1.7' }}>
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
      {msg.reportData && msg.reportType && (
        <div style={{ width: '100%', maxWidth: '800px', marginTop: '8px' }}>
          <ReportTable reportType={msg.reportType} reportData={msg.reportData} />
        </div>
      )}
      <div className="message-meta">{time}</div>
    </div>
  );
}

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { loadSessions(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const loadSessions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/chat/sessions`);
      setSessions(res.data);
    } catch { /* ignore */ }
  };

  const loadHistory = async (sessionId) => {
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${API_BASE}/chat/history/${sessionId}`);
      setMessages(res.data);
      setCurrentSession(sessionId);
    } catch { toast.error('Failed to load session'); }
    finally { setLoadingHistory(false); }
  };

  const newSession = () => {
    const sid = Math.random().toString(36).substring(2, 10);
    setCurrentSession(sid);
    setMessages([{
      role: 'assistant',
      content: `👋 Hello, **${user?.name}**! I'm **DataBot**, your AI academic report assistant.\n\nI can generate reports for your **${user?.department}** department. Try asking me things like:\n- *"Show section attendance"*\n- *"Students with low attendance"*\n- *"Top 10 performers"*\n- *"Academic risk students"*\n\nWhat would you like to know?`,
      timestamp: new Date()
    }]);
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const sid = currentSession || (() => { const s = Math.random().toString(36).substring(2, 10); setCurrentSession(s); return s; })();

    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date() }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/chat/message`, { message: msg, sessionId: sid });
      setMessages(prev => [...prev, res.data]);
      await loadSessions();
    } catch (err) {
      toast.error('Failed to get response');
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Sorry, I encountered an error. Please try again.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const deleteSession = async (e, sessionId) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_BASE}/chat/session/${sessionId}`);
      await loadSessions();
      if (currentSession === sessionId) newSession();
      toast.success('Session deleted');
    } catch { toast.error('Failed to delete session'); }
  };

  // Start fresh on mount
  useEffect(() => { newSession(); }, []);

  return (
    <div className="chat-layout">
      {/* Sessions sidebar */}
      <div className="chat-sidebar">
        <div style={{ padding: '12px' }}>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={newSession}>
            ✨ New Chat
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '8px 16px 4px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recent Sessions</div>
          {sessions.length === 0 ? (
            <div style={{ padding: '20px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>No sessions yet</div>
          ) : (
            sessions.map(s => (
              <div key={s._id} className={`session-item ${currentSession === s._id ? 'active' : ''}`}
                onClick={() => loadHistory(s._id)}
                style={{ position: 'relative' }}>
                <div className="session-title">{s.lastMessage?.substring(0, 40) || 'Chat session'}...</div>
                <div className="session-meta">{new Date(s.updatedAt).toLocaleDateString()} · {s.count} msgs</div>
                <button
                  onClick={(e) => deleteSession(e, s._id)}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', padding: '4px', borderRadius: '4px' }}
                  title="Delete session"
                >🗑️</button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="chat-main">
        {/* Chat header */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-secondary)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🤖</div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px' }}>DataBot AI Assistant</div>
            <div style={{ fontSize: '12px', color: 'var(--accent-emerald)' }}>● Online · {user?.department} Department</div>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {loadingHistory ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="spinner" /></div>
          ) : (
            messages.map((msg, i) => <Message key={i} msg={msg} />)
          )}
          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div style={{ padding: '0 20px 8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>💡 Quick suggestions:</div>
            <div className="suggestions">
              {SUGGESTIONS.slice(0, 5).map(s => (
                <button key={s} className="chip" onClick={() => sendMessage(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="chat-input-area">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                ref={inputRef}
                className="form-textarea"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Ask me to generate any academic report... (Enter to send, Shift+Enter for new line)"
                rows={2}
                style={{ resize: 'none', paddingRight: '50px' }}
                disabled={loading}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{ height: '62px', width: '62px', padding: '0', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}
            >
              {loading ? <span className="spinner" /> : '➤'}
            </button>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
            🔒 Responses are AI-generated based on your {user?.department} department data
          </div>
        </div>
      </div>
    </div>
  );
}
