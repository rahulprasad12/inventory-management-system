'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AlertCircle, Clock, RefreshCw } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    sku: string;
    section: string;
    stockQuantity: number;
    lowStockThreshold: number;
    expiryDate: string | null;
    store?: { name: string; branch?: string };
}

export default function AlertsWidget() {
    const [activeTab, setActiveTab] = useState<'low_stock' | 'near_expiry'>('low_stock');
    const [items, setItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async (tab: 'low_stock' | 'near_expiry') => {
        setLoading(true);
        try {
            const url = tab === 'low_stock'
                ? '/api/products?filter=low_stock'
                : '/api/products?filter=near_expiry&days=30';
            const res = await fetch(url);
            const data = await res.json();
            setItems(data);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(activeTab); }, [activeTab, fetchData]);

    const handleTab = (tab: 'low_stock' | 'near_expiry') => {
        setActiveTab(tab);
    };

    const getDaysUntilExpiry = (dateStr: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(dateStr);
        expiry.setHours(0, 0, 0, 0);
        return Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    const getExpiryColor = (days: number) => {
        if (days <= 7) return { border: '#ef4444', bg: 'rgba(239,68,68,0.08)', badge: '#ef4444', label: days <= 0 ? 'EXPIRED' : `${days}d left` };
        if (days <= 14) return { border: '#f59e0b', bg: 'rgba(245,158,11,0.08)', badge: '#f59e0b', label: `${days}d left` };
        return { border: '#22c55e', bg: 'rgba(34,197,94,0.08)', badge: '#22c55e', label: `${days}d left` };
    };

    return (
        <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Inventory Alerts</h3>
                {/* Toggle */}
                <div style={{ display: 'flex', background: 'var(--muted)', borderRadius: '0.625rem', padding: '3px', gap: '2px' }}>
                    <button
                        onClick={() => handleTab('low_stock')}
                        style={{
                            padding: '0.4rem 0.85rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                            background: activeTab === 'low_stock' ? 'white' : 'transparent',
                            color: activeTab === 'low_stock' ? '#ef4444' : '#64748b',
                            boxShadow: activeTab === 'low_stock' ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.35rem'
                        }}
                    >
                        <AlertCircle size={13} /> Low Stock
                    </button>
                    <button
                        onClick={() => handleTab('near_expiry')}
                        style={{
                            padding: '0.4rem 0.85rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                            background: activeTab === 'near_expiry' ? 'white' : 'transparent',
                            color: activeTab === 'near_expiry' ? '#f59e0b' : '#64748b',
                            boxShadow: activeTab === 'near_expiry' ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.35rem'
                        }}
                    >
                        <Clock size={13} /> Near Expiry
                    </button>
                </div>
            </div>

            <div style={{ padding: '1rem' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: '#94a3b8', gap: '0.5rem' }}>
                        <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading...
                    </div>
                ) : items.length === 0 ? (
                    <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                        {activeTab === 'low_stock' ? '✅ All stock levels are healthy!' : '✅ No products expiring within 30 days.'}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {items.slice(0, 10).map(item => {
                            if (activeTab === 'low_stock') {
                                return (
                                    <div key={item.id} className="glass-panel" style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '0.875rem 1rem', borderRadius: '0.5rem', borderLeft: '4px solid var(--destructive)'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                                {item.sku} • {item.section}
                                                {item.store && <> • {item.store.name}{item.store.branch ? ` (${item.store.branch})` : ''}</>}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 700, color: 'var(--destructive)', fontSize: '1.1rem' }}>{item.stockQuantity}</div>
                                        </div>
                                    </div>
                                );
                            } else {
                                const days = getDaysUntilExpiry(item.expiryDate!);
                                const { border, bg, badge, label } = getExpiryColor(days);
                                return (
                                    <div key={item.id} className="glass-panel" style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '0.875rem 1rem', borderRadius: '0.5rem', borderLeft: `4px solid ${border}`, background: bg
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                                {item.sku} • {item.section}
                                                {item.store && <> • {item.store.name}{item.store.branch ? ` (${item.store.branch})` : ''}</>}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                fontWeight: 700, fontSize: '0.75rem', background: badge,
                                                color: 'white', padding: '0.2rem 0.5rem', borderRadius: '1rem'
                                            }}>{label}</div>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.2rem' }}>
                                                {new Date(item.expiryDate!).toLocaleDateString('en-IN')}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>
                )}

                {!loading && items.length > 0 && (
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <Link
                            href={`/products?filter=${activeTab}`}
                            style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}
                        >
                            View All {activeTab === 'low_stock' ? 'Low Stock' : 'Near Expiry'} Items →
                        </Link>
                    </div>
                )}
            </div>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
