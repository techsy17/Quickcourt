import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import { CheckCircle2, CreditCard, Smartphone, Building2, ShieldCheck, Loader2 } from 'lucide-react';

export const SimulatedPaymentModal = ({
  isOpen,
  onClose,
  onConfirmBooking,
  total,
  courtName,
  slotTime,
  date,
}) => {
  const [method, setMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handlePay = async () => {
    setProcessing(true);
    // Simulate brief payment gateway authorization
    setTimeout(async () => {
      try {
        await onConfirmBooking(method);
        setCompleted(true);
      } catch (err) {
        setProcessing(false);
      }
    }, 1200);
  };

  const methods = [
    { id: 'UPI', label: 'Instant UPI (GPay / PhonePe / Paytm)', icon: Smartphone },
    { id: 'CARD', label: 'Credit / Debit Card (Simulated)', icon: CreditCard },
    { id: 'NETBANKING', label: 'Net Banking (Simulated HDFC/ICICI)', icon: Building2 },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !processing && onClose()}
      title="Simulated Payment Checkout"
      maxWidth="480px"
    >
      {completed ? (
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <CheckCircle2 size={36} />
          </div>
          <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
            Payment Successful!
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Your court booking is confirmed. Redirecting you to My Bookings...
          </p>
        </div>
      ) : (
        <div>
          {/* Order Summary box */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Court:</span>
              <strong style={{ color: '#fff' }}>{courtName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Time & Date:</span>
              <span style={{ color: 'var(--text-primary)' }}>{slotTime} ({date})</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px dashed var(--border-default)',
                paddingTop: '0.5rem',
                marginTop: '0.5rem',
                fontWeight: 700,
              }}
            >
              <span>Amount Due:</span>
              <span style={{ color: 'var(--primary)', fontSize: '1.15rem' }}>{formatCurrency(total)}</span>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
            Select simulated payment method (no real money will be charged):
          </p>

          {/* Payment Method Radio Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
            {methods.map((m) => {
              const Icon = m.icon;
              const isSelected = method === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => !processing && setMethod(m.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-default)'}`,
                    background: isSelected ? 'var(--primary-light)' : 'var(--bg-input)',
                    cursor: processing ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon size={18} color={isSelected ? 'var(--primary)' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '0.9rem', color: isSelected ? '#fff' : 'var(--text-secondary)', fontWeight: isSelected ? 600 : 400 }}>
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={processing}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handlePay}
              loading={processing}
              style={{ flex: 2 }}
            >
              Pay {formatCurrency(total)} (Simulated)
            </Button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            <ShieldCheck size={14} color="var(--primary)" />
            <span>Sandbox Mode: Instant approval simulator</span>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default SimulatedPaymentModal;
