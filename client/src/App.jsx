import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import MainLayout from './layouts/MainLayout';
import OwnerLayout from './layouts/OwnerLayout';
import AdminLayout from './layouts/AdminLayout';
import Spinner from './components/common/Spinner';

// ── Auth Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const OTPVerification = lazy(() => import('./pages/auth/OTPVerification'));

// ── User Pages
const Home = lazy(() => import('./pages/user/Home'));
const Venues = lazy(() => import('./pages/user/Venues'));
const VenueDetails = lazy(() => import('./pages/user/VenueDetails'));
const Booking = lazy(() => import('./pages/user/Booking'));
const MyBookings = lazy(() => import('./pages/user/MyBookings'));
const Profile = lazy(() => import('./pages/user/Profile'));

// ── Owner Pages
const OwnerDashboard = lazy(() => import('./pages/owner/OwnerDashboard'));
const FacilityManagement = lazy(() => import('./pages/owner/FacilityManagement'));
const CourtManagement = lazy(() => import('./pages/owner/CourtManagement'));
const BookingManagement = lazy(() => import('./pages/owner/BookingManagement'));

// ── Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const FacilityApprovals = lazy(() => import('./pages/admin/FacilityApprovals'));
const ReportsManagement = lazy(() => import('./pages/admin/ReportsManagement'));

const SuspenseFallback = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Spinner message="Loading page..." />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<SuspenseFallback />}>
            <Routes>
              {/* ── Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-otp" element={<OTPVerification />} />

              {/* ── Public User Routes (MainLayout) */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/venues" element={<Venues />} />
                <Route path="/venues/:facilityId" element={<VenueDetails />} />

                {/* Protected User Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/book/:courtId" element={<Booking />} />
                  <Route path="/my-bookings" element={<MyBookings />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
              </Route>

              {/* ── Owner Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<RoleRoute allowedRoles={['FACILITY_OWNER', 'ADMIN']} />}>
                  <Route element={<OwnerLayout />}>
                    <Route path="/owner" element={<Navigate to="/owner/dashboard" replace />} />
                    <Route path="/owner/dashboard" element={<OwnerDashboard />} />
                    <Route path="/owner/facilities" element={<FacilityManagement />} />
                    <Route path="/owner/facility" element={<FacilityManagement />} />
                    <Route path="/owner/courts" element={<CourtManagement />} />
                    <Route path="/owner/time-slots" element={<CourtManagement />} />
                    <Route path="/owner/bookings" element={<BookingManagement />} />
                    <Route path="/owner/profile" element={<Profile />} />
                  </Route>
                </Route>
              </Route>

              {/* ── Admin Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/facilities" element={<FacilityApprovals />} />
                    <Route path="/admin/reports" element={<ReportsManagement />} />
                    <Route path="/admin/profile" element={<Profile />} />
                  </Route>
                </Route>
              </Route>

              {/* ── Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
