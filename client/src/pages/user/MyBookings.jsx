import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, getStatusBadgeClass } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { Calendar, Clock, MapPin, XCircle, CheckCircle2, AlertCircle, Filter } from 'lucide-react';

export const MyBookings = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Cancel Modal state
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getUserBookings({
        status: statusFilter,
        date: dateFilter,
      });
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, dateFilter]);

  const handleCancelClick = (booking) => {
    setCancellingBooking(booking);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setSubmittingCancel(true);
    try {
      await bookingService.cancelBooking(cancellingBooking._id);
      showToast('Booking has been cancelled successfully.', 'success');
      setCancellingBooking(null);
      fetchBookings();
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    } finally {
      setSubmittingCancel(false);
    }
  };

  const isFutureBooking = (booking) => {
    const today = new Date().toISOString().split('T')[0];
    const nowHour = new Date().getHours();
    const slotStartHour = parseInt(booking.timeSlot?.startTime?.split(':')[0] || '0', 10);

    return booking.date > today || (booking.date === today && nowHour < slotStartHour);
  };

  return (
    <div className="qc-page-wrapper">
      <div className="qc-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>My Court Bookings</h1>
            <p style={{ fontSize: '0.95rem' }}>Review upcoming match schedules, past bookings, and cancellations</p>
          </div>
          <Link to="/venues" className="qc-btn qc-btn-primary qc-btn-sm">
            Book Another Court
          </Link>
        </div>

        {/* Optional Filters Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.75rem',
            background: 'var(--bg-card)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            <Filter size={16} color="var(--primary)" />
            <span>Filter By:</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`qc-btn qc-btn-sm ${statusFilter === s ? 'qc-btn-primary' : 'qc-btn-outline'}`}
                style={{ fontSize: '0.8rem', textTransform: 'capitalize' }}
              >
                {s === 'ALL' ? 'All Bookings' : s.toLowerCase()}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Date:</span>
            <input
              type="date"
              className="qc-input"
              style={{ width: 'auto', padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                className="qc-btn qc-btn-outline qc-btn-sm"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <Spinner message="Loading your bookings..." />
        ) : bookings.length === 0 ? (
          <EmptyState
            title="No bookings found"
            description="You have not booked any courts yet or no records match your filter."
            actionLabel="Explore Venues"
            onAction={() => (window.location.href = '/venues')}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {bookings.map((booking) => {
              const canCancel = booking.status === 'CONFIRMED' && isFutureBooking(booking);

              return (
                <div
                  key={booking._id}
                  className="qc-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                    padding: '1.5rem',
                  }}
                >
                  {/* Left: Venue & Court details */}
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flex: 1, minWidth: '280px' }}>
                    <img
                      src={
                        booking.facility?.photos?.[0] ||
                        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300'
                      }
                      alt={booking.facility?.name}
                      style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: 'var(--radius-md)',
                        objectFit: 'cover',
                      }}
                    />

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
                          {booking.facility?.name}
                        </h3>
                        <span className={`qc-badge ${getStatusBadgeClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                        Court: {booking.court?.courtName}
                        <span style={{ color: 'var(--primary)', marginLeft: '0.5rem', fontSize: '0.82rem' }}>
                          • {booking.court?.sportType || 'Sport'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        <MapPin size={13} color="var(--primary)" />
                        <span>{booking.facility?.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Date & Time */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      <Calendar size={16} color="var(--primary)" />
                      <span>{formatDate(booking.date)}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <Clock size={16} color="var(--accent)" />
                      <span>{booking.timeSlot?.startTime} - {booking.timeSlot?.endTime}</span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Paid: <strong style={{ color: '#fff' }}>{formatCurrency(booking.total)}</strong> ({booking.paymentSimulation?.method || 'Simulated'})
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div>
                    {canCancel ? (
                      <Button
                        variant="danger"
                        size="sm"
                        icon={XCircle}
                        onClick={() => handleCancelClick(booking)}
                      >
                        Cancel Booking
                      </Button>
                    ) : booking.status === 'CANCELLED' ? (
                      <span style={{ fontSize: '0.82rem', color: '#f87171' }}>
                        Cancelled on {booking.cancelledAt ? new Date(booking.cancelledAt).toLocaleDateString() : 'N/A'}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Booking Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Booking Cancellation */}
      {cancellingBooking && (
        <Modal
          isOpen={!!cancellingBooking}
          onClose={() => !submittingCancel && setCancellingBooking(null)}
          title="Cancel Booking Confirmation"
        >
          <div style={{ padding: '0.5rem 0' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.6' }}>
              Are you sure you want to cancel your upcoming court booking at{' '}
              <strong style={{ color: '#fff' }}>{cancellingBooking.facility?.name}</strong>?
            </p>
            <div style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              <div>Date: {formatDate(cancellingBooking.date)}</div>
              <div>Slot: {cancellingBooking.timeSlot?.startTime} - {cancellingBooking.timeSlot?.endTime}</div>
              <div>Court: {cancellingBooking.court?.courtName}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button
                variant="secondary"
                onClick={() => setCancellingBooking(null)}
                disabled={submittingCancel}
              >
                Keep Booking
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmCancel}
                loading={submittingCancel}
              >
                Yes, Cancel Booking
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyBookings;
