import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import { Users, Building2, BookOpen, DollarSign, TrendingUp, Activity, AlertCircle, CheckSquare } from 'lucide-react';
import { BarChart, LineChart, DoughnutChart } from '../../components/charts';

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="qc-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <Icon size={18} color={color || 'var(--primary)'} />
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{value}</div>
    {sub && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub}</div>}
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminService.getStats();
        if (res.success) setStats(res.data);
      } catch (err) {
        console.error('Admin stats error', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Spinner fullScreen message="Loading admin dashboard..." />;

  const revenueData = stats?.revenueByMonth || [];
  const bookingsByStatus = stats?.bookingsByStatus || { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 };
  const topFacilities = stats?.topFacilities || [];

  return (
    <div className="qc-container">
      <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Admin Dashboard</h1>
      <p style={{ marginBottom: '2rem' }}>Platform-wide analytics and operational oversight</p>

      {/* Key Metrics */}
      <div className="qc-grid-4" style={{ marginBottom: '2rem' }}>
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers || 0} sub={`+${stats?.newUsersThisMonth || 0} this month`} color="var(--primary)" />
        <StatCard icon={Building2} label="Facilities" value={stats?.totalFacilities || 0} sub={`${stats?.pendingFacilities || 0} pending approval`} color="#8b5cf6" />
        <StatCard icon={BookOpen} label="Bookings" value={stats?.totalBookings || 0} sub={`${stats?.bookingsToday || 0} today`} color="#f59e0b" />
        <StatCard icon={DollarSign} label="Revenue" value={formatCurrency(stats?.totalRevenue || 0)} sub="All-time confirmed" color="#10b981" />
      </div>

      {/* Charts Row */}
      <div className="qc-grid-2" style={{ marginBottom: '2rem' }}>
        <div className="qc-card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--primary)" /> Revenue Trend
          </h3>
          {revenueData.length > 0 ? (
            <LineChart
              data={revenueData.map((r) => ({ label: r.month, value: r.revenue }))}
              label="Revenue (₹)"
            />
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No revenue data yet</div>
          )}
        </div>

        <div className="qc-card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="var(--primary)" /> Bookings by Status
          </h3>
          <DoughnutChart
            data={[
              { label: 'Pending', value: bookingsByStatus.PENDING || 0 },
              { label: 'Confirmed', value: bookingsByStatus.CONFIRMED || 0 },
              { label: 'Completed', value: bookingsByStatus.COMPLETED || 0 },
              { label: 'Cancelled', value: bookingsByStatus.CANCELLED || 0 },
            ]}
          />
        </div>
      </div>

      {/* Top Facilities + Recent Alerts */}
      <div className="qc-grid-2">
        <div className="qc-card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckSquare size={18} color="var(--primary)" /> Top Performing Facilities
          </h3>
          {topFacilities.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No facility data available</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topFacilities.slice(0, 5).map((f, i) => (
                <div key={f._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>{i + 1}</span>
                    <span style={{ fontWeight: 500 }}>{f.name}</span>
                  </div>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{formatCurrency(f.revenue || 0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="qc-card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} color="#f59e0b" /> System Overview
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Active Facility Owners', value: stats?.totalOwners || 0 },
              { label: 'Facilities Pending Review', value: stats?.pendingFacilities || 0, alert: (stats?.pendingFacilities || 0) > 0 },
              { label: 'Reports to Review', value: stats?.pendingReports || 0, alert: (stats?.pendingReports || 0) > 0 },
              { label: 'Active Courts', value: stats?.activeCourts || 0 },
              { label: 'Platform Conversion Rate', value: `${stats?.conversionRate || 0}%` },
            ].map(({ label, value, alert }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontWeight: 600, color: alert ? '#f59e0b' : '#fff' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
