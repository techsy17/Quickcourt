import React from 'react';

export const HeatmapChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No peak hours data available
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.count || 0), 1);

  const getHeatBg = (count) => {
    if (!count) return 'rgba(30, 41, 59, 0.4)';
    const ratio = count / maxVal;
    if (ratio > 0.75) return '#10b981';
    if (ratio > 0.45) return 'rgba(16, 185, 129, 0.65)';
    if (ratio > 0.2) return 'rgba(16, 185, 129, 0.35)';
    return 'rgba(16, 185, 129, 0.18)';
  };

  return (
    <div style={{ width: '100%', padding: '0.5rem 0' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(62px, 1fr))',
          gap: '8px',
        }}
      >
        {data.map((slot, idx) => {
          const bg = getHeatBg(slot.count);
          const isHigh = (slot.count / maxVal) > 0.6;

          return (
            <div
              key={idx}
              style={{
                background: bg,
                borderRadius: '8px',
                padding: '10px 4px',
                textAlign: 'center',
                border: '1px solid var(--border-default)',
                transition: 'transform 0.15s ease',
              }}
              title={`${slot.hour}: ${slot.count} bookings`}
            >
              <div style={{ fontSize: '0.75rem', color: isHigh ? '#ffffff' : 'var(--text-muted)', fontWeight: 600 }}>
                {slot.hour}
              </div>
              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: isHigh ? '#ffffff' : 'var(--text-primary)',
                  marginTop: '2px',
                }}
              >
                {slot.count}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>Low Activity</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'rgba(30, 41, 59, 0.4)' }} />
          <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'rgba(16, 185, 129, 0.35)' }} />
          <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'rgba(16, 185, 129, 0.65)' }} />
          <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#10b981' }} />
        </div>
        <span>Peak Activity</span>
      </div>
    </div>
  );
};

export default HeatmapChart;
