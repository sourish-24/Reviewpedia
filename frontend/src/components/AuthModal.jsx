import React, { useState } from 'react';
import { X, Mail, Lock, User, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../index.css';

export default function AuthModal({ onClose, initialMode = 'login' }) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      onClose(); // Close modal on success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px 12px 42px', border: 'none', borderBottom: '2px solid transparent',
    background: 'var(--surface-highest)', outline: 'none', fontSize: '1rem',
    fontFamily: 'var(--font-body)', color: 'var(--on-surface)', transition: 'border-color 0.2s',
    borderRadius: '8px 8px 0 0'
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(26, 28, 28, 0.5)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)'
    }}>
      <div className="glass-panel" style={{ width: 400, padding: '32px', background: 'var(--surface-lowest)', position: 'relative', border: '1px solid var(--outline-variant)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
          <X size={24} />
        </button>
        
        <h2 style={{ margin: '0 0 24px 0', fontSize: '1.75rem', color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <LogIn color="var(--primary)" /> {isLogin ? 'Sign In' : 'Create Account'}
        </h2>

        {error && (
          <div style={{ padding: '12px', marginBottom: '20px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', fontSize: '0.875rem', fontFamily: 'var(--font-body)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--on-surface-variant)" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 14 }} />
              <input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                onFocus={(e) => e.target.style.borderBottomColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
                style={inputStyle} 
                required
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail size={18} color="var(--on-surface-variant)" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 14 }} />
            <input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={(e) => e.target.style.borderBottomColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
              style={inputStyle} 
              required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} color="var(--on-surface-variant)" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 14 }} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={(e) => e.target.style.borderBottomColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
              style={inputStyle} 
              required
            />
          </div>

          <button 
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ 
              width: '100%', padding: '16px', opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1.05rem', marginTop: '10px'
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-body)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-body)', padding: 0 }}
          >
            {isLogin ? 'Create one' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
