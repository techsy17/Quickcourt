import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ROLES from '../../constants/roles';
import { Trophy, Mail, Lock, User, Building, ShieldCheck, Sparkles } from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
];

export const Signup = () => {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.USER,
    avatar: AVATAR_PRESETS[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signup(formData);
      showToast('Account registered! A 6-digit OTP has been sent to your email.', 'info');
      navigate('/verify-otp', {
        state: {
          email: formData.email,
        },
      });
    } catch (err) {
      setError(err.message || 'Registration failed.');
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qc-page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="qc-container" style={{ maxWidth: '480px' }}>
        <div className="qc-card" style={{ padding: '2.5rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div
              className="qc-brand-badge"
              style={{ width: '48px', height: '48px', margin: '0 auto 1rem', borderRadius: '12px' }}
            >
              <Trophy size={26} />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>Create Your Account</h2>
            <p style={{ fontSize: '0.9rem' }}>Join QuickCourt to book or list local sports facilities</p>
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
            {/* Role Selection */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="qc-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                I want to register as:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <div
                  onClick={() => handleRoleSelect(ROLES.USER)}
                  style={{
                    border: `1px solid ${formData.role === ROLES.USER ? 'var(--primary)' : 'var(--border-default)'}`,
                    background: formData.role === ROLES.USER ? 'var(--primary-light)' : 'var(--bg-input)',
                    padding: '0.65rem 0.4rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <User size={18} color={formData.role === ROLES.USER ? 'var(--primary)' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: formData.role === ROLES.USER ? '#fff' : 'var(--text-secondary)' }}>
                    Player
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Book Courts</span>
                </div>

                <div
                  onClick={() => handleRoleSelect(ROLES.FACILITY_OWNER)}
                  style={{
                    border: `1px solid ${formData.role === ROLES.FACILITY_OWNER ? 'var(--primary)' : 'var(--border-default)'}`,
                    background: formData.role === ROLES.FACILITY_OWNER ? 'var(--primary-light)' : 'var(--bg-input)',
                    padding: '0.65rem 0.4rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <Building size={18} color={formData.role === ROLES.FACILITY_OWNER ? 'var(--primary)' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: formData.role === ROLES.FACILITY_OWNER ? '#fff' : 'var(--text-secondary)' }}>
                    Owner
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Manage Venue</span>
                </div>

                <div
                  onClick={() => handleRoleSelect(ROLES.ADMIN)}
                  style={{
                    border: `1px solid ${formData.role === ROLES.ADMIN ? '#f59e0b' : 'var(--border-default)'}`,
                    background: formData.role === ROLES.ADMIN ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-input)',
                    padding: '0.65rem 0.4rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <ShieldCheck size={18} color={formData.role === ROLES.ADMIN ? '#f59e0b' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: formData.role === ROLES.ADMIN ? '#fff' : 'var(--text-secondary)' }}>
                    Admin
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Full System</span>
                </div>
              </div>
            </div>

            <Input
              label="Full Name"
              name="name"
              type="text"
              icon={User}
              placeholder="e.g. Aarav Patel"
              value={formData.name}
              onChange={handleChange}
              required
            />

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
              label="Password (min. 6 chars)"
              name="password"
              type="password"
              icon={Lock}
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {/* Avatar Preset Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
                <Sparkles size={14} color="var(--primary)" />
                <label className="qc-label" style={{ margin: 0 }}>
                  Choose Player Avatar:
                </label>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {AVATAR_PRESETS.map((avatarUrl, idx) => (
                  <img
                    key={idx}
                    src={avatarUrl}
                    alt={`Avatar option ${idx + 1}`}
                    onClick={() => setFormData({ ...formData, avatar: avatarUrl })}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: `2px solid ${formData.avatar === avatarUrl ? 'var(--primary)' : 'transparent'}`,
                      opacity: formData.avatar === avatarUrl ? 1 : 0.6,
                      transform: formData.avatar === avatarUrl ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" style={{ width: '100%' }} loading={loading}>
              Create Account & Verify OTP
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
