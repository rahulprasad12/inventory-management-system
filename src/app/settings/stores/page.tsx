'use client';

import { useState, useEffect } from 'react';
import { Plus, Store, Edit2, Trash2, MapPin, Phone, Hash, X, Save, Building2 } from 'lucide-react';

interface StoreData {
    id: string;
    name: string;
    branch?: string;
    address?: string;
    phone?: string;
    gstin?: string;
    isActive: boolean;
    _count?: { products: number; invoices: number };
}

const emptyForm = { name: '', branch: '', address: '', phone: '', gstin: '' };

export default function StoresPage() {
    const [stores, setStores] = useState<StoreData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingStore, setEditingStore] = useState<StoreData | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchStores = async () => {
        setLoading(true);
        const res = await fetch('/api/stores');
        const data = await res.json();
        setStores(data);
        setLoading(false);
    };

    useEffect(() => { fetchStores(); }, []);

    const openAdd = () => { setEditingStore(null); setForm(emptyForm); setShowForm(true); setError(''); };
    const openEdit = (s: StoreData) => {
        setEditingStore(s);
        setForm({ name: s.name, branch: s.branch || '', address: s.address || '', phone: s.phone || '', gstin: s.gstin || '' });
        setShowForm(true);
        setError('');
    };
    const closeForm = () => { setShowForm(false); setEditingStore(null); };

    const handleSave = async () => {
        if (!form.name.trim()) { setError('Store name is required.'); return; }
        setSaving(true);
        try {
            if (editingStore) {
                await fetch(`/api/stores/${editingStore.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            } else {
                await fetch('/api/stores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            }
            closeForm();
            fetchStores();
        } catch {
            setError('Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete store "${name}"? This cannot be undone.`)) return;
        await fetch(`/api/stores/${id}`, { method: 'DELETE' });
        fetchStores();
    };

    const toggleActive = async (s: StoreData) => {
        await fetch(`/api/stores/${s.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !s.isActive }) });
        fetchStores();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title">Stores & Warehouses</h1>
                    <p className="page-description">Manage your store branches and warehouse locations.</p>
                </div>
                <button className="btn-primary" onClick={openAdd}>
                    <Plus size={18} /> Add Store
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Loading stores...</div>
            ) : stores.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <Building2 size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                    <h3 style={{ marginBottom: '0.5rem', color: '#64748b' }}>No stores yet</h3>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Add your first store or warehouse to get started.</p>
                    <button className="btn-primary" onClick={openAdd}><Plus size={16} /> Add Store</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
                    {stores.map(store => (
                        <div key={store.id} className="card" style={{ opacity: store.isActive ? 1 : 0.6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ background: 'rgba(37,99,235,0.1)', color: 'var(--primary)', padding: '0.625rem', borderRadius: '0.625rem' }}>
                                        <Store size={22} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{store.name}</div>
                                        {store.branch && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{store.branch}</div>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    <button onClick={() => openEdit(store)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '0.4rem', padding: '0.35rem', cursor: 'pointer', color: '#64748b' }}>
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(store.id, store.name)} style={{ background: 'none', border: '1px solid #fecaca', borderRadius: '0.4rem', padding: '0.35rem', cursor: 'pointer', color: '#ef4444' }}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                                {store.address && <div style={{ display: 'flex', gap: '0.4rem' }}><MapPin size={13} style={{ flexShrink: 0, marginTop: '2px' }} />{store.address}</div>}
                                {store.phone && <div style={{ display: 'flex', gap: '0.4rem' }}><Phone size={13} />{store.phone}</div>}
                                {store.gstin && <div style={{ display: 'flex', gap: '0.4rem' }}><Hash size={13} />GSTIN: {store.gstin}</div>}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: '#64748b' }}>
                                    <span><strong style={{ color: 'var(--foreground)' }}>{store._count?.products || 0}</strong> products</span>
                                    <span><strong style={{ color: 'var(--foreground)' }}>{store._count?.invoices || 0}</strong> invoices</span>
                                </div>
                                <button
                                    onClick={() => toggleActive(store)}
                                    style={{
                                        fontSize: '0.7rem', fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: '1rem', border: 'none', cursor: 'pointer',
                                        background: store.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)',
                                        color: store.isActive ? '#16a34a' : '#64748b'
                                    }}
                                >
                                    {store.isActive ? '● Active' : '○ Inactive'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{editingStore ? 'Edit Store' : 'Add New Store'}</h2>
                            <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { label: 'Store Name *', key: 'name', placeholder: 'e.g. QuickMart Superstore' },
                                { label: 'Branch / Location', key: 'branch', placeholder: 'e.g. Koramangala' },
                                { label: 'Address', key: 'address', placeholder: 'Full store address' },
                                { label: 'Phone', key: 'phone', placeholder: 'Contact number' },
                                { label: 'GSTIN', key: 'gstin', placeholder: 'GST Identification Number' },
                            ].map(field => (
                                <div key={field.key}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#374151' }}>{field.label}</label>
                                    {field.key === 'address' ? (
                                        <textarea
                                            value={form[field.key as keyof typeof form]}
                                            onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                                            placeholder={field.placeholder}
                                            rows={2}
                                            style={{ width: '100%', padding: '0.75rem', border: '1.5px solid var(--border)', borderRadius: '0.625rem', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={form[field.key as keyof typeof form]}
                                            onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                                            placeholder={field.placeholder}
                                            style={{ width: '100%', padding: '0.75rem', border: '1.5px solid var(--border)', borderRadius: '0.625rem', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                        />
                                    )}
                                </div>
                            ))}
                            {error && <div style={{ color: '#ef4444', fontSize: '0.85rem', background: 'rgba(239,68,68,0.08)', padding: '0.625rem', borderRadius: '0.5rem' }}>{error}</div>}
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button onClick={closeForm} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex: 1 }}>
                                <Save size={16} /> {saving ? 'Saving...' : 'Save Store'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
