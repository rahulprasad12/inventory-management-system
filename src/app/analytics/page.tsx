'use client';

import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart3, CreditCard, Activity, Loader2, Store } from 'lucide-react';

export default function AnalyticsDashboard() {
    const [period, setPeriod] = useState('month');
    const [storeId, setStoreId] = useState('');
    const [stores, setStores] = useState<{ id: string; name: string; branch?: string }[]>([]);
    const [data, setData] = useState<any>(null);
    const [storeData, setStoreData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/stores').then(r => r.json()).then(setStores);
    }, []);

    useEffect(() => {
        setIsLoading(true);
        const url = storeId ? `/api/analytics?period=${period}&storeId=${storeId}` : `/api/analytics?period=${period}`;
        fetch(url).then(res => res.json()).then(d => { setData(d); setIsLoading(false); }).catch(() => setIsLoading(false));
    }, [period, storeId]);

    useEffect(() => {
        // Load all stores data for comparison chart
        if (stores.length > 1) {
            Promise.all(stores.map(s => fetch(`/api/analytics?period=${period}&storeId=${s.id}`).then(r => r.json()).then(d => ({ store: s.branch || s.name, revenue: d.revenue?.totalEarnings || 0, paid: d.revenue?.totalPaid || 0 })))).then(setStoreData);
        }
    }, [period, stores]);

    if (!data && isLoading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary)' }} />
        </div>
    );

    if (!data) return <div>Failed to load analytics data.</div>;

    // Format data for Recharts
    const revenuePieData = [
        { name: 'Paid', value: data.revenue.totalPaid, color: '#22c55e' },
        { name: 'Due', value: data.revenue.totalDue, color: '#ef4444' }
    ].filter(d => d.value > 0);

    const segmentData = data.salesBySegment.map((s: any) => ({
        name: s.name,
        Revenue: s.revenue,
        Quantity: s.quantity
    }));

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header & Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Activity /> Sales & Revenue Analytics
                    </h1>
                    <p className="page-description">Deep dive into your business metrics, outstanding dues, and product performance.</p>
                </div>

                <div className="card glass-panel" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[
                        { id: 'day', label: 'Today' },
                        { id: 'week', label: 'This Week' },
                        { id: 'month', label: 'This Month' },
                        { id: 'all_time', label: 'All Time' }
                    ].map(p => (
                        <button key={p.id} onClick={() => setPeriod(p.id)}
                            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s', background: period === p.id ? 'var(--primary)' : 'transparent', color: period === p.id ? 'white' : '#64748b' }}>
                            {p.label}
                        </button>
                    ))}
                </div>
                {stores.length > 0 && (
                    <div className="card glass-panel" style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Store size={15} style={{ color: '#64748b' }} />
                        <select value={storeId} onChange={e => setStoreId(e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
                            <option value="">All Stores</option>
                            {stores.map(s => <option key={s.id} value={s.id}>{s.name}{s.branch ? ` — ${s.branch}` : ''}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* Top Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-1rem', right: '-1rem', opacity: 0.05 }}><TrendingUp size={100} /></div>
                    <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Earnings</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e3a8a', letterSpacing: '-0.02em' }}>₹{data.revenue.totalEarnings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                </div>

                <div className="card glass-panel" style={{ position: 'relative', overflow: 'hidden', borderLeft: '4px solid #22c55e' }}>
                    <div style={{ position: 'absolute', top: '-1rem', right: '-1rem', opacity: 0.05, color: '#22c55e' }}><CreditCard size={100} /></div>
                    <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Paid</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#22c55e', letterSpacing: '-0.02em' }}>₹{data.revenue.totalPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                </div>

                <div className="card glass-panel" style={{ position: 'relative', overflow: 'hidden', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ position: 'absolute', top: '-1rem', right: '-1rem', opacity: 0.05, color: '#ef4444' }}><PieIcon size={100} /></div>
                    <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Due</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ef4444', letterSpacing: '-0.02em' }}>₹{data.revenue.totalDue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {/* Revenue Collection Pie Chart */}
                <div className="card glass-panel">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PieIcon size={20} className="text-primary" /> Revenue Collection Breakdown
                    </h2>
                    {revenuePieData.length > 0 ? (
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={revenuePieData}
                                        cx="50%" cy="50%"
                                        innerRadius={80} outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {revenuePieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN')}`}
                                        contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            No revenue data available for this period.
                        </div>
                    )}
                </div>

                {/* Sales by Segment Bar Chart */}
                <div className="card glass-panel">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart3 size={20} className="text-primary" /> Segment Performance
                    </h2>
                    {segmentData.length > 0 ? (
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={segmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis
                                        yAxisId="left" orientation="left" stroke="#1e3a8a"
                                        axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }}
                                        tickFormatter={val => `₹${val / 1000}k`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                                        formatter={(value: any, name: any) => name === 'Revenue' ? `₹${Number(value).toLocaleString('en-IN')}` : value}
                                    />
                                    <Bar yAxisId="left" dataKey="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            No sales data available for this period.
                        </div>
                    )}
                </div>

                {/* Store Comparison Chart — only when multiple stores exist */}
                {storeData.length > 1 && (
                    <div className="card glass-panel" style={{ gridColumn: '1 / -1' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Store size={20} /> Store / Warehouse Comparison
                        </h2>
                        <div style={{ height: '280px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={storeData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="store" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={val => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} />
                                    <Tooltip contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
                                    <Legend />
                                    <Bar dataKey="revenue" name="Total Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                    <Bar dataKey="paid" name="Collected" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Top Products Table */}
                <div className="card glass-panel" style={{ gridColumn: '1 / -1' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={20} className="text-primary" /> Top Products Sold
                    </h2>
                    {data.salesByProduct?.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                                        <th style={{ padding: '1rem', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em' }}>Product Name</th>
                                        <th style={{ padding: '1rem', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em', textAlign: 'center' }}>Units Sold</th>
                                        <th style={{ padding: '1rem', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em', textAlign: 'right' }}>Revenue Generated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.salesByProduct.map((prod: any, idx: number) => (
                                        <tr key={prod.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--foreground)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', width: '20px' }}>#{idx + 1}</span>
                                                    {prod.name}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center', color: '#475569', fontWeight: 500 }}>{prod.quantity}</td>
                                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: '#1e3a8a' }}>₹{prod.revenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '2rem 0', textAlign: 'center', color: '#94a3b8' }}>No product sales recorded in this period.</div>
                    )}
                </div>
            </div>
            {isLoading && (
                <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '2rem', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--primary)', zIndex: 100 }}>
                    <Loader2 size={16} className="animate-spin" /> Updating...
                </div>
            )}
        </div>
    );
}
