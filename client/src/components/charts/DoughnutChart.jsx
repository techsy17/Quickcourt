import React, { useState } from 'react';

const PALETTE = ['#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

export const DoughnutChart = ({ data = [], height = 240, labelKey = 'sport', valueKey = 'earnings' }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const total = data.reduce((sum, d) => sum + (d[valueKey] || 0), 0);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No category breakdown data available
      </div>
    );
  }

  const size = 200;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', padding: '0.5rem 0' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          {data.map((item, idx) => {
            const val = item[valueKey] || 0;
            const percent = val / total;
            const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
            const strokeDashoffset = -circumference * accumulatedPercent;
            accumulatedPercent += percent;

            const isHovered = hoveredIdx === idx;
            const color = PALETTE[idx % PALETTE.length];

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: hoveredIdx !== null && !isHovered ? 0.4 : 1,
                }}
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {hoveredIdx !== null ? data[hoveredIdx][labelKey] : 'Total'}
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
            {hoveredIdx !== null
              ? `₹${data[hoveredIdx][valueKey]?.toLocaleString()}`
              : `₹${total?.toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {data.map((item, idx) => {
          const color = PALETTE[idx % PALETTE.length];
          const isHovered = hoveredIdx === idx;
          const pct = Math.round(((item[valueKey] || 0) / total) * 100);

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
                opacity: hoveredIdx !== null && !isHovered ? 0.4 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color }} />
              <span style={{ color: 'var(--text-secondary)' }}>{item[labelKey]}:</span>
              <strong style={{ color: '#fff' }}>₹{item[valueKey]?.toLocaleString()}</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DoughnutChart;
