'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, X, Save, Key, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

interface User {
    id: string;
    name: string;
    username: string;
    role: 'ADMIN' | 'MANAGER' | 'STAFF';
    createdAt: string;
}

const ROLE_CONFIG = {
    ADMIN: { label: 'Admin', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: ShieldAlert, desc: 'Full access' },
    MANAGER: { label: 'Manager', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: ShieldCheck, desc: 'Most sections' },
    STAFF: { label: 'Staff', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: Shield, desc: 'Limited access' },
};

const emptyForm = { name: '', username: '', password: '', role: 'STAFF' as User['role'] };

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        const res = await fetch('/api/users');
        const data = await res.json();
        setUsers(data);
        setLoading(false);
    };

    useEffect(() => { fetchUsers(); }, []);

    const openAdd = () => { setEditingUser(null); setForm(emptyForm); setError(''); setShowForm(true); };
    const openEdit = (u: User) => { setEditingUser(u); setForm({ name: u.name, username: u.username, password: '', role: u.role }); setError(''); setShowForm(true); };
    const closeForm = () => { setShowForm(false); setEditingUser(null); };

    const handleSave = async () => {
        if (!form.username) { setError('Username is required.'); return; }
        if (!editingUser && !form.password) { setError('Password is required for new users.'); return; }
        setSaving(true);
        try {
            const body: Record<string, string> = { name: form.name, username: form.username, role: form.role };
            if (form.password) body.password = form.password;
            if (editingUser) {
                await fetch(`/api/users/${editingUser.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            } else {
                const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                if (!res.ok) { const d = await res.json(); setError(d.error); return; }
            }
            closeForm(); fetchUsers();
        } catch { setError('Failed to save user.'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (u: User) => {
        if (!confirm(`Delete user "${u.username}"? This cannot be undone.`)) return;
        await fetch(`/api/users/${u.id}`, { method: 'DELETE' });
        fetchUsers();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title"><Users size={24} style={{ display: 'inline', marginRight: '0.75rem' }} />User Management</h1>
                    <p className="page-description">Create and manage user accounts and their system roles.</p>
                </div>
                <button className="btn-primary" onClick={openAdd}><Plus size={18} /> Add User</button>
            </div>

            {/* Role legend */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {(Object.entries(ROLE_CONFIG) as [User['role'], typeof ROLE_CONFIG[keyof typeof ROLE_CONFIG]][]).map(([role, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                        <div key={role} className="card glass-panel" style={{ flex: '1', minWidth: '160px', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem' }}>
                            <div style={{ background: cfg.bg, color: cfg.color, padding: '0.5rem', borderRadius: '0.5rem' }}><Icon size={18} /></div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: cfg.color }}>{cfg.label}</div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{cfg.desc}</div>
                            </div>
                            <div style={{ marginLeft: 'auto', fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>
                                {users.filter(u => u.role === role).length}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* User Table */}
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                            {['Name', 'Username', 'Role', 'Created', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: h === 'Actions' ? 'right' : 'left', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading...</td></tr>
                        ) : users.map(user => {
                            const cfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.STAFF;
                            const Icon = cfg.icon;
                            return (
                                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${cfg.color}20`, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{user.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: '#64748b', fontSize: '0.875rem' }}>@{user.username}</td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', borderRadius: '1rem', background: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: '0.78rem' }}>
                                            <Icon size={12} /> {cfg.label}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', color: '#64748b', fontSize: '0.82rem' }}>
                                        {new Date(user.createdAt).toLocaleDateString('en-IN')}
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                                            <button onClick={() => openEdit(user)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '0.4rem', padding: '0.35rem 0.6rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem' }}>
                                                <Edit2 size={12} /> Edit
                                            </button>
                                            <button onClick={() => handleDelete(user)} style={{ background: 'none', border: '1px solid #fecaca', borderRadius: '0.4rem', padding: '0.35rem 0.6rem', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem' }}>
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '460px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{editingUser ? 'Edit User' : 'Create New User'}</h2>
                            <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#374151' }}>Full Name</label>
                                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rahul Sharma" className="input-field" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#374151' }}>Username *</label>
                                <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="e.g. rahul.sharma" className="input-field" disabled={!!editingUser} style={{ opacity: editingUser ? 0.6 : 1 }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#374151' }}>
                                    <Key size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />
                                    Password {editingUser && <span style={{ fontWeight: 400, color: '#94a3b8' }}>(leave blank to keep current)</span>}
                                </label>
                                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editingUser ? 'Enter new password' : 'Min 8 characters'} className="input-field" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#374151' }}>Role</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {(Object.entries(ROLE_CONFIG) as [User['role'], typeof ROLE_CONFIG[keyof typeof ROLE_CONFIG]][]).map(([role, cfg]) => {
                                        const Icon = cfg.icon;
                                        return (
                                            <button key={role} type="button" onClick={() => setForm({ ...form, role })}
                                                style={{ flex: 1, padding: '0.625rem', border: `2px solid ${form.role === role ? cfg.color : 'var(--border)'}`, borderRadius: '0.625rem', background: form.role === role ? cfg.bg : 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', transition: 'all 0.15s' }}>
                                                <Icon size={16} style={{ color: cfg.color }} />
                                                <span style={{ fontWeight: 700, fontSize: '0.72rem', color: form.role === role ? cfg.color : '#64748b' }}>{cfg.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            {error && <div style={{ color: '#ef4444', fontSize: '0.85rem', background: 'rgba(239,68,68,0.08)', padding: '0.625rem', borderRadius: '0.5rem' }}>{error}</div>}
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button onClick={closeForm} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex: 1 }}>
                                <Save size={15} /> {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
