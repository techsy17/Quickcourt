import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { LayoutDashboard, ShieldCheck, Users, Flag, User } from 'lucide-react';

export const AdminLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-default)', padding: '0.5rem 0' }}>
        <div className="qc-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `qc-btn qc-btn-sm ${isActive ? 'qc-btn-primary' : 'qc-btn-outline'}`
                }
              >
                <LayoutDashboard size={15} /> Dashboard
              </NavLink>
              <NavLink
                to="/admin/facilities"
                className={({ isActive }) =>
                  `qc-btn qc-btn-sm ${isActive ? 'qc-btn-primary' : 'qc-btn-outline'}`
                }
              >
                <ShieldCheck size={15} /> Facility Approvals
              </NavLink>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `qc-btn qc-btn-sm ${isActive ? 'qc-btn-primary' : 'qc-btn-outline'}`
                }
              >
                <Users size={15} /> User Management
              </NavLink>
              <NavLink
                to="/admin/reports"
                className={({ isActive }) =>
                  `qc-btn qc-btn-sm ${isActive ? 'qc-btn-primary' : 'qc-btn-outline'}`
                }
              >
                <Flag size={15} /> Reports & Moderation
              </NavLink>
              <NavLink
                to="/admin/profile"
                className={({ isActive }) =>
                  `qc-btn qc-btn-sm ${isActive ? 'qc-btn-primary' : 'qc-btn-outline'}`
                }
              >
                <User size={15} /> Profile
              </NavLink>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600, whiteSpace: 'nowrap', paddingLeft: '1rem' }}>
              Admin Control Panel
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

export default AdminLayout;
