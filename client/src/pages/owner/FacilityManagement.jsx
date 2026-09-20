import React, { useState, useEffect } from 'react';
import ownerService from '../../services/ownerService';
import { useToast } from '../../context/ToastContext';
import SPORTS, { DEFAULT_AMENITIES, VENUE_TYPES } from '../../constants/sports';
import { getStatusBadgeClass } from '../../utils/formatters';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import { Building2, Plus, Edit2, CheckCircle2, AlertTriangle, Image as ImageIcon, MapPin } from 'lucide-react';

export const FacilityManagement = () => {
  const { showToast } = useToast();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [saving, setSaving] = useState(false);

  const initialForm = {
    name: '',
    location: '',
    address: '',
    description: '',
    venueType: 'Indoor',
    sportsSupported: ['Badminton'],
    amenities: ['Air Conditioning', 'Free Parking'],
    photos: ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'],
    photoInput: '',
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchFacilities = async () => {
    try {
      const res = await ownerService.getMyFacilities();
      if (res.success && res.data) {
        setFacilities(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch facilities', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (fac) => {
    setIsEditing(true);
    setCurrentId(fac._id);
    setFormData({
      name: fac.name,
      location: fac.location,
      address: fac.address,
      description: fac.description,
      venueType: fac.venueType || 'Indoor',
      sportsSupported: fac.sportsSupported || [],
      amenities: fac.amenities || [],
      photos: fac.photos || [],
      photoInput: '',
    });
    setModalOpen(true);
  };

  const handleSportToggle = (sportId) => {
    const list = formData.sportsSupported.includes(sportId)
      ? formData.sportsSupported.filter((s) => s !== sportId)
      : [...formData.sportsSupported, sportId];
    setFormData({ ...formData, sportsSupported: list });
  };

  const handleAmenityToggle = (amenity) => {
    const list = formData.amenities.includes(amenity)
      ? formData.amenities.filter((a) => a !== amenity)
      : [...formData.amenities, amenity];
    setFormData({ ...formData, amenities: list });
  };

  const handleAddPhoto = () => {
    if (formData.photoInput.trim()) {
      setFormData({
        ...formData,
        photos: [...formData.photos, formData.photoInput.trim()],
        photoInput: '',
      });
    }
  };

  const handleRemovePhoto = (idx) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter((_, i) => i !== idx),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.sportsSupported.length === 0) {
      showToast('Please select at least one sport supported.', 'warning');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await ownerService.updateFacility(currentId, formData);
        showToast('Facility updated successfully!', 'success');
      } else {
        await ownerService.createFacility(formData);
        showToast('Facility submitted for admin approval!', 'success');
      }
      setModalOpen(false);
      fetchFacilities();
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner fullScreen message="Loading facility records..." />;
  }

  return (
    <div className="qc-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Facility Management</h1>
          <p style={{ fontSize: '0.95rem' }}>
            Register new sports venues, upload photo galleries, and manage venue details
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Register New Facility
        </Button>
      </div>

      {facilities.length === 0 ? (
        <div className="qc-card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <Building2 size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h3>No Facilities Registered Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '420px', margin: '0.5rem auto 1.5rem' }}>
            Start by adding your sports complex, arena, or grounds. Once approved by an admin, athletes can start booking slots!
          </p>
          <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
            Register Facility
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {facilities.map((fac) => (
            <div
              key={fac._id}
              className="qc-card"
              style={{
                display: 'flex',
                gap: '1.5rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flex: 1, minWidth: '300px' }}>
                <img
                  src={
                    fac.photos?.[0] ||
                    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300'
                  }
                  alt={fac.name}
                  style={{ width: '110px', height: '90px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                    <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{fac.name}</h3>
                    <span className={`qc-badge ${getStatusBadgeClass(fac.status)}`}>
                      {fac.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <MapPin size={14} color="var(--primary)" />
                    <span>{fac.address || fac.location}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {fac.sportsSupported?.map((s, idx) => (
                      <span key={idx} className="qc-sport-pill">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Note & Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                {fac.status === 'PENDING' && (
                  <div style={{ fontSize: '0.8rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={14} /> Pending Administrator Review
                  </div>
                )}
                {fac.status === 'APPROVED' && (
                  <div style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> Live on Marketplace
                  </div>
                )}
                {fac.status === 'REJECTED' && (
                  <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>
                    Note: {fac.approvalComments || 'Requires update before approval'}
                  </div>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  icon={Edit2}
                  onClick={() => handleOpenEdit(fac)}
                >
                  Edit Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Facility Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={isEditing ? 'Edit Facility Details' : 'Register New Sports Facility'}
        maxWidth="640px"
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Facility / Arena Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Apex Smash Arena"
            required
          />

          <div className="qc-grid-2">
            <Input
              label="Short Location"
              name="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Indiranagar, Metro Corridor"
              required
            />

            <div className="qc-form-group">
              <label className="qc-label">Venue Environment</label>
              <select
                className="qc-select"
                value={formData.venueType}
                onChange={(e) => setFormData({ ...formData, venueType: e.target.value })}
              >
                <option value="Indoor">Indoor</option>
                <option value="Outdoor">Outdoor</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <Input
            label="Full Physical Address"
            name="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Plot 42, 100 Feet Road, Indiranagar, Bengaluru, 560038"
            required
          />

          <div className="qc-form-group">
            <label className="qc-label">Description & About Venue</label>
            <textarea
              className="qc-textarea"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell players about your facility standards, lighting, flooring, etc."
              required
            />
          </div>

          {/* Sports Supported */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="qc-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
              Sports Supported:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
              {SPORTS.map((sport) => {
                const checked = formData.sportsSupported.includes(sport.id);
                return (
                  <label
                    key={sport.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      background: checked ? 'var(--primary-light)' : 'var(--bg-input)',
                      border: `1px solid ${checked ? 'var(--primary)' : 'var(--border-default)'}`,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleSportToggle(sport.id)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span>{sport.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Amenities Offered */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="qc-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
              Amenities Offered:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.5rem' }}>
              {DEFAULT_AMENITIES.map((amenity) => {
                const checked = formData.amenities.includes(amenity);
                return (
                  <label
                    key={amenity}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.45rem',
                      borderRadius: '6px',
                      background: checked ? 'var(--primary-light)' : 'var(--bg-input)',
                      border: `1px solid ${checked ? 'var(--primary)' : 'var(--border-default)'}`,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleAmenityToggle(amenity)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span>{amenity}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Photos Upload / URLs */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="qc-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
              Photos (Upload / Image URLs):
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input
                type="url"
                className="qc-input"
                placeholder="https://images.unsplash.com/..."
                value={formData.photoInput}
                onChange={(e) => setFormData({ ...formData, photoInput: e.target.value })}
              />
              <button
                type="button"
                className="qc-btn qc-btn-secondary qc-btn-sm"
                onClick={handleAddPhoto}
              >
                Add Photo
              </button>
            </div>

            {/* Photos thumbnail preview */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {formData.photos.map((url, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <img
                    src={url}
                    alt={`Preview ${idx + 1}`}
                    style={{ width: '72px', height: '54px', borderRadius: '6px', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {isEditing ? 'Save Changes' : 'Submit for Review'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FacilityManagement;
