import React from 'react';
import { getNextDays } from '../../utils/dateUtils';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';

export const SlotSelector = ({
  courts = [],
  selectedCourt,
  onSelectCourt,
  selectedDate,
  onSelectDate,
  slots = [],
  selectedSlot,
  onSelectSlot,
  loading = false,
}) => {
  const days = getNextDays(7);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Court Selector */}
      {courts.length > 1 && (
        <div>
          <label className="qc-label" style={{ marginBottom: '0.65rem', display: 'block' }}>
            Select Court / Pitch:
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {courts.map((court) => (
              <button
                key={court._id}
                type="button"
                onClick={() => onSelectCourt(court)}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${selectedCourt?._id === court._id ? 'var(--primary)' : 'var(--border-default)'}`,
                  background: selectedCourt?._id === court._id ? 'var(--primary-light)' : 'var(--bg-card)',
                  color: selectedCourt?._id === court._id ? 'var(--primary)' : 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {court.courtName} (₹{court.pricingPerHour}/hr)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Date Selector */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Calendar size={18} color="var(--primary)" />
          <label className="qc-label" style={{ margin: 0, fontWeight: 600 }}>
            Select Booking Date:
          </label>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {days.map((d) => {
            const isSelected = selectedDate === d.date;
            return (
              <button
                key={d.date}
                type="button"
                onClick={() => onSelectDate(d.date)}
                style={{
                  minWidth: '85px',
                  padding: '0.65rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-default)'}`,
                  background: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                  color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }}>
                  {d.dayLabel}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  {d.formatted}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Time Slots Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} color="var(--primary)" />
            <label className="qc-label" style={{ margin: 0, fontWeight: 600 }}>
              Select Time Slot (1 Hour):
            </label>
          </div>

          {/* Slot Legend */}
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', border: '1px solid var(--border-default)', background: 'var(--bg-input)' }} />
              Available
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--primary)' }} />
              Selected
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#334155', opacity: 0.5 }} />
              Booked
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(239, 68, 68, 0.3)' }} />
              Maintenance
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading court slot availability...
          </div>
        ) : slots.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-input)', borderRadius: '8px' }}>
            No slots scheduled for this court and date.
          </div>
        ) : (
          <div className="qc-slots-grid">
            {slots.map((slot) => {
              const isSelected = selectedSlot?.startTime === slot.startTime;
              const isBooked = slot.isBooked;
              const isBlocked = slot.isBlocked;

              let btnClass = 'qc-slot-btn';
              if (isSelected) btnClass += ' selected';
              else if (isBlocked) btnClass += ' blocked';
              else if (isBooked) btnClass += ' booked';

              return (
                <button
                  key={slot.startTime}
                  type="button"
                  className={btnClass}
                  disabled={isBooked || isBlocked}
                  onClick={() => onSelectSlot(slot)}
                  title={isBlocked ? `Unavailable: ${slot.blockReason || 'Maintenance'}` : isBooked ? 'Slot already booked' : 'Available for booking'}
                >
                  <span>{slot.startTime}</span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>to {slot.endTime}</span>
                  {isBlocked && (
                    <span style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '2px', color: '#f87171' }}>
                      <AlertTriangle size={10} /> Maintenance
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotSelector;
