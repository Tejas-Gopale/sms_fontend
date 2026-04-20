// src/pages/LoginPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import logo from '../../assects/logo.png';
import './../styles/Login.css';
import API from '../services/api';
// ─────────────────────────────────────────────
//  ForgotPasswordView
// ─────────────────────────────────────────────
const ForgotPasswordView = ({ onBack }) => {
  const [email, setEmail]         = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your registered email.'); return; }

    setLoading(true);
    setError('');

    try {
      await API.post('/auth/forgot-password',  { email: email.trim() })
      // Always show success regardless (backend never leaks if email exists)
      setSubmitted(true);
      console.log('Password reset link sent (if email is registered)');

    } catch (err) {
      console.error('Forgot password error:', err);
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error   ||
        'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="view-forgot">
        <div className="success-screen">
          <div className="success-circle">✦</div>
          <h2 className="success-title">Check your inbox</h2>
          <p className="success-desc">
            If this email is registered, we've sent a secure password reset link to your inbox.
            The link expires in <strong style={{ color: '#c8a96e' }}>15 minutes</strong>.
          </p>
          <p className="success-email-hint">{email}</p>

          <div className="progress-track">
            <div className="progress-fill" />
          </div>

          <button className="submit-btn" onClick={onBack}>
            Back to Sign In
          </button>

          <p className="resend-hint">
            Didn't receive it?&nbsp;
            <span onClick={() => setSubmitted(false)}>Send again</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="view-forgot">
      <button className="back-nav" onClick={onBack}>
        <span className="back-arrow">←</span> Back to sign in
      </button>

      <div className="form-header">
        <h2 className="form-title">Reset password</h2>
        <p className="form-subtitle">
          Enter the email tied to your account and we'll send a reset link.
        </p>
      </div>

      <div className="info-chip">
        <span className="info-chip-icon">🔑</span>
        The link expires in <strong>15 minutes</strong> and can only be used once.
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="error-box" role="alert">
            <span>⚠</span><span>{error}</span>
          </div>
        )}

        <div className="field">
          <label htmlFor="fp-email">Registered Email</label>
          <input
            id="fp-email"
            type="email"
            placeholder="you@school.com"
            value={email}
            onChange={e => { setError(''); setEmail(e.target.value); }}
            disabled={loading}
            autoFocus
          />
        </div>

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? 'Sending link…' : 'Send Reset Link'}
        </button>
      </form>

      <div className="divider">secured · one-time link</div>
      <div className="secure-badge">🔒 &nbsp;Link is encrypted & single-use</div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  LoginView
// ─────────────────────────────────────────────
const LoginView = ({ onForgot }) => {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();

  const [form, setForm]                 = useState({ email: '', password: '' });
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => {
    setError('');
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      const role = data.roles[0];
      if      (role === 'SUPER_ADMIN')                         navigate('/super-admin/dashboard',  { replace: true });
      else if (role === 'SCHOOL_ADMIN')                        navigate('/school-admin/dashboard', { replace: true });
      else if (role === 'TEACHER' || role === 'CLASS_TEACHER') navigate('/teachers/dashboard',     { replace: true });
      else if (role === 'PARENT')                              navigate('/parents/dashboard',      { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error   ||
        'Invalid credentials'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-login">
      <div className="form-header">
        <h2 className="form-title">Welcome back</h2>
        <p className="form-subtitle">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="error-box" role="alert">
            <span>⚠</span><span>{error}</span>
          </div>
        )}

        <div className="field">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@school.com"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
            autoFocus
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="input-wrap">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        <button type="button" className="forgot-link" onClick={onForgot}>
          Forgot password?
        </button>

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div className="divider">secured by JWT · auto-refresh enabled</div>
      <div className="secure-badge">
        🔒 &nbsp;256-bit encrypted · tokens auto-rotate on expiry
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  LoginPage (root)
// ─────────────────────────────────────────────
const LoginPage = () => {
  const location = useLocation();

  // If user was redirected from the expired-token page, open forgot view directly
  const [view, setView] = useState(
    location.state?.openForgot ? 'forgot' : 'login'
  );

  return (
    <div className="login-root">
      {/* ── LEFT PANEL ── */}
      <div className="left-panel">
        <div className="brand-mark">
          <img src={logo} alt="SchoolMS Logo" className="brand-logo" />
          <span className="brand-name">SchoolMS</span>
        </div>

        <div className="hero-text">
          <p className="hero-eyebrow">School Management System</p>
          <h1 className="hero-headline">
            Built for <em>educators</em>,<br />
            shaped by outcomes.
          </h1>
          <p className="hero-sub">
            Manage admissions, attendance, academics, and administration
            from a single unified platform designed for CBSE and beyond.
          </p>
        </div>

        <div className="stats-row">
          <div className="stat">
            <span className="stat-num">12K+</span>
            <span className="stat-label">Students</span>
          </div>
          <div className="stat">
            <span className="stat-num">340+</span>
            <span className="stat-label">Teachers</span>
          </div>
          <div className="stat">
            <span className="stat-num">99.9%</span>
            <span className="stat-label">Uptime</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="right-panel">
        <div className="panel-wrapper">
          {view === 'login'
            ? <LoginView  onForgot={() => setView('forgot')} />
            : <ForgotPasswordView onBack={() => setView('login')} />
          }
        </div>
      </div>
    </div>
  );
};

export default LoginPage;