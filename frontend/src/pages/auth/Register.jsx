import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Car, User, Mail, Lock, Phone, MapPin, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import Alert from '../../components/common/Alert';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    dob: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Name, email, and password are required.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(formData);
      if (res && res.success) {
        setSuccess(true);
        // Automatically log them in after registration
        try {
          await login(formData.email.trim(), formData.password);
          navigate('/', { replace: true });
        } catch {
          setTimeout(() => {
            navigate('/login');
          }, 1500);
        }
      } else {
        setError(res?.message || 'Registration failed');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '36px 16px',
      backgroundColor: 'var(--bg-main)'
    }}>
      <div style={{
        maxWidth: 520,
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 32px',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-color)'
      }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--primary)',
            color: '#181818',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            boxShadow: 'var(--shadow-yellow)'
          }}>
            <Car size={26} strokeWidth={2.2} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>
            Create Customer Account
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Join Velocity Rentals to book premier vehicles in seconds
          </p>
        </div>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
        {success && (
          <Alert
            type="success"
            message="Account created successfully! Logging you in..."
          />
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="name"
                name="name"
                type="text"
                className="form-control"
                style={{ paddingLeft: 40 }}
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <User size={18} color="#999" style={{ position: 'absolute', left: 13, top: 12 }} />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: 40 }}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: 40 }}
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <Lock size={18} color="#999" style={{ position: 'absolute', left: 13, top: 12 }} />
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="form-control"
                  style={{ paddingLeft: 40 }}
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <Phone size={18} color="#999" style={{ position: 'absolute', left: 13, top: 12 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dob">
                Date of Birth
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  className="form-control"
                  style={{ paddingLeft: 40 }}
                  value={formData.dob}
                  onChange={handleChange}
                />
                <Calendar size={18} color="#999" style={{ position: 'absolute', left: 13, top: 12 }} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">
              Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="address"
                name="address"
                type="text"
                className="form-control"
                style={{ paddingLeft: 40 }}
                placeholder="Street address, City, State"
                value={formData.address}
                onChange={handleChange}
              />
              <MapPin size={18} color="#999" style={{ position: 'absolute', left: 13, top: 12 }} />
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
                Creating your account...
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Register Account <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#8A6700', fontWeight: 700 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
