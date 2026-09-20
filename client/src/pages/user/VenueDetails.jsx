import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import venueService from '../../services/venueService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import {
  MapPin,
  Star,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  MessageSquare,
  Clock,
  Sparkles,
} from 'lucide-react';

export const VenueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchVenue = async () => {
    try {
      const res = await venueService.getVenueById(id);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load venue details:', err);
      showToast(err.message || 'Venue not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenue();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to write a review.', 'info');
      navigate('/login');
      return;
    }
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      await venueService.addReview(id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      showToast('Thank you! Your review has been published.', 'success');
      setReviewComment('');
      fetchVenue();
    } catch (err) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <Spinner fullScreen message="Loading facility details..." />;
  }

  if (!data || !data.facility) {
    return (
      <div className="qc-page-wrapper" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>Venue Not Found</h2>
        <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          The requested sports arena could not be found or is pending administrative approval.
        </p>
        <Link to="/venues" className="qc-btn qc-btn-primary">
          Back to Venues
        </Link>
      </div>
    );
  }

  const { facility, courts = [], reviews = [] } = data;
  const photos = facility.photos?.length > 0 ? facility.photos : [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&auto=format&fit=crop&q=80'
  ];

  return (
    <div className="qc-page-wrapper">
      <div className="qc-container">
        {/* Top Header & Actions */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className="qc-badge qc-badge-success">{facility.venueType} Facility</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fbbf24', fontSize: '0.9rem', fontWeight: 700 }}>
                <Star size={16} fill="#fbbf24" stroke="#fbbf24" />
                <span>{facility.rating || 4.8}</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({facility.reviewCount || reviews.length} reviews)</span>
              </div>
            </div>

            <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>{facility.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <MapPin size={16} color="var(--primary)" />
              <span>{facility.address || facility.location}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pricing starts from</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                {formatCurrency(facility.startingPrice)} <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-secondary)' }}>/ hour</span>
              </div>
            </div>

            {/* ACTION: Book Now button */}
            <Link to={`/venues/${facility._id}/book`} className="qc-btn qc-btn-primary qc-btn-lg">
              Book Now <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* 1. Photo Gallery */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              width: '100%',
              height: '420px',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-card)',
              position: 'relative',
              marginBottom: '1rem',
              border: '1px solid var(--border-default)',
            }}
          >
            <img
              src={photos[activePhotoIdx]}
              alt={facility.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {photos.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {photos.map((photo, idx) => (
                <img
                  key={idx}
                  src={photo}
                  alt={`Thumbnail ${idx + 1}`}
                  onClick={() => setActivePhotoIdx(idx)}
                  style={{
                    width: '100px',
                    height: '68px',
                    borderRadius: 'var(--radius-md)',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: `2px solid ${activePhotoIdx === idx ? 'var(--primary)' : 'var(--border-default)'}`,
                    opacity: activePhotoIdx === idx ? 1 : 0.6,
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Two Column Layout: Details & Booking Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Main Content Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Description & About Venue */}
            <div className="qc-card">
              <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>About This Venue</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {facility.aboutVenue || facility.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={16} color="var(--primary)" />
                  <span>Operating Hours: {facility.operatingHours?.open || '06:00'} - {facility.operatingHours?.close || '23:00'}</span>
                </div>
              </div>
            </div>

            {/* List of Sports Available */}
            <div className="qc-card">
              <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>Sports Available</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {facility.sportsSupported?.map((sport, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 600,
                      color: '#fff',
                    }}
                  >
                    <Sparkles size={16} color="var(--primary)" />
                    <span>{sport}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="qc-card">
              <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>Venue Amenities</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.85rem' }}>
                {facility.amenities?.map((amenity, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      color: 'var(--text-secondary)',
                      fontSize: '0.92rem',
                    }}
                  >
                    <CheckCircle2 size={16} color="var(--primary)" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Courts Summary */}
            <div className="qc-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.35rem' }}>Courts & Playing Surfaces ({courts.length})</h3>
                <Link to={`/venues/${facility._id}/book`} className="qc-btn qc-btn-outline qc-btn-sm">
                  View Availability Schedule
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {courts.map((court) => (
                  <div
                    key={court._id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <strong style={{ color: '#fff', fontSize: '1rem' }}>{court.courtName}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {court.sportType} • {court.surfaceType || 'Standard Surface'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>
                        {formatCurrency(court.pricingPerHour)} / hr
                      </span>
                      <Link to={`/venues/${facility._id}/book`} className="qc-btn qc-btn-primary qc-btn-sm">
                        Select Slot
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="qc-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.35rem' }}>
                  Player Reviews ({reviews.length})
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fbbf24', fontWeight: 700 }}>
                  <Star size={18} fill="#fbbf24" stroke="#fbbf24" />
                  <span>{facility.rating || 4.8} / 5.0</span>
                </div>
              </div>

              {/* Review Input Box */}
              <form onSubmit={handleReviewSubmit} style={{ marginBottom: '2rem', background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Leave a Review</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Rating:</span>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        cursor="pointer"
                        fill={star <= reviewRating ? '#fbbf24' : 'none'}
                        stroke="#fbbf24"
                        onClick={() => setReviewRating(star)}
                      />
                    ))}
                  </div>
                </div>

                <textarea
                  className="qc-textarea"
                  rows="3"
                  placeholder="Share your experience about court surface, lighting, locker rooms, or staff..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                />

                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit" variant="primary" size="sm" loading={submittingReview}>
                    Post Review
                  </Button>
                </div>
              </form>

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                  No player reviews yet. Be the first to play and leave your feedback!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reviews.map((rev) => (
                    <div
                      key={rev._id}
                      style={{
                        paddingBottom: '1rem',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <img
                            src={rev.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={rev.user?.name}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <strong style={{ color: '#fff', fontSize: '0.95rem' }}>
                            {rev.user?.name || 'Verified Athlete'}
                          </strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#fbbf24' }}>
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={13} fill="#fbbf24" stroke="#fbbf24" />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', paddingLeft: '40px' }}>
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sticky Quick Booking Callout Sidebar */}
          <div>
            <div className="qc-card" style={{ position: 'sticky', top: '90px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Ready to Play?</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Select your preferred court, date, and 1-hour time slot with instant simulated payment confirmation.
              </p>

              <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Available Courts:</span>
                  <strong style={{ color: '#fff' }}>{courts.length} Courts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Hours:</span>
                  <span style={{ color: '#fff' }}>{facility.operatingHours?.open} - {facility.operatingHours?.close}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Starting Rate:</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatCurrency(facility.startingPrice)}/hr</span>
                </div>
              </div>

              {/* Primary CTA button */}
              <Link
                to={`/venues/${facility._id}/book`}
                className="qc-btn qc-btn-primary qc-btn-lg"
                style={{ width: '100%' }}
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetails;
