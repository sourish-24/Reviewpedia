import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, LogIn, KeyRound, ArrowLeft, RefreshCw, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../index.css';

export default function AuthModal({ onClose, initialMode = 'login' }) {
  const { login, register, sendSignupOtp, sendForgotPasswordOtp, resetPassword } = useAuth();
  
  // mode: 'login' | 'signup' | 'forgot'
  const [mode, setMode] = useState(initialMode === 'signup' ? 'signup' : 'login');
  
  // Step for signup: 'details' | 'otp'
  const [signupStep, setSignupStep] = useState('details');

  // Step for forgot password: 'email' | 'otp_password'
  const [forgotStep, setForgotStep] = useState('email');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  // Countdown timer for OTP resend cooldown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
        onClose();
      } else if (mode === 'signup') {
        if (signupStep === 'details') {
          // Send OTP and proceed to verification step
          await sendSignupOtp(email.trim(), username.trim());
          setSignupStep('otp');
          setResendCooldown(60);
          setSuccessMessage(`Verification code sent to ${email.trim()}`);
        } else {
          // Verify OTP and complete registration
          if (!otp || otp.trim().length !== 6) {
            throw new Error('Please enter the complete 6-digit code');
          }
          await register(username.trim(), email.trim(), password, otp.trim());
          onClose();
        }
      } else if (mode === 'forgot') {
        if (forgotStep === 'email') {
          // Send OTP for forgot password
          await sendForgotPasswordOtp(email.trim());
          setForgotStep('otp_password');
          setResendCooldown(60);
        } else {
          // Verify OTP and reset password
          if (!otp || otp.trim().length !== 6) {
            throw new Error('Please enter the complete 6-digit code');
          }
          if (!password || password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
          }
          await resetPassword(email.trim(), otp.trim(), password);
          onClose();
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        await sendSignupOtp(email.trim(), username.trim());
      } else if (mode === 'forgot') {
        await sendForgotPasswordOtp(email.trim());
      }
      setResendCooldown(60);
      setSuccessMessage('A fresh verification code has been sent!');
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px 12px 42px', border: 'none', borderBottom: '2px solid transparent',
    background: 'var(--surface-highest)', outline: 'none', fontSize: '1rem',
    fontFamily: 'var(--font-body)', color: 'var(--on-surface)', transition: 'border-color 0.2s',
    borderRadius: '8px 8px 0 0', boxSizing: 'border-box'
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
        
        <h2 style={{ margin: '0 0 16px 0', fontSize: '1.75rem', color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: 12 }}>
          {mode === 'login' ? (
            <><LogIn color="var(--primary)" /> Sign In</>
          ) : mode === 'signup' && signupStep === 'otp' ? (
            <><KeyRound color="var(--primary)" /> Verify Email</>
          ) : mode === 'signup' ? (
            <><LogIn color="var(--primary)" /> Create Account</>
          ) : (
            <><KeyRound color="var(--primary)" /> Reset Password</>
          )}
        </h2>

        {mode === 'signup' && signupStep === 'otp' && (
          <p style={{ margin: '0 0 20px 0', color: 'var(--on-surface-variant)', fontSize: '0.9rem', lineHeight: 1.5, fontFamily: 'var(--font-body)' }}>
            We've sent a 6-digit verification code to <strong style={{ color: 'var(--on-surface)' }}>{email}</strong>.
          </p>
        )}

        {mode === 'forgot' && forgotStep === 'email' && (
          <p style={{ margin: '0 0 20px 0', color: 'var(--on-surface-variant)', fontSize: '0.9rem', lineHeight: 1.5, fontFamily: 'var(--font-body)' }}>
            Enter your account email address and we'll send you a 6-digit verification code to set a new password.
          </p>
        )}

        {mode === 'forgot' && forgotStep === 'otp_password' && (
          <p style={{ margin: '0 0 20px 0', color: 'var(--on-surface-variant)', fontSize: '0.9rem', lineHeight: 1.5, fontFamily: 'var(--font-body)' }}>
            We've sent a 6-digit code to <strong style={{ color: 'var(--on-surface)' }}>{email}</strong>. Enter the code and your new password below.
          </p>
        )}

        {successMessage && (
          <div style={{ padding: '10px 14px', marginBottom: '16px', backgroundColor: 'rgba(14, 165, 233, 0.12)', border: '1px solid rgba(14, 165, 233, 0.3)', borderRadius: '8px', color: '#0ea5e9', fontSize: '0.85rem', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} /> {successMessage}
          </div>
        )}

        {error && (
          <div style={{ padding: '12px', marginBottom: '20px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', fontSize: '0.875rem', fontFamily: 'var(--font-body)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* LOGIN FORM */}
          {mode === 'login' && (
            <>
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
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={(e) => e.target.style.borderBottomColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
                  style={{ ...inputStyle, paddingRight: '42px' }} 
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--on-surface-variant)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 4
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setForgotStep('email');
                    setError('');
                    setSuccessMessage('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Forgot password?
                </button>
              </div>
            </>
          )}

          {/* SIGNUP STEP 1: USERNAME, EMAIL, PASSWORD */}
          {mode === 'signup' && signupStep === 'details' && (
            <>
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
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password (min. 6 characters)" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={(e) => e.target.style.borderBottomColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
                  style={{ ...inputStyle, paddingRight: '42px' }} 
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--on-surface-variant)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 4
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </>
          )}

          {/* SIGNUP STEP 2: 6-DIGIT OTP VERIFICATION */}
          {mode === 'signup' && signupStep === 'otp' && (
            <>
              <div style={{ position: 'relative' }}>
                <KeyRound size={18} color="var(--on-surface-variant)" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 14 }} />
                <input 
                  type="text" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="Enter 6-digit code" 
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  onFocus={(e) => e.target.style.borderBottomColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
                  style={{
                    ...inputStyle,
                    fontSize: '1.4rem',
                    letterSpacing: '8px',
                    textAlign: 'center',
                    fontWeight: 700,
                    paddingLeft: '16px'
                  }} 
                  autoFocus
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => { setSignupStep('details'); setError(''); setSuccessMessage(''); }}
                  style={{
                    background: 'none', border: 'none', color: 'var(--on-surface-variant)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0
                  }}
                >
                  <ArrowLeft size={14} /> Change email
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  style={{
                    background: 'none', border: 'none',
                    color: resendCooldown > 0 ? 'var(--on-surface-variant)' : 'var(--primary)',
                    cursor: resendCooldown > 0 ? 'default' : 'pointer',
                    fontWeight: 600, padding: 0
                  }}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </>
          )}

          {/* FORGOT PASSWORD STEP 1: EMAIL */}
          {mode === 'forgot' && forgotStep === 'email' && (
            <>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--on-surface-variant)" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 14 }} />
                <input 
                  type="email" 
                  placeholder="Enter your account email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={(e) => e.target.style.borderBottomColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
                  style={inputStyle} 
                  required
                  autoFocus
                />
              </div>
            </>
          )}

          {/* FORGOT PASSWORD STEP 2: OTP & NEW PASSWORD */}
          {mode === 'forgot' && forgotStep === 'otp_password' && (
            <>
              <div style={{ position: 'relative' }}>
                <KeyRound size={18} color="var(--on-surface-variant)" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 14 }} />
                <input 
                  type="text" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="Enter 6-digit code" 
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  onFocus={(e) => e.target.style.borderBottomColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
                  style={{
                    ...inputStyle,
                    fontSize: '1.4rem',
                    letterSpacing: '8px',
                    textAlign: 'center',
                    fontWeight: 700,
                    paddingLeft: '16px'
                  }} 
                  autoFocus
                  required
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--on-surface-variant)" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 14 }} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter new password (min. 6 characters)" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={(e) => e.target.style.borderBottomColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
                  style={{ ...inputStyle, paddingRight: '42px' }} 
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--on-surface-variant)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 4
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => { setForgotStep('email'); setError(''); setSuccessMessage(''); }}
                  style={{
                    background: 'none', border: 'none', color: 'var(--on-surface-variant)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0
                  }}
                >
                  <ArrowLeft size={14} /> Change email
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  style={{
                    background: 'none', border: 'none',
                    color: resendCooldown > 0 ? 'var(--on-surface-variant)' : 'var(--primary)',
                    cursor: resendCooldown > 0 ? 'default' : 'pointer',
                    fontWeight: 600, padding: 0
                  }}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </>
          )}

          <button 
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ 
              width: '100%', padding: '16px', opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1.05rem', marginTop: '10px'
            }}
          >
            {loading 
              ? 'Processing...' 
              : mode === 'login' 
                ? 'Sign In' 
                : mode === 'signup'
                  ? (signupStep === 'details' ? 'Get Verification Code' : 'Verify & Create Account')
                  : (forgotStep === 'email' ? 'Send Reset Code' : 'Reset Password')}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-body)' }}>
          {mode === 'login' && (
            <>
              Don't have an account?{' '}
              <button 
                onClick={() => { 
                  setMode('signup'); 
                  setSignupStep('details');
                  setError(''); 
                  setSuccessMessage('');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-body)', padding: 0 }}
              >
                Create one
              </button>
            </>
          )}

          {mode === 'signup' && (
            <>
              Already have an account?{' '}
              <button 
                onClick={() => { 
                  setMode('login'); 
                  setError(''); 
                  setSuccessMessage('');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-body)', padding: 0 }}
              >
                Sign In
              </button>
            </>
          )}

          {mode === 'forgot' && (
            <>
              Remember your password?{' '}
              <button 
                onClick={() => { 
                  setMode('login'); 
                  setError(''); 
                  setSuccessMessage('');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-body)', padding: 0 }}
              >
                Back to Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
