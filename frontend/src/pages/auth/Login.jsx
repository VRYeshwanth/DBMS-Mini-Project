import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Car, Lock, Mail, ArrowRight, ShieldCheck, User } from 'lucide-react';
import Alert from '../../components/common/Alert';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if redirected due to expired token
  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        if (res.user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
        }
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      backgroundColor: 'var(--bg-main)'
    }}>
      <div style={{
        maxWidth: 440,
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 32px',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-color)'
      }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--primary)',
            color: '#181818',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
            boxShadow: 'var(--shadow-yellow)'
          }}>
            <Car size={30} strokeWidth={2.2} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            Sign in to access your Vehicle Rental account
          </p>
        </div>

        {isExpired && (
          <Alert type="warning" message="Your session has expired. Please sign in again." />
        )}

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                className="form-control"
                style={{ paddingLeft: 40 }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <Mail size={18} color="#999" style={{ position: 'absolute', left: 13, top: 12 }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                className="form-control"
                style={{ paddingLeft: 40 }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <Lock size={18} color="#999" style={{ position: 'absolute', left: 13, top: 12 }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: 12 }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span className="spinner spinner-sm" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#000' }} />
                Signing in...
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Sign In <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>

        {/* Demo Credentials Box for University Evaluator / Quick Testing */}
        <div style={{
          marginTop: 24,
          padding: '14px 16px',
          backgroundColor: '#FAF9F2',
          border: '1px solid #F2ECCB',
          borderRadius: 'var(--radius-md)',
          fontSize: 12
        }}>
          <div style={{ fontWeight: 700, color: '#8A6700', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
            <ShieldCheck size={14} /> University DBMS Demo Accounts:
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@gmail.com', 'admin123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 11, padding: '4px 10px', backgroundColor: '#FFFFFF' }}
            >
              Demo Admin (admin@gmail.com)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('david@example.com', 'password123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 11, padding: '4px 10px', backgroundColor: '#FFFFFF' }}
            >
              Demo Customer (david@example.com)
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#8A6700', fontWeight: 700 }}>
            Create Customer Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
