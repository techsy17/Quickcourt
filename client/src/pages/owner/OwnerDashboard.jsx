import React, { useState, useEffect } from 'react';
import bookingService from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, getStatusBadgeClass } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import Spinner from '../../components/common/Spinner';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import DoughnutChart from '../../components/charts/DoughnutChart';
import HeatmapChart from '../../components/charts/HeatmapChart';
import {
  CalendarCheck,
  Layers,
  IndianRupee,
  TrendingUp,
  Clock,
  PieChart,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const OwnerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trendView, setTrendView] = useState('LINE'); // 'LINE' | 'BAR'

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await bookingService.getOwnerDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching owner dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <Spinner fullScreen message="Compiling arena analytics and KPIs..." />;
  }

  const kpis = data?.kpis || { totalBookings: 0, activeCourts: 0, simulatedEarnings: 0 };
  const charts = data?.charts || {};
  const upcomingBookings = data?.upcomingBookings || [];

  return (
    <div className="qc-container">
      {/* 1. Welcome Message */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
          <Sparkles size={16} /> Facility Management Hub
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>
          Welcome back, {user?.name || 'Partner'}!
        </h1>
        <p style={{ fontSize: '0.95rem' }}>
          Here is your sports arena performance, active court capacity, and revenue summary.
        </p>
      </div>

      {/* 2. KPIs Row */}
      <div className="qc-grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="qc-kpi-card">
          <div>
            <span className="qc-kpi-label">Total Bookings</span>
            <div className="qc-kpi-val">{kpis.totalBookings}</div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Confirmed & completed matches</span>
          </div>
          <div className="qc-kpi-icon-wrapper" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <CalendarCheck size={28} />
          </div>
        </div>

        <div className="qc-kpi-card">
          <div>
            <span className="qc-kpi-label">Active Courts</span>
            <div className="qc-kpi-val">{kpis.activeCourts}</div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ready for athlete bookings</span>
          </div>
          <div className="qc-kpi-icon-wrapper" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
            <Layers size={28} />
          </div>
        </div>

        <div className="qc-kpi-card">
          <div>
            <span className="qc-kpi-label">Simulated Earnings</span>
            <div className="qc-kpi-val">{formatCurrency(kpis.simulatedEarnings)}</div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Gross booking platform volume</span>
          </div>
          <div className="qc-kpi-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <IndianRupee size={28} />
          </div>
        </div>
      </div>

      {/* 3. Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Daily/Weekly Trends Chart */}
        <div className="qc-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>Booking Trends</h3>
              <p style={{ fontSize: '0.85rem' }}>Daily booking volume over the last 7 days</p>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                className={`qc-btn qc-btn-sm ${trendView === 'LINE' ? 'qc-btn-primary' : 'qc-btn-outline'}`}
                onClick={() => setTrendView('LINE')}
              >
                Line
              </button>
              <button
                type="button"
                className={`qc-btn qc-btn-sm ${trendView === 'BAR' ? 'qc-btn-primary' : 'qc-btn-outline'}`}
                onClick={() => setTrendView('BAR')}
              >
                Bar
              </button>
            </div>
          </div>

          {trendView === 'LINE' ? (
            <LineChart data={charts.dailyTrends || []} height={230} color="#10b981" />
          ) : (
            <BarChart data={charts.dailyTrends || []} height={230} color="#06b6d4" />
          )}
        </div>

        {/* Earnings Summary by Sport (Bar or Doughnut Chart) */}
        <div className="qc-card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>Earnings Summary</h3>
            <p style={{ fontSize: '0.85rem' }}>Revenue distribution by sport category</p>
          </div>

          <DoughnutChart data={charts.earningsSummary || []} height={230} />
        </div>
      </div>

      {/* 4. Peak Booking Hours Heatmap */}
      <div className="qc-card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Clock size={18} color="var(--primary)" />
          <div>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Peak Booking Hours Heatmap</h3>
            <p style={{ fontSize: '0.85rem' }}>Visual hourly breakdown of court reservations (06:00 to 22:00)</p>
          </div>
        </div>

        <HeatmapChart data={charts.peakHours || []} />
      </div>

      {/* 5. Booking Calendar / Recent Reservations Table */}
      <div className="qc-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Recent & Upcoming Bookings</h3>
          </div>
        </div>

        {upcomingBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No upcoming bookings found on your courts.
          </div>
        ) : (
          <div className="qc-table-wrapper">
            <table className="qc-table">
              <thead>
                <tr>
                  <th>Player Name</th>
                  <th>Court</th>
                  <th>Date</th>
                  <th>Slot Time</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {upcomingBookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <strong style={{ color: '#fff' }}>{b.user?.name || 'Athlete'}</strong>
                    </td>
                    <td>{b.court?.courtName}</td>
                    <td>{formatDate(b.date)}</td>
                    <td>{b.timeSlot?.startTime} - {b.timeSlot?.endTime}</td>
                    <td>
                      <span className={`qc-badge ${getStatusBadgeClass(b.status)}`}>
                        {b.status === 'CONFIRMED' ? 'Booked' : b.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--primary)', fontWeight: 700 }}>
                      {formatCurrency(b.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
