import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ROLES from '../../constants/roles';
import { Trophy, Mail, Lock } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(formData);
      showToast(`Welcome back, ${res.data.user.name}!`, 'success');

      // Direct to appropriate destination based on role
      if (res.data.user.role === ROLES.ADMIN) {
        navigate('/admin/dashboard');
      } else if (res.data.user.role === ROLES.FACILITY_OWNER) {
        navigate('/owner/dashboard');
      } else {
        navigate(from === '/login' ? '/' : from);
      }
    } catch (err) {
      if (err.data?.requiresVerification) {
        showToast('Please verify your OTP code to activate your account.', 'warning');
        navigate('/verify-otp', {
          state: {
            email: err.data.email,
            demoOTP: err.data.demoOTP,
          },
        });
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
        showToast(err.message || 'Invalid credentials', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qc-page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="qc-container" style={{ maxWidth: '440px' }}>
        <div className="qc-card" style={{ padding: '2.5rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              className="qc-brand-badge"
              style={{ width: '48px', height: '48px', margin: '0 auto 1rem', borderRadius: '12px' }}
            >
              <Trophy size={26} />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>Welcome Back</h2>
            <p style={{ fontSize: '0.9rem' }}>Log in to book courts or manage your sports facility</p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              name="email"
              type="email"
              icon={Mail}
              placeholder="name@domain.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <div style={{ marginTop: '1.5rem' }}>
              <Button type="submit" variant="primary" size="lg" style={{ width: '100%' }} loading={loading}>
                Sign In
              </Button>
            </div>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
