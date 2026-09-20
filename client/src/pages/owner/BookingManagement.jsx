import React, { useState, useEffect } from 'react';
import ownerService from '../../services/ownerService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { CheckCircle, XCircle, Clock, DollarSign, Calendar, Search, Filter } from 'lucide-react';

const STATUS_VARIANTS = { PENDING: 'warning', CONFIRMED: 'success', CANCELLED: 'danger', COMPLETED: 'info' };

export const BookingManagement = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await ownerService.getMyBookings();
      if (res.success) setBookings(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleStatusUpdate = async (bookingId, status) => {
    setProcessing(true);
    try {
      await ownerService.updateBookingStatus(bookingId, status);
      showToast(`Booking ${status.toLowerCase()} successfully.`, 'success');
      setConfirmAction(null);
      fetchBookings();
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const filtered = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesSearch = search === '' || b.userId?.name?.toLowerCase().includes(search.toLowerCase()) || b.courtId?.courtName?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) return <Spinner fullScreen message="Loading bookings..." />;

  const totalRevenue = bookings.filter((b) => b.status === 'COMPLETED' || b.status === 'CONFIRMED').reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="qc-container">
      <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Booking Management</h1>
      <p style={{ marginBottom: '2rem' }}>View and manage all court bookings across your facilities</p>

      {/* Stats Row */}
      <div className="qc-grid-4" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'var(--primary)' },
          { label: 'Pending', value: bookings.filter(b => b.status === 'PENDING').length, icon: Clock, color: '#f59e0b' },
          { label: 'Confirmed', value: bookings.filter(b => b.status === 'CONFIRMED').length, icon: CheckCircle, color: '#10b981' },
          { label: 'Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'var(--primary)' },
        ].map((stat, i) => (
          <div key={i} className="qc-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                <stat.icon size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="qc-input" placeholder="Search by user or court..." style={{ paddingLeft: '2.2rem' }} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((s) => (
            <button key={s} type="button" onClick={() => setStatusFilter(s)}
              className={`qc-btn qc-btn-sm ${statusFilter === s ? 'qc-btn-primary' : 'qc-btn-outline'}`}>
              {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No Bookings Found" description="Bookings will appear here once users book your courts." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((b) => (
            <div key={b._id} className="qc-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', cursor: 'pointer' }} onClick={() => setSelectedBooking(b)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
                  {(b.userId?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{b.userId?.name || 'Unknown User'}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{b.courtId?.courtName} · {formatDate(b.bookingDate)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(b.totalAmount)}</span>
                <Badge variant={STATUS_VARIANTS[b.status] || 'secondary'}>{b.status}</Badge>
                {b.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="primary" icon={CheckCircle} onClick={() => setConfirmAction({ id: b._id, status: 'CONFIRMED', name: b.userId?.name })}>Confirm</Button>
                    <Button size="sm" variant="danger" icon={XCircle} onClick={() => setConfirmAction({ id: b._id, status: 'CANCELLED', name: b.userId?.name })}>Cancel</Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="Booking Details">
        {selectedBooking && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                ['User', selectedBooking.userId?.name],
                ['Email', selectedBooking.userId?.email],
                ['Court', selectedBooking.courtId?.courtName],
                ['Date', formatDate(selectedBooking.bookingDate)],
                ['Slots', selectedBooking.slots?.join(', ')],
                ['Duration', `${selectedBooking.totalHours} hours`],
                ['Total', formatCurrency(selectedBooking.totalAmount)],
                ['Status', <Badge variant={STATUS_VARIANTS[selectedBooking.status]}>{selectedBooking.status}</Badge>],
                ['Booked On', formatDate(selectedBooking.createdAt)],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
            <Button variant="secondary" onClick={() => setSelectedBooking(null)} style={{ width: '100%' }}>Close</Button>
          </div>
        )}
      </Modal>

      {/* Confirm Action Modal */}
      <Modal isOpen={!!confirmAction} onClose={() => setConfirmAction(null)} title={`${confirmAction?.status === 'CONFIRMED' ? 'Confirm' : 'Cancel'} Booking`}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {confirmAction?.status === 'CONFIRMED'
            ? `Confirm the booking for ${confirmAction?.name}?`
            : `Cancel the booking for ${confirmAction?.name}? The user will be notified.`}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setConfirmAction(null)} disabled={processing}>Back</Button>
          <Button variant={confirmAction?.status === 'CONFIRMED' ? 'primary' : 'danger'} loading={processing} onClick={() => handleStatusUpdate(confirmAction.id, confirmAction.status)}>
            {confirmAction?.status === 'CONFIRMED' ? 'Confirm' : 'Cancel Booking'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default BookingManagement;
