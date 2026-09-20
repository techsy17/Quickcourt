import React from 'react';
import { getStatusBadgeClass } from '../../utils/formatters';

export const Badge = ({ status, variant, children, className = '' }) => {
  const badgeClass = variant ? `qc-badge-${variant}` : getStatusBadgeClass(status);
  return (
    <span className={`qc-badge ${badgeClass} ${className}`}>
      {children || status}
    </span>
  );
};

export default Badge;
