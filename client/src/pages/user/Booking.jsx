import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import venueService from '../../services/venueService';
import courtService from '../../services/courtService';
import bookingService from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import SlotSelector from '../../components/booking/SlotSelector';
import PriceBreakdown from '../../components/booking/PriceBreakdown';
import SimulatedPaymentModal from '../../components/booking/SimulatedPaymentModal';
import Spinner from '../../components/common/Spinner';
import { ChevronLeft, ShieldCheck } from 'lucide-react';

export const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [facility, setFacility] = useState(null);
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [loadingVenue, setLoadingVenue] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // 1. Fetch Venue & Courts
  useEffect(() => {
    const loadVenueAndCourts = async () => {
      try {
        const res = await venueService.getVenueById(id);
        if (res.success && res.data) {
          setFacility(res.data.facility);
          const activeCourts = res.data.courts || [];
          setCourts(activeCourts);
          if (activeCourts.length > 0) {
            setSelectedCourt(activeCourts[0]);
          }
        }
      } catch (err) {
        showToast(err.message || 'Failed to load venue for booking', 'error');
      } finally {
        setLoadingVenue(false);
      }
    };
    loadVenueAndCourts();
  }, [id]);

  // 2. Fetch Slots whenever selectedCourt or selectedDate changes
  useEffect(() => {
    if (!selectedCourt?._id || !selectedDate) return;

    const loadSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const res = await courtService.getTimeSlots(selectedCourt._id, selectedDate);
        if (res.success && res.data) {
          setSlots(res.data);
        }
      } catch (err) {
        showToast(err.message || 'Error fetching court slots', 'error');
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [selectedCourt?._id, selectedDate]);

  const handleProceed = () => {
    if (!isAuthenticated) {
      showToast('Please login to proceed with booking.', 'info');
      navigate('/login', { state: { from: { pathname: `/venues/${id}/book` } } });
      return;
    }
    if (!selectedCourt || !selectedSlot || !selectedDate) {
      showToast('Please select a court and available time slot.', 'warning');
      return;
    }
    setPaymentModalOpen(true);
  };

  const handleConfirmSimulatedPayment = async (paymentMethod) => {
    try {
      const res = await bookingService.createBooking({
        courtId: selectedCourt._id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        paymentMethod: `Simulated ${paymentMethod}`,
      });

      if (res.success) {
        showToast('Booking successfully confirmed! Welcome to QuickCourt.', 'success');
        // Redirection to My Bookings as strictly required by prompt
        setTimeout(() => {
          navigate('/my-bookings');
        }, 1000);
      }
    } catch (err) {
      showToast(err.message || 'Failed to confirm booking.', 'error');
      throw err;
    }
  };

  if (loadingVenue) {
    return <Spinner fullScreen message="Loading booking interface..." />;
  }

  return (
    <div className="qc-page-wrapper">
      <div className="qc-container">
        {/* Back Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to={`/venues/${id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
            }}
          >
            <ChevronLeft size={16} /> Back to Venue Details
          </Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>
            Book Court at {facility?.name}
          </h1>
          <p style={{ fontSize: '0.95rem' }}>
            Choose your preferred court, date, and 1-hour time slot to secure your game.
          </p>
        </div>

        {/* Booking Form Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
          {/* Left Column: Court & Slot Selection */}
          <div className="qc-card">
            <SlotSelector
              courts={courts}
              selectedCourt={selectedCourt}
              onSelectCourt={(c) => setSelectedCourt(c)}
              selectedDate={selectedDate}
              onSelectDate={(d) => setSelectedDate(d)}
              slots={slots}
              selectedSlot={selectedSlot}
              onSelectSlot={(s) => setSelectedSlot(s)}
              loading={loadingSlots}
            />
          </div>

          {/* Right Column: Price Breakdown & Simulated Checkout Proceed */}
          <div>
            <PriceBreakdown
              venue={facility}
              court={selectedCourt}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              onProceed={handleProceed}
            />
          </div>
        </div>
      </div>

      {/* Simulated Payment Modal */}
      {selectedCourt && selectedSlot && (
        <SimulatedPaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          onConfirmBooking={handleConfirmSimulatedPayment}
          total={selectedCourt.pricingPerHour}
          courtName={selectedCourt.courtName}
          slotTime={`${selectedSlot.startTime} - ${selectedSlot.endTime}`}
          date={selectedDate}
        />
      )}
    </div>
  );
};

export default Booking;
