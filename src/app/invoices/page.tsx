'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Plus, Search, Loader2, ExternalLink } from 'lucide-react';

const WA_ICON = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const STATUS_CONFIG = {
    PENDING: { label: 'Pending', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: '#ef4444', dot: '#ef4444' },
    PARTIAL: { label: 'Partial', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: '#f59e0b', dot: '#f59e0b' },
    PAID: { label: 'Paid', color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: '#22c55e', dot: '#22c55e' },
};

interface Invoice {
    id: string;
    invoiceNumber: string;
    customerName: string;
    customerPhone?: string;
    totalAmount: number;
    paidAmount: number;
    paymentStatus: string;
    createdAt: string;
    items: Record<string, unknown>[];
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Invoice[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');

    const fetchInvoices = useCallback(async () => {
        setIsLoading(true);
        const res = await fetch('/api/invoices');
        setInvoices(await res.json());
        setIsLoading(false);
    }, []);

    useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

    useEffect(() => {
        if (searchQuery.length > 1) {
            fetch(`/api/invoices?q=${encodeURIComponent(searchQuery)}`).then(r => r.json()).then(setSuggestions);
        } else setSuggestions([]);
    }, [searchQuery]);

    const displayInvoices = invoices
        .filter(inv => filterStatus === 'ALL' || inv.paymentStatus === filterStatus)
        .filter(inv =>
            inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
        });

    const buildWAMessage = (inv: Invoice) =>
        `Hi! Here's your invoice *${inv.invoiceNumber}* for ₹${inv.totalAmount.toFixed(2)}. Total due: ₹${(inv.totalAmount - (inv.paidAmount || 0)).toFixed(2)}.`;

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FileText /> Invoice Management
                    </h1>
                    <p className="page-description">View, search, and manage all generated invoices.</p>
                </div>
                <Link href="/invoices/new" className="btn-primary">
                    <Plus size={18} /> Create Invoice
                </Link>
            </div>

            {/* Status legend */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: cfg.color }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
                        {cfg.label}
                    </div>
                ))}
            </div>

            {/* Search, Filter, Sort */}
            <div className="card glass-panel" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '250px' }}>
                    <Search size={20} style={{ color: '#94a3b8', flexShrink: 0 }} />
                    <input type="text" placeholder="Search by customer name or invoice number..."
                        className="input-field"
                        style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: 0, flex: 1 }}
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="input-field"
                        style={{ padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontSize: '0.875rem', minWidth: '130px' }}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="PARTIAL">Partial</option>
                        <option value="PAID">Paid</option>
                    </select>

                    <button
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        className="btn-secondary"
                        style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                    >
                        Date: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                    </button>
                </div>

                {showSuggestions && suggestions.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '0.5rem', marginTop: '0.5rem', boxShadow: 'var(--shadow-lg)', zIndex: 50, maxHeight: '300px', overflowY: 'auto' }}>
                        {suggestions.map(s => (
                            <div key={s.id} style={{ padding: '1rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => { setSearchQuery(s.customerName); setShowSuggestions(false); }}>
                                <div>
                                    <div style={{ fontWeight: 500 }}>{s.customerName}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.invoiceNumber}</div>
                                </div>
                                <div style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{s.totalAmount.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="card glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <Loader2 size={40} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
                    </div>
                ) : displayInvoices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <FileText size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No invoices found</h3>
                        <p style={{ color: '#64748b' }}>Create your first invoice to get started.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '1rem', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.04em' }}>Invoice</th>
                                    <th style={{ padding: '1rem', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.04em' }}>Customer</th>
                                    <th style={{ padding: '1rem', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.04em' }}>Date</th>
                                    <th style={{ padding: '1rem', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.04em' }}>Status</th>
                                    <th style={{ padding: '1rem', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.04em', textAlign: 'right' }}>Amount</th>
                                    <th style={{ padding: '1rem', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.04em', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayInvoices.map(inv => {
                                    const status = STATUS_CONFIG[inv.paymentStatus as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
                                    const due = inv.totalAmount - (inv.paidAmount || 0);
                                    return (
                                        <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9', borderLeft: `4px solid ${status.border}`, transition: 'background 0.2s' }}
                                            onMouseOver={e => (e.currentTarget.style.background = '#f8fafc')}
                                            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                                            <td style={{ padding: '1rem' }}>
                                                <Link href={`/invoices/${inv.id}`} style={{ fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
                                                    {inv.invoiceNumber}
                                                </Link>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{inv.items.length} item{inv.items.length !== 1 ? 's' : ''}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: 600 }}>{inv.customerName}</div>
                                                {inv.customerPhone && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{inv.customerPhone}</div>}
                                            </td>
                                            <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                                                {new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.7rem', borderRadius: '999px', background: status.bg, border: `1px solid ${status.border}`, fontSize: '0.75rem', fontWeight: 700, color: status.color }}>
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: status.dot }} />
                                                    {status.label}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <div style={{ fontWeight: 700, color: 'var(--foreground)' }}>₹{inv.totalAmount.toFixed(2)}</div>
                                                {inv.paidAmount > 0 && inv.paymentStatus !== 'PAID' && (
                                                    <div style={{ fontSize: '0.72rem', color: '#22c55e' }}>Paid: ₹{inv.paidAmount.toFixed(2)}</div>
                                                )}
                                                {inv.paymentStatus === 'PARTIAL' && (
                                                    <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, marginTop: '2px' }}>Pending: ₹{due.toFixed(2)}</div>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                    <Link href={`/invoices/${inv.id}`}
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '0.5rem', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
                                                        <ExternalLink size={13} /> View
                                                    </Link>
                                                    {inv.customerPhone && (
                                                        <a href={`https://wa.me/${inv.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(buildWAMessage(inv))}`}
                                                            target="_blank" rel="noreferrer"
                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: '0.5rem', color: '#25D366', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
                                                            <WA_ICON /> WA
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
