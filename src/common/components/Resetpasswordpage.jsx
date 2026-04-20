// src/pages/ResetPasswordPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assects/logo.png';
import './../styles/Resetpasswordpage.css';
import API from '../services/Api';
// ─────────────────────────────────────────────────────────────────────────────
//  Password strength helper
// ─────────────────────────────────────────────────────────────────────────────
function getStrength(password) {
  if (!password) return { score: 0, label: '', level: '' };
  let score = 0;
  if (password.length >= 8)                    score++;
  if (password.length >= 12)                   score++;
  if (/[A-Z]/.test(password))                  score++;
  if (/[0-9]/.test(password))                  score++;
  if (/[^A-Za-z0-9]/.test(password))           score++;

  if (score <= 1) return { score: 1, label: 'Weak',   level: 'weak'   };
  if (score === 2) return { score: 2, label: 'Fair',   level: 'fair'   };
  if (score === 3) return { score: 3, label: 'Good',   level: 'good'   };
  return             { score: 4, label: 'Strong', level: 'strong' };
}

// ─────────────────────────────────────────────────────────────────────────────
//  ResetPasswordPage
// ─────────────────────────────────────────────────────────────────────────────
const ResetPasswordPage = () => {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const token           = searchParams.get('token');

  // State
  const [tokenState, setTokenState]         = useState('validating'); // 'validating' | 'valid' | 'invalid'
  const [newPassword, setNewPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]               = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [error, setError]                   = useState('');
  const [loading, setLoading]               = useState(false);
  const [success, setSuccess]               = useState(false);
  const [countdown, setCountdown]           = useState(5);
  const [shakeConfirm, setShakeConfirm]     = useState(false);

  // ── 1. Validate token on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setTokenState('invalid');
      return;
    }
   API.get(`/auth/validate-reset-token?token=${token}`)
      .then(res => {
        setTokenState(res.data.valid ? 'valid' : 'invalid');
      })
      .catch(() => setTokenState('invalid'));
  }, [token]);

  // ── 2. Countdown redirect after success ─────────────────────────────────
  useEffect(() => {
    if (!success) return;
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(interval); navigate('/login'); }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [success, navigate]);

  // ── 3. Submit handler ────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setShakeConfirm(true);
      setTimeout(() => setShakeConfirm(false), 500);
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
    await API.post('/auth/reset-password', {
        token,
        newPassword,
        confirmPassword,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error   ||
        'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [token, newPassword, confirmPassword]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const strength      = getStrength(newPassword);
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  // ─────────────────────────────────────────────────────────────────────────
  //  Render helpers
  // ─────────────────────────────────────────────────────────────────────────

  const renderRight = () => {

    // Validating token
    if (tokenState === 'validating') {
      return (
        <div className="rp-loading">
          <div className="rp-loading-spinner" />
          <p className="rp-loading-text">Verifying your reset link…</p>
        </div>
      );
    }

    // Invalid / expired token
    if (tokenState === 'invalid') {
      return (
        <div className="rp-invalid">
          <div className="rp-invalid-icon">⏱</div>
          <h2 className="rp-invalid-title">Link expired or invalid</h2>
          <p className="rp-invalid-desc">
            This password reset link has expired or has already been used.
            Reset links are valid for <strong style={{ color: '#c8a96e' }}>15 minutes</strong> and can only be used once.
          </p>
          <button
            className="rp-submit-btn"
            onClick={() => navigate('/login', { state: { openForgot: true } })}
          >
            Request a new link
          </button>
          <button className="rp-outline-btn" onClick={() => navigate('/login')}>
            ← Back to Sign In
          </button>
        </div>
      );
    }

    // Success
    if (success) {
      return (
        <div className="rp-success">
          <div className="rp-success-circle">✦</div>
          <h2 className="rp-success-title">Password updated!</h2>
          <p className="rp-success-desc">
            Your password has been reset successfully.
            You can now sign in with your new password.
          </p>
          <button className="rp-submit-btn" onClick={() => navigate('/login')}>
            Sign In Now
          </button>
          <p className="rp-countdown">
            Redirecting to login in <span>{countdown}s</span>…
          </p>
        </div>
      );
    }

    // Main form
    return (
      <>
        <div className="rp-form-header">
          <h2 className="rp-form-title">Set new password</h2>
          <p className="rp-form-subtitle">
            Choose a strong password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="rp-error-box" role="alert">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* New Password */}
          <div className="rp-field">
            <label htmlFor="newPassword">New Password</label>
            <div className="rp-input-wrap">
              <input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={e => { setError(''); setNewPassword(e.target.value); }}
                disabled={loading}
                autoFocus
                autoComplete="new-password"
              />
              <button
                type="button"
                className="rp-eye-btn"
                onClick={() => setShowNew(v => !v)}
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? '🙈' : '👁'}
              </button>
            </div>

            {/* Strength meter */}
            {newPassword.length > 0 && (
              <div className="rp-strength">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className={`rp-strength-bar ${i <= strength.score ? `active-${strength.level}` : ''}`}
                  />
                ))}
                <span className={`rp-strength-label ${strength.level}`}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="rp-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="rp-input-wrap">
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={e => { setError(''); setConfirmPassword(e.target.value); }}
                disabled={loading}
                autoComplete="new-password"
                className={shakeConfirm ? 'input-error' : ''}
              />
              <button
                type="button"
                className="rp-eye-btn"
                onClick={() => setShowConfirm(v => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? '🙈' : '👁'}
              </button>
            </div>

            {/* Match indicator */}
            {confirmPassword.length > 0 && (
              <div className={`rp-match ${passwordsMatch ? 'match-ok' : 'match-err'}`}>
                <span>{passwordsMatch ? '✓' : '✗'}</span>
                <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
              </div>
            )}
          </div>

          <button
            className="rp-submit-btn"
            type="submit"
            disabled={loading || passwordsMismatch}
          >
            {loading && <span className="rp-spinner" />}
            {loading ? 'Updating password…' : 'Update Password'}
          </button>
        </form>

        <div className="rp-divider">one-time secure link</div>
        <div className="rp-badge">🔒 &nbsp;256-bit encrypted · link used only once</div>
      </>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="rp-root">
      {/* ── LEFT PANEL ── */}
      <div className="rp-left">
        <div className="rp-brand">
          <img src={logo} alt="SchoolMS Logo" className="rp-brand-logo" />
          <span className="rp-brand-name">SchoolMS</span>
        </div>

        <div className="rp-hero">
          <p className="rp-eyebrow">Account Security</p>
          <h1 className="rp-headline">
            Your security,<br />
            our <em>priority</em>.
          </h1>
          <p className="rp-sub">
            Choose a strong password to keep your school's data safe.
            We never store passwords in plain text.
          </p>
        </div>

        <div className="rp-tips">
          <p className="rp-tips-label">Password tips</p>
          <div className="rp-tip">
            <span className="rp-tip-icon">✦</span>
            <span className="rp-tip-text">Use at least 8 characters with a mix of uppercase, numbers and symbols</span>
          </div>
          <div className="rp-tip">
            <span className="rp-tip-icon">✦</span>
            <span className="rp-tip-text">Avoid using your name, school name or common words</span>
          </div>
          <div className="rp-tip">
            <span className="rp-tip-icon">✦</span>
            <span className="rp-tip-text">Never reuse a password you've used on another site</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="rp-right">
        <div className="rp-container">
          {renderRight()}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;