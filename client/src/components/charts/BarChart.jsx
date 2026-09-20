import React, { useState } from 'react';

export const BarChart = ({ data = [], height = 240, color = '#06b6d4', labelKey = 'label', valueKey = 'bookings' }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No bar chart data available
      </div>
    );
  }

  const padding = { top: 25, right: 20, bottom: 35, left: 30 };
  const width = 600;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map((d) => d[valueKey] || 0);
  const maxVal = Math.max(...values, 5);

  const barWidth = Math.min(chartWidth / (data.length * 1.6), 36);
  const totalSlots = data.length;
  const step = chartWidth / totalSlots;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`barGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = padding.top + chartHeight * ratio;
          return (
            <line
              key={idx}
              x1={padding.left}
              y1={y}
              x2={padding.left + chartWidth}
              y2={y}
              stroke="var(--border-subtle)"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const val = d[valueKey] || 0;
          const barH = (val / maxVal) * chartHeight;
          const x = padding.left + i * step + (step - barWidth) / 2;
          const y = padding.top + chartHeight - barH;
          const isHovered = hoveredIdx === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barH, 4)}
                rx="4"
                fill={`url(#barGrad-${color.replace('#', '')})`}
                opacity={isHovered ? 1 : 0.85}
                stroke={isHovered ? '#ffffff' : 'transparent'}
                strokeWidth="1.5"
                style={{ transition: 'all 0.15s ease' }}
              />
              <text
                x={x + barWidth / 2}
                y={height - 10}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize="11"
                fontFamily="var(--font-sans)"
              >
                {d[labelKey]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating tooltip */}
      {hoveredIdx !== null && (
        <div
          style={{
            position: 'absolute',
            left: `${((padding.left + hoveredIdx * step + step / 2) / width) * 100}%`,
            top: '20px',
            transform: 'translateX(-50%)',
            background: 'var(--bg-modal)',
            border: `1px solid ${color}`,
            borderRadius: '6px',
            padding: '6px 12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{data[hoveredIdx][labelKey]}</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
            {data[hoveredIdx][valueKey]} {valueKey === 'earnings' ? '₹' : 'units'}
          </div>
        </div>
      )}
    </div>
  );
};

export default BarChart;
