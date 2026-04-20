// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assects/logo.png'; // Path check kar lena (assets?)

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your registered email.");
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Yahan aapka backend API call aayega
      // Example: await axios.post('/api/auth/forgot-password', { email });
      
      // Simulation for success:
      setMessage("If this email exists, a reset link has been sent to your inbox.");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        /* Reuse existing styles or keep them in a global CSS */
        .forgot-root {
          min-height: 100vh;
          background: #0c0e14;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          padding: 2rem;
        }
        .form-card {
          width: 100%;
          max-width: 400px;
          background: linear-gradient(135deg, #0f1117 0%, #141820 100%);
          padding: 2.5rem;
          border-radius: 16px;
          border: 1px solid rgba(200,169,110,0.12);
          animation: fadeUp 0.6s ease;
        }
        .success-box {
          background: rgba(40, 167, 69, 0.1);
          border: 1px solid rgba(40, 167, 69, 0.3);
          color: #71d38e;
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        /* ... existing styles for input, buttons etc from LoginPage ... */
      `}</style>

      <div className="forgot-root">
        <div className="form-card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img src={logo} alt="Logo" style={{ width: '60px', marginBottom: '1rem' }} />
            <h2 style={{ color: '#f0e8d8', fontFamily: 'Playfair Display' }}>Reset Password</h2>
            <p style={{ color: '#7a8090', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Enter your email to receive a password reset link.
            </p>
          </div>

          {message ? (
            <div className="success-box">
              {message}
              <div style={{ marginTop: '1.5rem' }}>
                 <Link to="/login" style={{ color: '#c8a96e', fontWeight: '600', textDecoration: 'none' }}>
                    Back to Login
                 </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="error-box">{error}</div>}
              
              <div className="field">
                <label>Registered Email</label>
                <input
                  type="email"
                  placeholder="you@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button className="submit-btn" type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <Link to="/login" style={{ color: '#4a5060', fontSize: '0.85rem', textDecoration: 'none' }}>
                   Suddenly remembered? <strong>Login</strong>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;