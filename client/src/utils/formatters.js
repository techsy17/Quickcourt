export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'CONFIRMED':
    case 'APPROVED':
    case 'Booked':
      return 'qc-badge-success';
    case 'PENDING':
      return 'qc-badge-warning';
    case 'CANCELLED':
    case 'REJECTED':
      return 'qc-badge-danger';
    case 'COMPLETED':
      return 'qc-badge-info';
    default:
      return 'qc-badge-neutral';
  }
};
