import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import api from '../../lib/api';
import { AppDataContext } from '../../context/AppDataContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@karmarealestate.in');
  const [password, setPassword] = useState('KarmaAdmin@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { setAdminUser } = useContext(AppDataContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/admin/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('admin_token', res.data.token);
        setAdminUser(res.data.admin);
        toast.success(`Welcome back, ${res.data.admin?.name || 'Admin'}!`);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials. Please verify your email and password.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Sign In | KARMA Real Estate</title>
      </Helmet>

      <div className="login-container">
        {/* Left Side: Luxury Hero Panel */}
        <div className="login-left">
          <div className="login-left-overlay"></div>
          
          <div className="login-left-content">
            {/* Top Brand */}
            <div className="login-left-brand">
              <div className="brand-logo-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 21 9-18 9 18" />
                  <path d="M7 13h10" />
                </svg>
              </div>
              <div className="brand-logo-text">
                <div className="brand-title">KARMA</div>
                <div className="brand-sub">REAL ESTATE</div>
              </div>
            </div>

            {/* Center Copy & Feature Cards */}
            <div className="login-left-main">
              <span className="admin-pill">ADMIN PANEL</span>
              <h1 className="hero-headline">
                Manage Properties.<br />
                Build Tomorrow.
              </h1>
              <p className="hero-subtext">
                Insights. Control. Growth.<br />
                All in one place.
              </p>

              {/* Feature Cards */}
              <div className="feature-cards-list">
                <div className="feature-card">
                  <div className="feature-card-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="feature-card-title">Real-time Insights</h4>
                    <p className="feature-card-desc">Track performance and leads</p>
                  </div>
                </div>

                <div className="feature-card">
                  <div className="feature-card-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="feature-card-title">Manage Everything</h4>
                    <p className="feature-card-desc">Properties, users, enquiries</p>
                  </div>
                </div>

                <div className="feature-card">
                  <div className="feature-card-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="feature-card-title">Secure & Reliable</h4>
                    <p className="feature-card-desc">Your data is always protected</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Slogan */}
            <div className="login-left-footer">
              <div className="footer-line"></div>
              <div className="footer-text">REAL ESTATE FOR A BRIGHTER TOMORROW</div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Canvas */}
        <div className="login-right">
          <div className="login-right-top">
            <Link to="/" className="back-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Back to Website
            </Link>
          </div>

          <div className="login-card-wrap">
            <div className="login-card">
              {/* Card Header Logo */}
              <div className="card-brand-header">
                <div className="card-logo-icon">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 21 9-18 9 18" />
                    <path d="M7 13h10" />
                  </svg>
                </div>
                <div className="card-brand-name">KARMA</div>
                <div className="card-brand-sub">REAL ESTATE</div>
              </div>

              <h2 className="card-title">Sign in to Admin Panel</h2>
              <p className="card-subtitle">Access your dashboard to manage your business.</p>

              {error && (
                <div className="error-alert">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="login-form">
                <div className="input-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    <input
                      id="email"
                      type="email"
                      placeholder="team@karmarealestate.in"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-actions-row">
                  <label className="checkbox-wrap">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                    />
                    <span>Keep me signed in</span>
                  </label>
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={() => alert('Please contact the super admin at support@karmarealestate.in to reset credentials.')}
                  >
                    Forgot password?
                  </button>
                </div>

                <button type="submit" className="login-submit-btn" disabled={loading}>
                  <span>{loading ? 'Authenticating...' : 'Sign in'}</span>
                  {!loading && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="login-right-footer">
            © 2026 Karma Real Estate. All rights reserved.
          </div>
        </div>
      </div>

      <style>{`
        .login-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background: #ffffff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #0f172a;
        }

        /* Left Side */
        .login-left {
          flex: 1.1;
          position: relative;
          background-image: url('/assets/admin-login-bg.jpg');
          background-size: cover;
          background-position: center;
          color: #ffffff;
          display: flex;
          overflow: hidden;
        }

        .login-left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(145deg, rgba(8, 14, 26, 0.94) 0%, rgba(15, 23, 42, 0.84) 45%, rgba(10, 15, 30, 0.96) 100%);
          z-index: 1;
        }

        .login-left-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 56px 64px;
          width: 100%;
          box-sizing: border-box;
        }

        .login-left-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brand-logo-icon {
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-logo-text .brand-title {
          font-size: 20px;
          font-weight: 900;
          letter-spacing: 3.5px;
          color: #ffffff;
          line-height: 1;
        }

        .brand-logo-text .brand-sub {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2px;
          color: rgba(255, 255, 255, 0.65);
          margin-top: 4px;
        }

        .login-left-main {
          margin: auto 0;
          padding: 40px 0;
          max-width: 480px;
        }

        .admin-pill {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2.5px;
          color: rgba(255, 255, 255, 0.55);
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .hero-headline {
          font-size: 44px;
          font-weight: 800;
          line-height: 1.18;
          color: #ffffff;
          margin: 0 0 18px 0;
          letter-spacing: -0.6px;
        }

        .hero-subtext {
          font-size: 16px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.7);
          margin: 0 0 36px 0;
        }

        .feature-cards-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .feature-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .feature-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateX(4px);
        }

        .feature-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          flex-shrink: 0;
        }

        .feature-card-title {
          font-size: 15px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 2px 0;
        }

        .feature-card-desc {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.65);
          margin: 0;
        }

        .login-left-footer {
          margin-top: 24px;
        }

        .footer-line {
          width: 38px;
          height: 2px;
          background: rgba(255, 255, 255, 0.4);
          margin-bottom: 12px;
        }

        .footer-text {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          color: rgba(255, 255, 255, 0.45);
          text-transform: uppercase;
        }

        /* Right Side */
        .login-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 40px 48px;
          background: #fafafa;
          box-sizing: border-box;
          position: relative;
        }

        .login-right-top {
          display: flex;
          justify-content: flex-end;
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #475569;
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .back-link:hover {
          color: #0f172a;
        }

        .login-card-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          flex: 1;
          padding: 24px 0;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background: #ffffff;
          border-radius: 28px;
          padding: 44px 40px;
          box-shadow: 0 20px 50px -12px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.04);
          box-sizing: border-box;
        }

        .card-brand-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 24px;
        }

        .card-logo-icon {
          color: #0f172a;
          margin-bottom: 6px;
        }

        .card-brand-name {
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 3px;
          color: #0f172a;
          line-height: 1;
        }

        .card-brand-sub {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 2px;
          color: #64748b;
          margin-top: 3px;
        }

        .card-title {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          text-align: center;
          margin: 0 0 8px 0;
          letter-spacing: -0.4px;
        }

        .card-subtitle {
          font-size: 14px;
          color: #64748b;
          text-align: center;
          margin: 0 0 28px 0;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          color: #b91c1c;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          margin-bottom: 20px;
          line-height: 1.4;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 8px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          color: #94a3b8;
          pointer-events: none;
        }

        .input-wrapper input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          font-size: 14px;
          color: #0f172a;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .input-wrapper input:focus {
          border-color: #0066ff;
          box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.12);
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
        }

        .password-toggle:hover {
          color: #475569;
        }

        .form-actions-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          margin-top: -4px;
        }

        .checkbox-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #475569;
          cursor: pointer;
          user-select: none;
        }

        .checkbox-wrap input {
          cursor: pointer;
          width: 16px;
          height: 16px;
          accent-color: #0066ff;
        }

        .forgot-link {
          background: none;
          border: none;
          color: #0066ff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        .login-submit-btn {
          margin-top: 10px;
          width: 100%;
          padding: 14px;
          background: #0066ff;
          color: #ffffff;
          border: none;
          border-radius: 9999px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 6px 18px rgba(0, 102, 255, 0.25);
          transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
        }

        .login-submit-btn:hover:not(:disabled) {
          background: #0052cc;
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(0, 102, 255, 0.32);
        }

        .login-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .login-right-footer {
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          padding-top: 16px;
        }

        /* Responsive */
        @media (max-width: 980px) {
          .login-container {
            flex-direction: column;
          }
          .login-left {
            min-height: 480px;
            flex: none;
          }
          .login-left-content {
            padding: 40px 28px;
          }
          .hero-headline {
            font-size: 32px;
          }
          .login-right {
            padding: 36px 20px;
          }
          .login-card {
            padding: 32px 24px;
            box-shadow: none;
            border: 1px solid #f1f5f9;
          }
        }
      `}</style>
    </>
  );
}
