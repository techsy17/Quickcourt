import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import { ShieldCheck, Tag } from 'lucide-react';
import Button from '../common/Button';

export const PriceBreakdown = ({
  court,
  venue,
  selectedDate,
  selectedSlot,
  onProceed,
  disabled = false,
}) => {
  const price = court?.pricingPerHour || 0;
  const convenienceFee = 0;
  const total = price + convenienceFee;

  return (
    <div className="qc-card" style={{ height: 'fit-content', position: 'sticky', top: '90px' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.75rem' }}>
        Booking Summary
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Venue</span>
          <strong style={{ color: 'var(--text-primary)' }}>{venue?.name || 'Selected Venue'}</strong>
        </div>

        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Court</span>
          <strong style={{ color: 'var(--text-primary)' }}>{court?.courtName || 'Select a court'}</strong>
          {court?.sportType && (
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', marginLeft: '0.5rem' }}>
              • {court.sportType}
            </span>
          )}
        </div>

        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Date</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
            {selectedDate ? formatDate(selectedDate) : 'Select a date'}
          </span>
        </div>

        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Slot</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
            {selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime} (1 Hour)` : 'Select a slot'}
          </span>
        </div>
      </div>

      {/* Pricing table */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <span>Court Rate (1 hr)</span>
          <span>{formatCurrency(price)}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <span>Platform Convenience Fee</span>
          <span style={{ color: 'var(--primary)' }}>FREE (₹0)</span>
        </div>

        <div
          style={{
            borderTop: '1px dashed var(--border-default)',
            paddingTop: '0.85rem',
            marginTop: '0.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>Total Amount</span>
          <span style={{ fontWeight: 800, fontSize: '1.35rem', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <Button
          variant="primary"
          size="lg"
          style={{ width: '100%' }}
          disabled={disabled || !selectedSlot || !selectedDate || !court}
          onClick={onProceed}
        >
          Proceed to Confirm & Pay
        </Button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
        <ShieldCheck size={14} color="var(--primary)" />
        <span>100% Secure Simulated Payment</span>
      </div>
    </div>
  );
};

export default PriceBreakdown;
