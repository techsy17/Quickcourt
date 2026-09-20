import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { LayoutDashboard, Building2, Layers, Clock, CalendarCheck, User } from 'lucide-react';

export const OwnerLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-default)', padding: '0.5rem 0' }}>
        <div className="qc-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <NavLink
                to="/owner/dashboard"
                className={({ isActive }) =>
                  `qc-btn qc-btn-sm ${isActive ? 'qc-btn-primary' : 'qc-btn-outline'}`
                }
              >
                <LayoutDashboard size={15} /> Dashboard
              </NavLink>
              <NavLink
                to="/owner/facility"
                className={({ isActive }) =>
                  `qc-btn qc-btn-sm ${isActive ? 'qc-btn-primary' : 'qc-btn-outline'}`
                }
              >
                <Building2 size={15} /> My Facility
              </NavLink>
              <NavLink
                to="/owner/courts"
                className={({ isActive }) =>
                  `qc-btn qc-btn-sm ${isActive ? 'qc-btn-primary' : 'qc-btn-outline'}`
                }
              >
                <Layers size={15} /> Courts
              </NavLink>
              <NavLink
                to="/owner/time-slots"
                className={({ isActive }) =>
                  `qc-btn qc-btn-sm ${isActive ? 'qc-btn-primary' : 'qc-btn-outline'}`
                }
              >
                <Clock size={15} /> Time Slots
              </NavLink>
              <NavLink
                to="/owner/bookings"
                className={({ isActive }) =>
                  `qc-btn qc-btn-sm ${isActive ? 'qc-btn-primary' : 'qc-btn-outline'}`
                }
              >
                <CalendarCheck size={15} /> Bookings
              </NavLink>
              <NavLink
                to="/owner/profile"
                className={({ isActive }) =>
                  `qc-btn qc-btn-sm ${isActive ? 'qc-btn-primary' : 'qc-btn-outline'}`
                }
              >
                <User size={15} /> Profile
              </NavLink>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', paddingLeft: '1rem' }}>
              Facility Management Portal
            </div>
          </div>
        </div>
      </div>
      <main style={{ flex: 1, padding: '2rem 0' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default OwnerLayout;
