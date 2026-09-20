import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import venueService from '../../services/venueService';
import SPORTS from '../../constants/sports';
import { formatCurrency } from '../../utils/formatters';
import Spinner from '../../components/common/Spinner';
import {
  Search,
  MapPin,
  Star,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Zap,
  ChevronRight,
} from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPopularVenues = async () => {
      try {
        const res = await venueService.getVenues({ limit: 4 });
        if (res.success && res.data?.facilities) {
          setVenues(res.data.facilities);
        }
      } catch (err) {
        console.error('Failed to load home venues:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPopularVenues();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/venues?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/venues');
    }
  };

  return (
    <div className="qc-page-wrapper" style={{ paddingTop: 0 }}>
      {/* 1. Welcome Banner / Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '4.5rem 0 3.5rem',
          background: 'linear-gradient(180deg, #101B30 0%, #0A0F1D 100%)',
          borderBottom: '1px solid var(--border-default)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            right: '5%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(10, 15, 29, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="qc-container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '1.25rem',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              <Zap size={15} /> Instant Local Sports Court Bookings
            </div>

            <h1
              style={{
                fontSize: '3rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                marginBottom: '1.25rem',
                lineHeight: 1.15,
              }}
            >
              Find & Book Top Sports Arenas in Your Area
            </h1>

            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
              Badminton courts, football turfs, cricket boxes, and tennis clubs. Instant real-time slot selection and booking confirmation.
            </p>

            {/* Hero Search Bar */}
            <form onSubmit={handleSearchSubmit} style={{ maxWidth: '640px', margin: '0 auto' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.4rem 0.6rem 0.4rem 1.25rem',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
                }}
              >
                <Search size={20} color="var(--primary)" style={{ flexShrink: 0, marginRight: '0.75rem' }} />
                <input
                  type="text"
                  placeholder="Search arena name, locality, or sport (e.g. Indiranagar, Badminton)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.98rem',
                  }}
                />
                <button
                  type="submit"
                  className="qc-btn qc-btn-primary"
                  style={{ borderRadius: 'var(--radius-full)', padding: '0.65rem 1.5rem' }}
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. Quick Access to Popular Sports */}
      <section style={{ padding: '3.5rem 0 2rem' }}>
        <div className="qc-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem' }}>Popular Sports</h2>
              <p style={{ fontSize: '0.9rem' }}>Choose your sport to browse available courts and venues</p>
            </div>
            <Link to="/venues" className="qc-btn qc-btn-outline qc-btn-sm">
              All Sports <ChevronRight size={16} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '1rem',
            }}
          >
            {SPORTS.map((sport) => (
              <Link
                key={sport.id}
                to={`/venues?sport=${encodeURIComponent(sport.id)}`}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.65rem',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = sport.color;
                  e.currentTarget.style.boxShadow = `0 8px 20px rgba(0,0,0,0.4)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontSize: '2.4rem' }}>{sport.icon}</span>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{sport.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Explore Arenas</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Quick Access to Popular Venues */}
      <section style={{ padding: '2.5rem 0 4rem' }}>
        <div className="qc-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem' }}>Popular Sports Venues</h2>
              <p style={{ fontSize: '0.9rem' }}>Verified and highest-rated athletic facilities in the city</p>
            </div>
            <Link to="/venues" className="qc-btn qc-btn-primary qc-btn-sm">
              View All Venues <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <Spinner message="Loading popular sports venues..." />
          ) : venues.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              No approved venues currently listed.
            </div>
          ) : (
            <div className="qc-grid-4">
              {venues.map((venue) => (
                <div key={venue._id} className="qc-venue-card">
                  <div className="qc-venue-card-img-wrapper">
                    <img
                      src={
                        venue.photos?.[0] ||
                        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={venue.name}
                      className="qc-venue-card-img"
                    />
                    <div className="qc-venue-card-badge">{venue.venueType}</div>
                    <div className="qc-venue-card-rating">
                      <Star size={13} fill="#fbbf24" stroke="#fbbf24" />
                      <span>{venue.rating || 4.8}</span>
                    </div>
                  </div>

                  <div className="qc-venue-card-body">
                    <h3 className="qc-venue-title">{venue.name}</h3>
                    <div className="qc-venue-location">
                      <MapPin size={14} color="var(--primary)" />
                      <span>{venue.location}</span>
                    </div>

                    <div className="qc-sports-tags">
                      {venue.sportsSupported?.map((sport, idx) => (
                        <span key={idx} className="qc-sport-pill">
                          {sport}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="qc-venue-card-footer">
                    <div className="qc-price-tag">
                      <span className="qc-price-label">Starts at</span>
                      <span className="qc-price-amount">{formatCurrency(venue.startingPrice)}/hr</span>
                    </div>
                    <Link to={`/venues/${venue._id}`} className="qc-btn qc-btn-primary qc-btn-sm">
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Feature Trust Badges */}
      <section style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-default)', padding: '3rem 0' }}>
        <div className="qc-container">
          <div className="qc-grid-3" style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Calendar size={24} />
              </div>
              <h4 style={{ fontSize: '1.1rem' }}>Instant Slot Confirmation</h4>
              <p style={{ fontSize: '0.88rem' }}>Check live court availability and book your favorite 1-hour slots in seconds.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <ShieldCheck size={24} />
              </div>
              <h4 style={{ fontSize: '1.1rem' }}>Admin-Approved Venues</h4>
              <p style={{ fontSize: '0.88rem' }}>Every listed sports ground is inspected and approved by platform administrators.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Zap size={24} />
              </div>
              <h4 style={{ fontSize: '1.1rem' }}>Owner Court Controls</h4>
              <p style={{ fontSize: '0.88rem' }}>Facility owners can block slots for maintenance and track bookings with visual charts.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
