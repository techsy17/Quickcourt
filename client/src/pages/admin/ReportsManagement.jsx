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
import { Flag, CheckCircle, XCircle, Eye, AlertTriangle, User, Building2 } from 'lucide-react';

const STATUS_CONFIG = { PENDING: 'warning', RESOLVED: 'success', DISMISSED: 'secondary' };
const TYPE_ICONS = { USER: User, VENUE: Building2 };

const ReportsManagement = () => {
  const { showToast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState(null);
  const [resolution, setResolution] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllReports({ status: statusFilter === 'all' ? undefined : statusFilter });
      if (res.success) setReports(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [statusFilter]);

  const handleAction = async () => {
    if (!action) return;
    setProcessing(true);
    try {
      await adminService.updateReportStatus(action.id, action.status, resolution);
      showToast(`Report ${action.status.toLowerCase()} successfully.`, 'success');
      setAction(null);
      setResolution('');
      fetchReports();
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Spinner fullScreen message="Loading reports..." />;

  return (
    <div className="qc-container">
      <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Reports & Complaints</h1>
      <p style={{ marginBottom: '2rem' }}>Review user reports against venues and other users</p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {['PENDING', 'RESOLVED', 'DISMISSED', 'all'].map((s) => (
          <button key={s} type="button" onClick={() => setStatusFilter(s)}
            className={`qc-btn qc-btn-sm ${statusFilter === s ? 'qc-btn-primary' : 'qc-btn-outline'}`}>
            {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {reports.length === 0 ? (
        <EmptyState title="No Reports Found" description={`No ${statusFilter === 'all' ? '' : statusFilter.toLowerCase()} reports.`} icon={Flag} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {reports.map((r) => {
            const TypeIcon = TYPE_ICONS[r.reportType] || AlertTriangle;
            return (
              <div key={r._id} className="qc-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexShrink: 0 }}>
                    <TypeIcon size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600 }}>{r.category || 'General Complaint'}</span>
                      <Badge variant={STATUS_CONFIG[r.status] || 'secondary'} size="sm">{r.status}</Badge>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                      {r.description}
                    </p>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      By: {r.reportedBy?.name || 'Unknown'} · {formatDate(r.createdAt)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button size="sm" variant="secondary" icon={Eye} onClick={() => setSelected(r)}>View</Button>
                  {r.status === 'PENDING' && (
                    <>
                      <Button size="sm" variant="primary" icon={CheckCircle} onClick={() => setAction({ id: r._id, status: 'RESOLVED' })}>Resolve</Button>
                      <Button size="sm" variant="secondary" icon={XCircle} onClick={() => setAction({ id: r._id, status: 'DISMISSED' })}>Dismiss</Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Report Details">
        {selected && (
          <div>
            <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Description</div>
              <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{selected.description}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
              {[
                ['Category', selected.category || 'General'],
                ['Type', selected.reportType],
                ['Reported By', `${selected.reportedBy?.name} (${selected.reportedBy?.email})`],
                ['Target', selected.targetId?.name || selected.targetId?._id],
                ['Status', <Badge variant={STATUS_CONFIG[selected.status]}>{selected.status}</Badge>],
                ['Date', formatDate(selected.createdAt)],
                selected.resolution && ['Resolution', selected.resolution],
              ].filter(Boolean).map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                  <span style={{ fontWeight: 600, maxWidth: '60%', textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
            <Button variant="secondary" onClick={() => setSelected(null)} style={{ width: '100%' }}>Close</Button>
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal isOpen={!!action} onClose={() => { setAction(null); setResolution(''); }} title={`${action?.status === 'RESOLVED' ? 'Resolve' : 'Dismiss'} Report`}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {action?.status === 'RESOLVED' ? 'Mark this report as resolved.' : 'Dismiss this report as invalid.'}
        </p>
        <Input label="Resolution Note (optional)" value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="Describe the action taken..." />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => { setAction(null); setResolution(''); }} disabled={processing}>Cancel</Button>
          <Button variant={action?.status === 'RESOLVED' ? 'primary' : 'secondary'} loading={processing} onClick={handleAction}>
            {action?.status === 'RESOLVED' ? 'Mark Resolved' : 'Dismiss'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ReportsManagement;
