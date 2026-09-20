import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Shield, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="qc-footer">
      <div className="qc-container">
        <div className="qc-footer-grid">
          {/* Col 1: Brand info */}
          <div className="qc-footer-col">
            <div className="qc-brand" style={{ marginBottom: '1rem' }}>
              <div className="qc-brand-badge">
                <Trophy size={20} />
              </div>
              <span>Quick<span style={{ color: 'var(--primary)' }}>Court</span></span>
            </div>
            <p style={{ maxWidth: '320px', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              The modern sports facility booking platform connecting athletes with premium badminton courts, football turfs, box cricket arenas, and tennis centers.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <Shield size={14} color="var(--primary)" />
              <span>Simulated Instant Booking & Verification</span>
            </div>
          </div>

          {/* Col 2: Popular Sports */}
          <div className="qc-footer-col">
            <h4>Popular Sports</h4>
            <ul className="qc-footer-list">
              <li><Link to="/venues?sport=Badminton">Badminton Courts</Link></li>
              <li><Link to="/venues?sport=Turf Football">Turf Football</Link></li>
              <li><Link to="/venues?sport=Box Cricket">Box Cricket</Link></li>
              <li><Link to="/venues?sport=Tennis">Tennis Academies</Link></li>
              <li><Link to="/venues?sport=Table Tennis">Table Tennis</Link></li>
            </ul>
          </div>

          {/* Col 3: Navigation */}
          <div className="qc-footer-col">
            <h4>Explore</h4>
            <ul className="qc-footer-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/venues">All Venues</Link></li>
              <li><Link to="/login">Account Login</Link></li>
              <li><Link to="/signup">Register Facility</Link></li>
              <li><Link to="/my-bookings">My Bookings</Link></li>
            </ul>
          </div>

          {/* Col 4: Platform */}
          <div className="qc-footer-col">
            <h4>Platform</h4>
            <ul className="qc-footer-list">
              <li><span style={{ color: 'var(--text-secondary)' }}>MERN Full-Stack System</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Role-Based Access Control</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Automated Scheduling</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Maintenance Management</span></li>
            </ul>
          </div>
        </div>

        <div className="qc-footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} QuickCourt Inc. All rights reserved. Built with precision for local athletes and facility owners.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>Engineered with passion</span>
            <Heart size={14} color="#ef4444" fill="#ef4444" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
