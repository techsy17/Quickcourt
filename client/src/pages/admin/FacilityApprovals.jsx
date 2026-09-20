import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { CheckCircle, XCircle, Eye, MapPin, Phone, Star, Clock } from 'lucide-react';

const FacilityApprovals = () => {
  const { showToast } = useToast();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState(null);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllFacilities({ status: statusFilter === 'all' ? undefined : statusFilter });
      if (res.success) setFacilities(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load facilities', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFacilities(); }, [statusFilter]);

  const handleAction = async () => {
    if (!action) return;
    setProcessing(true);
    try {
      await adminService.updateFacilityStatus(action.id, action.status, reason);
      showToast(`Facility ${action.status === 'APPROVED' ? 'approved' : 'rejected'} successfully.`, 'success');
      setAction(null);
      setReason('');
      fetchFacilities();
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const STATUS_CONFIG = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    SUSPENDED: 'secondary',
  };

  if (loading) return <Spinner fullScreen message="Loading facilities..." />;

  return (
    <div className="qc-container">
      <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Facility Approvals</h1>
      <p style={{ marginBottom: '2rem' }}>Review and approve or reject facility registration requests</p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'all'].map((s) => (
          <button key={s} type="button" onClick={() => setStatusFilter(s)}
            className={`qc-btn qc-btn-sm ${statusFilter === s ? 'qc-btn-primary' : 'qc-btn-outline'}`}>
            {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {facilities.length === 0 ? (
        <EmptyState title="No Facilities Found" description={`No facilities with status "${statusFilter}" found.`} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {facilities.map((f) => (
            <div key={f._id} className="qc-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{f.name}</h3>
                    <Badge variant={STATUS_CONFIG[f.status] || 'secondary'}>{f.status}</Badge>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} />{f.address?.city}, {f.address?.state}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={13} />{f.contactPhone || 'N/A'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Star size={13} />Sports: {f.sports?.join(', ')}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={13} />Submitted: {formatDate(f.createdAt)}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: 0 }}>{f.description?.slice(0, 120)}...</p>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Owner: <strong style={{ color: '#fff' }}>{f.ownerId?.name || 'N/A'}</strong> ({f.ownerId?.email})
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Button size="sm" variant="secondary" icon={Eye} onClick={() => setSelected(f)}>Details</Button>
                  {f.status === 'PENDING' && (
                    <>
                      <Button size="sm" variant="primary" icon={CheckCircle} onClick={() => setAction({ id: f._id, status: 'APPROVED', name: f.name })}>Approve</Button>
                      <Button size="sm" variant="danger" icon={XCircle} onClick={() => setAction({ id: f._id, status: 'REJECTED', name: f.name })}>Reject</Button>
                    </>
                  )}
                  {f.status === 'APPROVED' && (
                    <Button size="sm" variant="danger" icon={XCircle} onClick={() => setAction({ id: f._id, status: 'SUSPENDED', name: f.name })}>Suspend</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Facility Details">
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              ['Name', selected.name],
              ['Owner', `${selected.ownerId?.name} (${selected.ownerId?.email})`],
              ['Address', `${selected.address?.line1}, ${selected.address?.city}, ${selected.address?.state} - ${selected.address?.pincode}`],
              ['Phone', selected.contactPhone],
              ['Sports', selected.sports?.join(', ')],
              ['Amenities', selected.amenities?.join(', ') || 'None'],
              ['Status', <Badge variant={STATUS_CONFIG[selected.status]}>{selected.status}</Badge>],
              ['Submitted', formatDate(selected.createdAt)],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{v}</span>
              </div>
            ))}
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{selected.description}</p>
            <Button variant="secondary" onClick={() => setSelected(null)} style={{ width: '100%' }}>Close</Button>
          </div>
        )}
      </Modal>

      {/* Action Confirm Modal */}
      <Modal isOpen={!!action} onClose={() => { setAction(null); setReason(''); }} title={`${action?.status === 'APPROVED' ? 'Approve' : action?.status === 'SUSPENDED' ? 'Suspend' : 'Reject'} Facility`}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {action?.status === 'APPROVED'
            ? `Approve "${action?.name}"? It will be listed on the platform.`
            : `Reject/Suspend "${action?.name}"? The owner will be notified.`}
        </p>
        {action?.status !== 'APPROVED' && (
          <Input label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Provide a reason..." />
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => { setAction(null); setReason(''); }} disabled={processing}>Cancel</Button>
          <Button variant={action?.status === 'APPROVED' ? 'primary' : 'danger'} loading={processing} onClick={handleAction}>
            {action?.status === 'APPROVED' ? 'Approve' : action?.status === 'SUSPENDED' ? 'Suspend' : 'Reject'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default FacilityApprovals;
