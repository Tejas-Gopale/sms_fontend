// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logo from '../../assects/logo.png';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setError('');
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.email || !form.password) {
    setError("Please enter your email and password.");
    return;
  }

  setLoading(true);

  try {
    const data = await login(form.email, form.password);

    const role = data.roles[0];

    if (role === "SUPER_ADMIN") {
      navigate("/super-admin/dashboard", { replace: true });
    }

    else if (role === "SCHOOL_ADMIN") {
      navigate("/school-admin/dashboard", { replace: true });
    }

    else if (role === "TEACHER") {
      navigate("/teachers/dashboard", { replace: true });
    }

    else if (role === "PARENT") {
      navigate("/parents/dashboard", { replace: true });
    }

  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      "Invalid credentials";

    setError(msg);
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(200,169,110,0.3); }
          50%       { box-shadow: 0 0 0 6px rgba(200,169,110,0); }
        }

        body { background: #0c0e14; }

        .login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
          background: #0c0e14;
        }

        
        /* ── LEFT PANEL ── */
        .left-panel {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          background: linear-gradient(135deg, #0f1117 0%, #141820 100%);
          border-right: 1px solid rgba(200,169,110,0.12);
          overflow: hidden;
          }
          .left-panel::before {
            content: '';
            position: absolute;
            inset: 0;
            background:
            radial-gradient(ellipse 60% 40% at 20% 80%, rgba(200,169,110,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 80% 10%, rgba(100,130,200,0.06) 0%, transparent 70%);
            pointer-events: none;
            }
            
            .brand-logo {
              width: 50%;
              height: 50%;
              object-fit: contain;
            }
              
        .brand-mark {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          animation: fadeUp 0.6s ease both;
        }
        .brand-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #c8a96e, #a07840);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
        }
        .brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          color: #e8dcc8;
          letter-spacing: 0.02em;
        }

        .hero-text {
          animation: fadeUp 0.7s 0.15s ease both;
        }
        .hero-eyebrow {
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #c8a96e;
          margin-bottom: 1.5rem;
          font-weight: 500;
        }
        .hero-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          line-height: 1.1;
          color: #f0e8d8;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }
        .hero-headline em {
          font-style: italic;
          background: linear-gradient(90deg, #c8a96e, #e8c88a, #c8a96e);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
        .hero-sub {
          font-size: 0.95rem;
          color: #7a8090;
          line-height: 1.7;
          max-width: 380px;
        }

        .stats-row {
          display: flex;
          gap: 2.5rem;
          animation: fadeUp 0.7s 0.3s ease both;
        }
        .stat { display: flex; flex-direction: column; gap: 0.25rem; }
        .stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          color: #c8a96e;
          font-weight: 700;
        }
        .stat-label {
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #4a5060;
        }

        /* ── RIGHT PANEL ── */
        .right-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          background: #0c0e14;
        }

        .form-container {
          width: 100%;
          max-width: 420px;
          animation: fadeUp 0.8s 0.2s ease both;
        }

        .form-header { margin-bottom: 2.5rem; }
        .form-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          color: #f0e8d8;
          margin-bottom: 0.5rem;
        }
        .form-subtitle {
          font-size: 0.9rem;
          color: #4a5060;
        }

        .field { margin-bottom: 1.25rem; }
        .field label {
          display: block;
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6a7080;
          margin-bottom: 0.6rem;
          font-weight: 500;
        }
        .input-wrap { position: relative; }
        .field input {
          width: 100%;
          padding: 0.85rem 1rem;
          background: #141820;
          border: 1px solid #222632;
          border-radius: 8px;
          color: #e8dcc8;
          font-size: 0.95rem;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .field input:focus {
          border-color: #c8a96e;
          box-shadow: 0 0 0 3px rgba(200,169,110,0.12);
        }
        .field input::placeholder { color: #333844; }
        .field input[type="password"] { padding-right: 3rem; }

        .eye-btn {
          position: absolute;
          right: 0.8rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #4a5060;
          font-size: 1rem;
          padding: 0.25rem;
          transition: color 0.2s;
        }
        .eye-btn:hover { color: #c8a96e; }

        .error-box {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(220, 60, 60, 0.08);
          border: 1px solid rgba(220, 60, 60, 0.25);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          margin-bottom: 1.25rem;
          font-size: 0.875rem;
          color: #e07070;
          animation: fadeUp 0.3s ease;
        }

        .submit-btn {
          width: 100%;
          padding: 0.95rem;
          background: linear-gradient(135deg, #c8a96e, #a07840);
          border: none;
          border-radius: 8px;
          color: #0c0e14;
          font-size: 0.9rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          margin-top: 0.5rem;
          position: relative;
        }
        .submit-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(12,14,20,0.3);
          border-top-color: #0c0e14;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 0.5rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .divider {
          display: flex; align-items: center; gap: 1rem;
          margin: 1.75rem 0;
          color: #2a3040;
          font-size: 0.75rem;
        }
        .divider::before, .divider::after {
          content: ''; flex: 1; height: 1px;
          background: #1e2230;
        }

        .secure-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #3a4050;
          margin-top: 1.5rem;
          letter-spacing: 0.05em;
        }

        @media (max-width: 768px) {
          .login-root { grid-template-columns: 1fr; }
          .left-panel { display: none; }
          .right-panel { padding: 2rem 1.5rem; }
        }
      `}</style>

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
          <div className="form-container">
            <div className="form-header">
              <h2 className="form-title">Welcome back</h2>
              <p className="form-subtitle">Sign in to your admin account to continue</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="error-box" role="alert">
                  <span>⚠</span>
                  <span>{error}</span>
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
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

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
        </div>
      </div>
    </>
  );
};

export default LoginPage;
