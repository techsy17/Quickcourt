import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import ROLES from '../../constants/roles';
import { ShieldCheck, ArrowRight, RefreshCw, Mail } from 'lucide-react';

export const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOTP, resendOTP } = useAuth();
  const { showToast } = useToast();

  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is missing. Please initiate signup again.');
      return;
    }
    if (String(otp).trim().length !== 6) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await verifyOTP({ email, otp: String(otp).trim() });
      showToast('Account verified successfully! Welcome to QuickCourt.', 'success');

      if (res.data?.user?.role === ROLES.ADMIN) {
        navigate('/admin/dashboard');
      } else if (res.data?.user?.role === ROLES.FACILITY_OWNER) {
        navigate('/owner/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code.');
      showToast(err.message || 'OTP verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await resendOTP(email);
      showToast('A fresh OTP code has been sent to your email!', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to resend OTP', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="qc-page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="qc-container" style={{ maxWidth: '440px' }}>
        <div className="qc-card" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          <div
            className="qc-brand-badge"
            style={{ width: '56px', height: '56px', margin: '0 auto 1.25rem', borderRadius: '14px' }}
          >
            <ShieldCheck size={28} />
          </div>

          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>Verify Your Email</h2>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            Enter the 6-digit code sent to <strong style={{ color: 'var(--text-primary)' }}>{email || 'your email'}</strong>
          </p>

          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '8px',
              padding: '0.6rem 0.85rem',
              fontSize: '0.8rem',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '1.5rem',
            }}
          >
            <Mail size={14} />
            <span>Check your inbox or spam folder for your dynamic OTP.</span>
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
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                placeholder="123456"
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.5em',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
                required
              />
            </div>

            <Button type="submit" variant="primary" size="lg" style={{ width: '100%' }} loading={loading}>
              Verify & Enter QuickCourt <ArrowRight size={18} />
            </Button>
          </form>

          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>Didn't receive the code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <RefreshCw size={13} className={resending ? 'spin-animation' : ''} />
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
