'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Package, Search, Plus, Loader2, Minus, AlertTriangle, Calendar, Store, ChevronDown } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    sku: string;
    section: string;
    price: number;
    stockQuantity: number;
    lowStockThreshold: number;
    measurementValue?: number | null;
    measurementUnit?: string | null;
    expiryDate?: string | null;
    store?: { id: string; name: string; branch?: string } | null;
}

interface StoreOption { id: string; name: string; branch?: string; }

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [stores, setStores] = useState<StoreOption[]>([]);
    const [selectedStoreId, setSelectedStoreId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/stores').then(r => r.json()).then(setStores);
    }, []);

    const fetchProducts = useCallback(async (storeId = '') => {
        setIsLoading(true);
        try {
            const url = storeId ? `/api/products?storeId=${storeId}` : '/api/products';
            const res = await fetch(url);
            setProducts(await res.json());
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchProducts(selectedStoreId); }, [selectedStoreId, fetchProducts]);

    const handleUpdateStock = async (id: string, newStock: number) => {
        if (newStock < 0) return;
        setUpdatingId(id);
        try {
            const res = await fetch(`/api/products/${id}/stock`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stockQuantity: newStock }),
            });
            if (res.ok) setProducts(products.map(p => p.id === id ? { ...p, stockQuantity: newStock } : p));
        } finally {
            setUpdatingId(null);
        }
    };

    const getDaysUntilExpiry = (dateStr: string) => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const exp = new Date(dateStr); exp.setHours(0, 0, 0, 0);
        return Math.round((exp.getTime() - today.getTime()) / 86400000);
    };

    const getExpiryStyle = (days: number) => {
        if (days <= 7) return { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', label: days <= 0 ? 'EXPIRED' : `Exp: ${days}d` };
        if (days <= 14) return { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: `Exp: ${days}d` };
        return { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', label: `Exp: ${days}d` };
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const grouped = filtered.reduce((acc, p) => {
        if (!acc[p.section]) acc[p.section] = [];
        acc[p.section].push(p);
        return acc;
    }, {} as Record<string, Product[]>);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Package /> Product Management
                    </h1>
                    <p className="page-description">Manage your inventory — grouped by category.</p>
                </div>
                <Link href="/products/add" className="btn-primary">
                    <Plus size={18} /> Add Product
                </Link>
            </div>

            {/* Search + Store Filter */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div className="card glass-panel" style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Search size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
                    <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        className="input-field"
                        style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: 0 }}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                {stores.length > 0 && (
                    <div className="card glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem' }}>
                        <Store size={16} style={{ color: '#64748b', flexShrink: 0 }} />
                        <select
                            value={selectedStoreId}
                            onChange={e => setSelectedStoreId(e.target.value)}
                            style={{ border: 'none', background: 'transparent', fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)', cursor: 'pointer', outline: 'none', minWidth: '160px' }}
                        >
                            <option value="">All Stores</option>
                            {stores.map(s => (
                                <option key={s.id} value={s.id}>{s.name}{s.branch ? ` — ${s.branch}` : ''}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} style={{ color: '#94a3b8' }} />
                    </div>
                )}
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                    <Loader2 size={40} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
                    <style>{`@keyframes spin { 100% { transform: rotate(360deg); }}`}</style>
                </div>
            ) : Object.keys(grouped).length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <Package size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No products found</h3>
                    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                        {selectedStoreId ? 'No products for this store.' : 'Get started by adding your first product.'}
                    </p>
                    <Link href="/products/add" className="btn-primary" style={{ display: 'inline-flex' }}><Plus size={18} /> Add Product</Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([section, items]) => (
                        <div key={section}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--border)' }}>
                                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>{section}</h2>
                                <span style={{ background: 'var(--primary)', color: 'white', padding: '0.125rem 0.625rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600 }}>
                                    {items.length} items
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                                {items.map(product => {
                                    const isLow = product.stockQuantity < product.lowStockThreshold;
                                    const days = product.expiryDate ? getDaysUntilExpiry(product.expiryDate) : null;
                                    const expStyle = days !== null ? getExpiryStyle(days) : null;

                                    return (
                                        <div key={product.id} className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {/* Top */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
                                                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>{product.sku}</div>
                                                </div>
                                                <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem', flexShrink: 0, marginLeft: '0.5rem' }}>₹{product.price.toLocaleString('en-IN')}</div>
                                            </div>

                                            {/* Badges row */}
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                                {product.measurementValue && product.measurementUnit && (
                                                    <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '1rem', background: 'rgba(37,99,235,0.08)', color: '#2563eb' }}>
                                                        {product.measurementValue}{product.measurementUnit}
                                                    </span>
                                                )}
                                                {expStyle && (
                                                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '1rem', background: expStyle.bg, color: expStyle.color, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Calendar size={10} /> {expStyle.label}
                                                    </span>
                                                )}
                                                {product.store && (
                                                    <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '1rem', background: 'rgba(139,92,246,0.08)', color: '#7c3aed' }}>
                                                        {product.store.branch || product.store.name}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Stock controls */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isLow ? '#ef4444' : '#22c55e', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    {isLow && <AlertTriangle size={13} />}
                                                    {product.stockQuantity} {isLow ? `/ ${product.lowStockThreshold} ⚠` : 'in stock'}
                                                </span>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#f8fafc', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                                    <button onClick={() => handleUpdateStock(product.id, product.stockQuantity - 1)} className="btn-secondary" style={{ padding: '0.125rem', minWidth: 'auto', height: '26px', width: '26px' }} disabled={updatingId === product.id}><Minus size={12} /></button>
                                                    <input type="number" value={product.stockQuantity} onChange={e => handleUpdateStock(product.id, parseInt(e.target.value) || 0)} style={{ width: '36px', border: 'none', background: 'transparent', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }} />
                                                    <button onClick={() => handleUpdateStock(product.id, product.stockQuantity + 1)} className="btn-secondary" style={{ padding: '0.125rem', minWidth: 'auto', height: '26px', width: '26px' }} disabled={updatingId === product.id}><Plus size={12} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
