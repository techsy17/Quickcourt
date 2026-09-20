import React, { useState } from 'react';

export const LineChart = ({ data = [], height = 240, color = '#10b981', labelKey = 'label', valueKey = 'value', label = '' }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No trend data available
      </div>
    );
  }

  const padding = { top: 25, right: 25, bottom: 35, left: 35 };
  const width = 600;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map((d) => d[valueKey] || 0);
  const maxVal = Math.max(...values, 5);
  const minVal = 0;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
    const y = padding.top + chartHeight - ((d[valueKey] - minVal) / (maxVal - minVal || 1)) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, curr, i, arr) => {
    if (i === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[i - 1];
    const cpX1 = prev.x + (curr.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (curr.x - prev.x) / 2;
    const cpY2 = curr.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`lineGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
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

        {/* Gradient area fill */}
        <path d={areaD} fill={`url(#lineGrad-${color.replace('#', '')})`} />

        {/* Stroke curve line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />

        {/* Data points and hover interaction */}
        {points.map((pt, i) => (
          <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} style={{ cursor: 'pointer' }}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredIdx === i ? 6 : 4}
              fill={hoveredIdx === i ? '#ffffff' : color}
              stroke={color}
              strokeWidth="2"
              style={{ transition: 'all 0.15s ease-out' }}
            />
            {/* X-axis labels */}
            <text
              x={pt.x}
              y={height - 8}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize="11"
              fontFamily="var(--font-sans)"
            >
              {pt[labelKey]}
            </text>
          </g>
        ))}
      </svg>

      {/* Floating tooltip */}
      {hoveredIdx !== null && (
        <div
          style={{
            position: 'absolute',
            left: `${(points[hoveredIdx].x / width) * 100}%`,
            top: `${(points[hoveredIdx].y / height) * 100}%`,
            transform: 'translate(-50%, -130%)',
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
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{points[hoveredIdx][labelKey]}</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
            {points[hoveredIdx][valueKey]} {valueKey === 'earnings' ? '₹' : 'Bookings'}
          </div>
        </div>
      )}
    </div>
  );
};

export default LineChart;
