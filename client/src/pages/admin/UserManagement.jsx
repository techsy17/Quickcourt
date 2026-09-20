import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { UserCheck, UserX, Eye, Search, Shield, ShieldOff } from 'lucide-react';

const ROLE_VARIANT = { USER: 'info', FACILITY_OWNER: 'warning', ADMIN: 'success' };

const UserManagement = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllUsers();
      if (res.success) setUsers(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleStatus = async () => {
    if (!confirmAction) return;
    setProcessing(true);
    try {
      await adminService.updateUserStatus(confirmAction.id, confirmAction.status);
      showToast(`User ${confirmAction.status === 'ACTIVE' ? 'activated' : 'banned'} successfully.`, 'success');
      setConfirmAction(null);
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch = search === '' || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  if (loading) return <Spinner fullScreen message="Loading users..." />;

  return (
    <div className="qc-container">
      <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>User Management</h1>
      <p style={{ marginBottom: '2rem' }}>View, monitor, and manage platform users</p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="qc-input" placeholder="Search by name or email..." style={{ paddingLeft: '2.2rem' }} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'USER', 'FACILITY_OWNER', 'ADMIN'].map((r) => (
            <button key={r} type="button" onClick={() => setRoleFilter(r)}
              className={`qc-btn qc-btn-sm ${roleFilter === r ? 'qc-btn-primary' : 'qc-btn-outline'}`}>
              {r === 'all' ? 'All' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Showing {filtered.length} of {users.length} users
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No Users Found" description="No users match your search criteria." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((u) => (
            <div key={u._id} className="qc-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
                  {(u.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{u.name || 'N/A'}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1px' }}>Joined {formatDate(u.createdAt)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Badge variant={ROLE_VARIANT[u.role] || 'secondary'}>{u.role?.replace('_', ' ')}</Badge>
                <Badge variant={u.accountStatus === 'ACTIVE' ? 'success' : 'danger'}>{u.accountStatus || 'ACTIVE'}</Badge>
                <Button size="sm" variant="secondary" icon={Eye} onClick={() => setSelected(u)}>View</Button>
                {u.role !== 'ADMIN' && (
                  u.accountStatus === 'BANNED' ? (
                    <Button size="sm" variant="primary" icon={UserCheck} onClick={() => setConfirmAction({ id: u._id, status: 'ACTIVE', name: u.name })}>Unban</Button>
                  ) : (
                    <Button size="sm" variant="danger" icon={UserX} onClick={() => setConfirmAction({ id: u._id, status: 'BANNED', name: u.name })}>Ban</Button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="User Details">
        {selected && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '10px' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '1.5rem' }}>
                {(selected.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selected.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{selected.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
              {[
                ['Role', <Badge variant={ROLE_VARIANT[selected.role]}>{selected.role?.replace('_', ' ')}</Badge>],
                ['Account Status', <Badge variant={selected.accountStatus === 'ACTIVE' ? 'success' : 'danger'}>{selected.accountStatus}</Badge>],
                ['Phone', selected.phone || 'Not provided'],
                ['Email Verified', selected.isEmailVerified ? '✅ Yes' : '❌ No'],
                ['Joined', formatDate(selected.createdAt)],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <Button variant="secondary" onClick={() => setSelected(null)} style={{ width: '100%' }}>Close</Button>
          </div>
        )}
      </Modal>

      {/* Confirm Action */}
      <Modal isOpen={!!confirmAction} onClose={() => setConfirmAction(null)} title={confirmAction?.status === 'BANNED' ? 'Ban User' : 'Unban User'}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {confirmAction?.status === 'BANNED'
            ? `Ban "${confirmAction?.name}"? They will be unable to access the platform.`
            : `Unban "${confirmAction?.name}"? They will regain full platform access.`}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setConfirmAction(null)} disabled={processing}>Cancel</Button>
          <Button variant={confirmAction?.status === 'BANNED' ? 'danger' : 'primary'} loading={processing} onClick={handleToggleStatus}>
            {confirmAction?.status === 'BANNED' ? 'Ban User' : 'Unban User'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
