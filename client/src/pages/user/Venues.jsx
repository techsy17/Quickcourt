import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import venueService from '../../services/venueService';
import SPORTS, { VENUE_TYPES } from '../../constants/sports';
import { formatCurrency } from '../../utils/formatters';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { Search, MapPin, Star, Filter, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';

export const Venues = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sport, setSport] = useState(searchParams.get('sport') || 'All');
  const [venueType, setVenueType] = useState(searchParams.get('venueType') || 'All');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const res = await venueService.getVenues({
        search: searchParams.get('search') || '',
        sport: searchParams.get('sport') || 'All',
        venueType: searchParams.get('venueType') || 'All',
        maxPrice: searchParams.get('maxPrice') || '',
        minRating: searchParams.get('minRating') || '',
        page: currentPage,
        limit: 6,
      });

      if (res.success && res.data) {
        setVenues(res.data.facilities || []);
        setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Error fetching venues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (sport && sport !== 'All') params.set('sport', sport);
    if (venueType && venueType !== 'All') params.set('venueType', venueType);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (minRating) params.set('minRating', minRating);
    params.set('page', '1');
    setSearchParams(params);
    setMobileFilterOpen(false);
  };

  const clearFilters = () => {
    setSearch('');
    setSport('All');
    setVenueType('All');
    setMaxPrice('');
    setMinRating('');
    setSearchParams({});
    setMobileFilterOpen(false);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="qc-page-wrapper">
      <div className="qc-container">
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Approved Sports Venues</h1>
          <p style={{ fontSize: '0.95rem' }}>
            Browse and book certified badminton courts, football turfs, cricket arenas, and tennis grounds
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <div style={{ display: 'none', marginBottom: '1rem' }} className="mobile-filter-trigger">
          <button
            className="qc-btn qc-btn-outline"
            style={{ width: '100%' }}
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          >
            <SlidersHorizontal size={16} /> Filter Venues ({pagination.total} Available)
          </button>
        </div>

        {/* Main Grid: Sidebar Filters + Venue Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }}>
          {/* Sidebar Filter Component */}
          <aside
            className="qc-card"
            style={{
              height: 'fit-content',
              position: 'sticky',
              top: '90px',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <Filter size={18} color="var(--primary)" />
                <span>Filters</span>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Reset All
              </button>
            </div>

            {/* 1. Search Query */}
            <div className="qc-form-group">
              <label className="qc-label">Search Venue / Location</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="qc-input"
                  style={{ paddingLeft: '32px' }}
                  placeholder="e.g. Apex, Indiranagar"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                />
              </div>
            </div>

            {/* 2. Sport Type Filter */}
            <div className="qc-form-group">
              <label className="qc-label">Sport Type</label>
              <select className="qc-select" value={sport} onChange={(e) => setSport(e.target.value)}>
                <option value="All">All Sports</option>
                {SPORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Venue Type Filter */}
            <div className="qc-form-group">
              <label className="qc-label">Venue Environment</label>
              <select className="qc-select" value={venueType} onChange={(e) => setVenueType(e.target.value)}>
                {VENUE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t === 'All' ? 'All Environments' : t}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Maximum Starting Price */}
            <div className="qc-form-group">
              <label className="qc-label">Max Price / Hour (₹)</label>
              <input
                type="number"
                className="qc-input"
                placeholder="e.g. 1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            {/* 5. Rating Filter */}
            <div className="qc-form-group">
              <label className="qc-label">Minimum Rating</label>
              <select className="qc-select" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
              </select>
            </div>

            <button
              type="button"
              className="qc-btn qc-btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              onClick={applyFilters}
            >
              Apply Filters
            </button>
          </aside>

          {/* Venues Listing & Pagination */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Showing <strong>{venues.length}</strong> of <strong>{pagination.total}</strong> approved venues
              </span>
            </div>

            {loading ? (
              <Spinner message="Searching sports facilities..." />
            ) : venues.length === 0 ? (
              <EmptyState
                title="No sports venues found"
                description="Try broadening your search term, adjusting price filters, or clearing active filters."
                actionLabel="Reset Filters"
                onAction={clearFilters}
              />
            ) : (
              <>
                <div className="qc-grid-3">
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
                          <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>({venue.reviewCount || 0})</span>
                        </div>
                      </div>

                      <div className="qc-venue-card-body">
                        <h3 className="qc-venue-title">{venue.name}</h3>
                        <div className="qc-venue-location">
                          <MapPin size={14} color="var(--primary)" />
                          <span>{venue.location}</span>
                        </div>

                        <div className="qc-sports-tags">
                          {venue.sportsSupported?.map((s, idx) => (
                            <span key={idx} className="qc-sport-pill">
                              {s}
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
                          View & Book
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
                    <button
                      className="qc-btn qc-btn-outline qc-btn-sm"
                      disabled={pagination.page <= 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>

                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', padding: '0 0.75rem' }}>
                      Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <button
                      className="qc-btn qc-btn-outline qc-btn-sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Venues;
