import React, { useState, useEffect } from 'react';
import ownerService from '../../services/ownerService';
import courtService from '../../services/courtService';
import { useToast } from '../../context/ToastContext';
import SPORTS from '../../constants/sports';
import { formatCurrency } from '../../utils/formatters';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { Plus, Edit2, Trash2, Layers, AlertTriangle } from 'lucide-react';

export const CourtManagement = () => {
  const { showToast } = useToast();
  const [facilities, setFacilities] = useState([]);
  const [courts, setCourts] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCourtId, setEditingCourtId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const initialForm = {
    courtName: '',
    sportType: 'Badminton',
    pricingPerHour: '',
    surfaceType: 'Standard',
    operatingHours: { open: '06:00', close: '23:00' },
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const res = await ownerService.getMyFacilities();
        if (res.success && res.data && res.data.length > 0) {
          const approved = res.data.filter((f) => f.status === 'APPROVED');
          setFacilities(res.data);
          const first = approved[0] || res.data[0];
          setSelectedFacility(first);
        }
      } catch (err) {
        showToast(err.message || 'Failed to load facilities', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, []);

  useEffect(() => {
    if (!selectedFacility?._id) return;
    const fetchCourts = async () => {
      setLoadingCourts(true);
      try {
        const res = await courtService.getCourtsByFacility(selectedFacility._id);
        if (res.success) setCourts(res.data || []);
      } catch (err) {
        showToast(err.message || 'Failed to load courts', 'error');
      } finally {
        setLoadingCourts(false);
      }
    };
    fetchCourts();
  }, [selectedFacility?._id]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingCourtId(null);
    setFormData({ ...initialForm, facilityId: selectedFacility?._id });
    setModalOpen(true);
  };

  const handleOpenEdit = (court) => {
    setIsEditing(true);
    setEditingCourtId(court._id);
    setFormData({
      courtName: court.courtName,
      sportType: court.sportType,
      pricingPerHour: court.pricingPerHour,
      surfaceType: court.surfaceType || 'Standard',
      operatingHours: court.operatingHours || { open: '06:00', close: '23:00' },
      facilityId: selectedFacility?._id,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFacility) return;
    setSaving(true);
    try {
      if (isEditing) {
        await courtService.updateCourt(editingCourtId, formData);
        showToast('Court updated successfully!', 'success');
      } else {
        await courtService.createCourt({ ...formData, facilityId: selectedFacility._id });
        showToast('Court added successfully!', 'success');
      }
      setModalOpen(false);
      const res = await courtService.getCourtsByFacility(selectedFacility._id);
      if (res.success) setCourts(res.data || []);
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await courtService.deleteCourt(deleteModal._id);
      showToast('Court removed successfully.', 'success');
      setDeleteModal(null);
      const res = await courtService.getCourtsByFacility(selectedFacility._id);
      if (res.success) setCourts(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to remove court', 'error');
    }
  };

  if (loading) return <Spinner fullScreen message="Loading court data..." />;

  return (
    <div className="qc-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Court Management</h1>
          <p>Add, edit, or remove courts and configure pricing and surface types</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd} disabled={!selectedFacility}>
          Add New Court
        </Button>
      </div>

      {/* Facility Selector */}
      {facilities.length > 1 && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {facilities.map((f) => (
            <button
              key={f._id}
              type="button"
              onClick={() => setSelectedFacility(f)}
              className={`qc-btn qc-btn-sm ${selectedFacility?._id === f._id ? 'qc-btn-primary' : 'qc-btn-outline'}`}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

      {facilities.length === 0 ? (
        <EmptyState
          title="No Facilities Registered"
          description="Please register and get a facility approved before adding courts."
        />
      ) : loadingCourts ? (
        <Spinner message="Loading courts..." />
      ) : courts.length === 0 ? (
        <EmptyState
          title="No Courts Added Yet"
          description="Add courts with sport types and pricing to start accepting bookings."
          actionLabel="Add First Court"
          onAction={handleOpenAdd}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {courts.map((court) => (
            <div key={court._id} className="qc-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <Layers size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{court.courtName}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {court.sportType} · {court.surfaceType || 'Standard Surface'} · {court.operatingHours?.open}–{court.operatingHours?.close}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.25rem' }}>
                  {formatCurrency(court.pricingPerHour)}/hr
                </span>
                <Button variant="secondary" size="sm" icon={Edit2} onClick={() => handleOpenEdit(court)}>Edit</Button>
                <Button variant="danger" size="sm" icon={Trash2} onClick={() => setDeleteModal(court)}>Remove</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Court Modal */}
      <Modal isOpen={modalOpen} onClose={() => !saving && setModalOpen(false)} title={isEditing ? 'Edit Court' : 'Add New Court'}>
        <form onSubmit={handleSubmit}>
          <Input
            label="Court Name"
            value={formData.courtName}
            onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
            placeholder="e.g. Court 1 - Pro Yonex Mat"
            required
          />
          <div className="qc-form-group">
            <label className="qc-label">Sport Type</label>
            <select className="qc-select" value={formData.sportType} onChange={(e) => setFormData({ ...formData, sportType: e.target.value })}>
              {SPORTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <Input
            label="Pricing Per Hour (₹)"
            type="number"
            value={formData.pricingPerHour}
            onChange={(e) => setFormData({ ...formData, pricingPerHour: e.target.value })}
            placeholder="e.g. 500"
            required
          />
          <Input
            label="Surface Type"
            value={formData.surfaceType}
            onChange={(e) => setFormData({ ...formData, surfaceType: e.target.value })}
            placeholder="e.g. BWF Certified Synthetic Cushion"
          />
          <div className="qc-grid-2">
            <div className="qc-form-group">
              <label className="qc-label">Opens At</label>
              <input type="time" className="qc-input" value={formData.operatingHours?.open || '06:00'} onChange={(e) => setFormData({ ...formData, operatingHours: { ...formData.operatingHours, open: e.target.value } })} />
            </div>
            <div className="qc-form-group">
              <label className="qc-label">Closes At</label>
              <input type="time" className="qc-input" value={formData.operatingHours?.close || '23:00'} onChange={(e) => setFormData({ ...formData, operatingHours: { ...formData.operatingHours, close: e.target.value } })} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>{isEditing ? 'Save Changes' : 'Add Court'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Remove Court">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Remove <strong style={{ color: '#fff' }}>{deleteModal?.courtName}</strong>? This will deactivate the court and prevent future bookings.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Remove Court</Button>
        </div>
      </Modal>
    </div>
  );
};

export default CourtManagement;
