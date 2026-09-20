import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import MyBookings from './MyBookings';
import { User, Mail, Phone, FileText, Check, Calendar } from 'lucide-react';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'bookings'
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qc-page-wrapper">
      <div className="qc-container">
        {/* Profile Card Header */}
        <div className="qc-card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.name}
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--primary)',
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <h1 style={{ fontSize: '1.8rem', margin: 0 }}>{user?.name}</h1>
                <span className="qc-badge qc-badge-success">{user?.role}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{user?.email}</p>
              {user?.bio && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>{user.bio}</p>}
            </div>
          </div>
        </div>

        {/* Profile Tabs: Details & My Bookings (strictly requested in Page 7) */}
        <div className="qc-tabs">
          <button
            type="button"
            className={`qc-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <User size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
            Edit Profile Details
          </button>
          <button
            type="button"
            className={`qc-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <Calendar size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
            My Bookings Tab
          </button>
        </div>

        {activeTab === 'details' ? (
          <div className="qc-card" style={{ maxWidth: '600px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Update Personal Information</h3>
            <form onSubmit={handleSubmit}>
              <Input
                label="Full Name"
                name="name"
                type="text"
                icon={User}
                value={formData.name}
                onChange={handleChange}
                required
              />

              <div className="qc-form-group">
                <label className="qc-label">Email Address (Read-only)</label>
                <input
                  type="email"
                  className="qc-input"
                  value={user?.email || ''}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>

              <Input
                label="Phone Number"
                name="phone"
                type="text"
                icon={Phone}
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
              />

              <div className="qc-form-group">
                <label className="qc-label">Player Bio</label>
                <textarea
                  className="qc-textarea"
                  name="bio"
                  rows="3"
                  placeholder="Tell other players about your favorite sports or skill level..."
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>

              <div className="qc-form-group">
                <label className="qc-label">Avatar Image URL</label>
                <input
                  type="url"
                  className="qc-input"
                  name="avatar"
                  placeholder="https://..."
                  value={formData.avatar}
                  onChange={handleChange}
                />
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="primary" loading={loading} icon={Check}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <MyBookings />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
