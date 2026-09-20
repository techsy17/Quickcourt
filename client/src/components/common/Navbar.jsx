import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ROLES from '../../constants/roles';
import {
  Menu,
  X,
  Trophy,
  Calendar,
  LayoutDashboard,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Building,
  Clock,
  Layers,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  return (
    <nav className="qc-navbar">
      <div className="qc-container qc-nav-container">
        {/* Brand Logo */}
        <Link to="/" className="qc-brand" onClick={() => setMobileOpen(false)}>
          <div className="qc-brand-badge">
            <Trophy size={20} />
          </div>
          <span>Quick<span style={{ color: 'var(--primary)' }}>Court</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="qc-nav-links">
          {/* User & Guest Links */}
          {(!role || role === ROLES.USER) && (
            <>
              <li>
                <NavLink to="/" className={({ isActive }) => `qc-nav-link ${isActive ? 'active' : ''}`}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/venues" className={({ isActive }) => `qc-nav-link ${isActive ? 'active' : ''}`}>
                  Venues
                </NavLink>
              </li>
              {isAuthenticated && (
                <li>
                  <NavLink to="/my-bookings" className={({ isActive }) => `qc-nav-link ${isActive ? 'active' : ''}`}>
                    <Calendar size={16} /> My Bookings
                  </NavLink>
                </li>
              )}
            </>
          )}

          {/* Facility Owner Links */}
          {role === ROLES.FACILITY_OWNER && (
            <>
              <li>
                <NavLink to="/owner/dashboard" className={({ isActive }) => `qc-nav-link ${isActive ? 'active' : ''}`}>
                  <LayoutDashboard size={16} /> Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/owner/facility" className={({ isActive }) => `qc-nav-link ${isActive ? 'active' : ''}`}>
                  <Building size={16} /> My Facility
                </NavLink>
              </li>
              <li>
                <NavLink to="/owner/courts" className={({ isActive }) => `qc-nav-link ${isActive ? 'active' : ''}`}>
                  <Layers size={16} /> Courts
                </NavLink>
              </li>
              <li>
                <NavLink to="/owner/time-slots" className={({ isActive }) => `qc-nav-link ${isActive ? 'active' : ''}`}>
                  <Clock size={16} /> Time Slots
                </NavLink>
              </li>
              <li>
                <NavLink to="/owner/bookings" className={({ isActive }) => `qc-nav-link ${isActive ? 'active' : ''}`}>
                  <Calendar size={16} /> Bookings
                </NavLink>
              </li>
            </>
          )}

          {/* Admin Links */}
          {role === ROLES.ADMIN && (
            <>
              <li>
                <NavLink to="/admin/dashboard" className={({ isActive }) => `qc-nav-link ${isActive ? 'active' : ''}`}>
                  <LayoutDashboard size={16} /> Overview
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/facilities" className={({ isActive }) => `qc-nav-link ${isActive ? 'active' : ''}`}>
                  <ShieldCheck size={16} /> Approvals
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/users" className={({ isActive }) => `qc-nav-link ${isActive ? 'active' : ''}`}>
                  <UserIcon size={16} /> Users
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/reports" className={({ isActive }) => `qc-nav-link ${isActive ? 'active' : ''}`}>
                  Reports
                </NavLink>
              </li>
            </>
          )}
        </ul>

        {/* Right Nav Actions */}
        <div className="qc-nav-actions">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to={role === ROLES.ADMIN ? '/admin/profile' : role === ROLES.FACILITY_OWNER ? '/owner/profile' : '/profile'}
                className="qc-user-profile-btn"
                title="View Profile"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user?.name}
                  className="qc-avatar-img"
                />
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: '1.2' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                    {user?.name?.split(' ')[0]}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {role === ROLES.FACILITY_OWNER ? 'Owner' : role === ROLES.ADMIN ? 'Admin' : 'Player'}
                  </span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="qc-btn qc-btn-outline qc-btn-sm"
                title="Log Out"
                style={{ padding: '0.45rem', borderRadius: '50%' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="qc-btn qc-btn-outline qc-btn-sm">
                Log In
              </Link>
              <Link to="/signup" className="qc-btn qc-btn-primary qc-btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Hamburger Mobile Button */}
          <button
            className="qc-hamburger-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="qc-drawer-backdrop" onClick={() => setMobileOpen(false)} />
      )}
      <div className={`qc-mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" className="qc-brand" onClick={() => setMobileOpen(false)}>
            <div className="qc-brand-badge">
              <Trophy size={18} />
            </div>
            <span>QuickCourt</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
          {(!role || role === ROLES.USER) && (
            <>
              <li>
                <NavLink to="/" onClick={() => setMobileOpen(false)} className="qc-nav-link">
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/venues" onClick={() => setMobileOpen(false)} className="qc-nav-link">
                  Browse Venues
                </NavLink>
              </li>
              {isAuthenticated && (
                <li>
                  <NavLink to="/my-bookings" onClick={() => setMobileOpen(false)} className="qc-nav-link">
                    My Bookings
                  </NavLink>
                </li>
              )}
            </>
          )}

          {role === ROLES.FACILITY_OWNER && (
            <>
              <li>
                <NavLink to="/owner/dashboard" onClick={() => setMobileOpen(false)} className="qc-nav-link">
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/owner/facility" onClick={() => setMobileOpen(false)} className="qc-nav-link">
                  My Facility
                </NavLink>
              </li>
              <li>
                <NavLink to="/owner/courts" onClick={() => setMobileOpen(false)} className="qc-nav-link">
                  Courts
                </NavLink>
              </li>
              <li>
                <NavLink to="/owner/time-slots" onClick={() => setMobileOpen(false)} className="qc-nav-link">
                  Time Slots
                </NavLink>
              </li>
              <li>
                <NavLink to="/owner/bookings" onClick={() => setMobileOpen(false)} className="qc-nav-link">
                  Bookings
                </NavLink>
              </li>
            </>
          )}

          {role === ROLES.ADMIN && (
            <>
              <li>
                <NavLink to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="qc-nav-link">
                  Overview
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/facilities" onClick={() => setMobileOpen(false)} className="qc-nav-link">
                  Approvals
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/users" onClick={() => setMobileOpen(false)} className="qc-nav-link">
                  Users
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/reports" onClick={() => setMobileOpen(false)} className="qc-nav-link">
                  Reports
                </NavLink>
              </li>
            </>
          )}

          {isAuthenticated ? (
            <>
              <li style={{ borderTop: '1px solid var(--border-default)', paddingTop: '1rem' }}>
                <NavLink
                  to={role === ROLES.ADMIN ? '/admin/profile' : role === ROLES.FACILITY_OWNER ? '/owner/profile' : '/profile'}
                  onClick={() => setMobileOpen(false)}
                  className="qc-nav-link"
                >
                  My Profile
                </NavLink>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={16} /> Log Out
                </button>
              </li>
            </>
          ) : (
            <li style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="qc-btn qc-btn-outline">
                Log In
              </Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)} className="qc-btn qc-btn-primary">
                Sign Up
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
