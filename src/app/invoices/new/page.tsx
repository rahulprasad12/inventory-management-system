'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search, Plus, Trash2, CheckCircle2, ArrowLeft, Eye, Store } from 'lucide-react';
import { format } from 'date-fns';

interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    gstPercent: number;
    discountPercent: number;
    stockQuantity: number;
}

interface InvoiceItem extends Product {
    quantity: number;
}

interface StoreOption {
    id: string;
    name: string;
    branch?: string;
    address?: string;
    phone?: string;
    gstin?: string;
}

export default function MakeInvoicePage() {
    const router = useRouter();

    // Form state
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [storeId, setStoreId] = useState('');
    const [stores, setStores] = useState<StoreOption[]>([]);
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [error, setError] = useState('');
    const [gstEnabled, setGstEnabled] = useState(false);

    // Preview / submit state
    const [previewMode, setPreviewMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successId, setSuccessId] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/settings').then(r => r.json()).then(d => setGstEnabled(d.gst_enabled === 'true'));
        fetch('/api/stores').then(r => r.json()).then((d: StoreOption[]) => {
            setStores(d);
            if (d.length > 0) setStoreId(d[0].id);
        });
    }, []);

    useEffect(() => {
        if (searchQuery.length > 1) {
            const q = storeId ? `/api/products?q=${encodeURIComponent(searchQuery)}&storeId=${storeId}` : `/api/products?q=${encodeURIComponent(searchQuery)}`;
            fetch(q).then(r => r.json()).then(setSuggestions).catch(console.error);
        } else setSuggestions([]);
    }, [searchQuery, storeId]);

    const addProduct = (product: Product) => {
        if (product.stockQuantity <= 0) { setError(`${product.name} is out of stock!`); setTimeout(() => setError(''), 3000); return; }
        const existing = items.find(i => i.id === product.id);
        if (existing) {
            if (existing.quantity >= product.stockQuantity) { setError(`Max stock reached for ${product.name}!`); setTimeout(() => setError(''), 3000); return; }
            setItems(items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setItems([...items, { ...product, quantity: 1 }]);
        }
        setSearchQuery(''); setShowSuggestions(false);
    };

    const updateQty = (id: string, qty: number) => {
        if (qty < 1) return;
        const product = items.find(i => i.id === id);
        if (product && qty > product.stockQuantity) { setError(`Max stock (${product.stockQuantity}) reached!`); setTimeout(() => setError(''), 3000); return; }
        setItems(items.map(i => i.id === id ? { ...i, quantity: qty } : i));
    };

    const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));

    // Calculations
    const subTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const totalDiscount = items.reduce((s, i) => s + (i.price * i.quantity * i.discountPercent / 100), 0);
    const totalGst = gstEnabled ? items.reduce((s, i) => {
        const taxable = i.price * i.quantity * (1 - i.discountPercent / 100);
        return s + taxable * (i.gstPercent / 100);
    }, 0) : 0;
    const finalTotal = subTotal - totalDiscount + totalGst;

    const selectedStore = stores.find(s => s.id === storeId);

    const handleSubmit = async () => {
        if (items.length === 0 || !customerName) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerName, customerPhone, storeId: storeId || null, items: items.map(i => ({ productId: i.id, quantity: i.quantity })) })
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Failed to create invoice');
            const data = await res.json();
            setSuccessId(data.id);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            setIsSubmitting(false);
        }
    };

    // ── Success screen ──────────────────────────────
    if (successId) {
        return (
            <div className="container" style={{ maxWidth: '600px', textAlign: 'center', paddingTop: '4rem' }}>
                <div className="card glass-panel" style={{ padding: '3rem 2rem' }}>
                    <CheckCircle2 color="#10b981" size={64} style={{ margin: '0 auto 1.5rem' }} />
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Invoice Created!</h1>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>The invoice has been generated and inventory updated.</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn-secondary" onClick={() => { setCustomerName(''); setCustomerPhone(''); setItems([]); setSuccessId(null); setPreviewMode(false); setIsSubmitting(false); }}>
                            Create Another
                        </button>
                        <button className="btn-primary" onClick={() => router.push(`/invoices/${successId}`)}>
                            <FileText size={18} /> View & Share PDF
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Preview mode ────────────────────────────────
    if (previewMode) {
        const today = new Date();
        return (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button onClick={() => setPreviewMode(false)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowLeft size={16} /> Back to Edit
                    </button>
                    <div>
                        <h1 className="page-title" style={{ marginBottom: '0.1rem' }}>Invoice Preview</h1>
                        <p className="page-description">Review your invoice before confirming.</p>
                    </div>
                </div>

                {/* Preview Invoice Card */}
                <div className="card" style={{ background: 'white', padding: '3rem', marginBottom: '1.5rem', borderRadius: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.07)' }}>
                    {/* Letterhead */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                        <div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.4rem' }}>
                                {selectedStore?.name || 'QuickMart Superstore'}
                                {selectedStore?.branch && <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600 }}> — {selectedStore.branch}</span>}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: '1.6' }}>
                                {selectedStore?.address && <>{selectedStore.address}<br /></>}
                                {selectedStore?.phone && <>📞 {selectedStore.phone}<br /></>}
                                {selectedStore?.gstin && <><strong>GSTIN:</strong> {selectedStore.gstin}</>}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1e3a8a', letterSpacing: '-0.02em' }}>INVOICE</div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600, marginTop: '0.25rem' }}>DRAFT — Preview Only</div>
                            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{format(today, 'dd MMMM yyyy')}</div>
                        </div>
                    </div>

                    {/* Customer */}
                    <div style={{ marginBottom: '2.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Billed To</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>{customerName}</div>
                        {customerPhone && <div style={{ color: '#64748b' }}>📱 {customerPhone}</div>}
                    </div>

                    {/* Items */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#475569', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Description</th>
                                <th style={{ textAlign: 'center', padding: '0.75rem', color: '#475569', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Qty</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#475569', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Rate</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#475569', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Disc</th>
                                {gstEnabled && <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#475569', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>GST</th>}
                                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#475569', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => {
                                const gross = item.price * item.quantity;
                                const disc = gross * item.discountPercent / 100;
                                const afterDisc = gross - disc;
                                const gst = afterDisc * item.gstPercent / 100;
                                const lineTotal = afterDisc + gst;
                                return (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>
                                            {item.name}
                                            {item.discountPercent > 0 && <span style={{ display: 'block', fontSize: '0.7rem', color: '#22c55e' }}>{item.discountPercent}% discount</span>}
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '0.875rem', color: '#64748b', fontWeight: 600 }}>{item.quantity}</td>
                                        <td style={{ textAlign: 'right', padding: '0.875rem 1rem', color: '#64748b' }}>₹{item.price.toLocaleString('en-IN')}</td>
                                        <td style={{ textAlign: 'right', padding: '0.875rem 1rem', color: disc > 0 ? '#ef4444' : '#94a3b8' }}>{disc > 0 ? `-₹${disc.toFixed(2)}` : '—'}</td>
                                        {gstEnabled && <td style={{ textAlign: 'right', padding: '0.875rem 1rem', color: '#64748b' }}>{item.gstPercent}%</td>}
                                        <td style={{ textAlign: 'right', padding: '0.875rem 1rem', fontWeight: 700, color: '#1e3a8a' }}>₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Summary */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
                        <div style={{ width: '280px' }}>
                            {[
                                { label: 'Subtotal', value: `₹${subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: '#1e293b' },
                                { label: 'Discount', value: `-₹${totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: '#ef4444' },
                                ...(gstEnabled ? [{ label: 'GST', value: `+₹${totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: '#1e293b' }] : [])
                            ].map(row => (
                                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>
                                    <span>{row.label}</span>
                                    <span style={{ fontWeight: 600, color: row.color }}>{row.value}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderTop: '2px solid #e2e8f0', marginTop: '0.5rem' }}>
                                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a' }}>Grand Total</span>
                                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e3a8a' }}>₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                        Computer-generated invoice. Thank you for your business!
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button className="btn-secondary" onClick={() => setPreviewMode(false)} style={{ minWidth: '140px' }}>
                        <ArrowLeft size={16} /> Back to Edit
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        style={{ minWidth: '200px', justifyContent: 'center', fontSize: '1rem', padding: '0.875rem 2rem', background: '#16a34a', boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}
                    >
                        {isSubmitting ? 'Generating...' : '✓ Confirm & Generate Invoice'}
                    </button>
                </div>
                {error && <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef2f2', color: '#ef4444', borderRadius: '0.5rem', textAlign: 'center' }}>{error}</div>}
            </div>
        );
    }

    // ── Main Form ───────────────────────────────────
    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText /> Create Invoice
                </h1>
                <p className="page-description">Fill in customer details, select store, and add products.</p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>

                    {/* Customer + Store Card */}
                    <div className="card glass-panel">
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Customer & Store</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
                            <div className="input-group">
                                <label className="input-label" htmlFor="customer">Customer Name *</label>
                                <input id="customer" type="text" className="input-field" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. Rohit Kumar" required />
                            </div>
                            <div className="input-group">
                                <label className="input-label" htmlFor="phone">Phone Number</label>
                                <input id="phone" type="text" className="input-field" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="9876543210" />
                            </div>
                            {stores.length > 0 && (
                                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="input-label"><Store size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />Store / Branch</label>
                                    <select className="input-field" value={storeId} onChange={e => setStoreId(e.target.value)}>
                                        <option value="">No specific store</option>
                                        {stores.map(s => <option key={s.id} value={s.id}>{s.name}{s.branch ? ` — ${s.branch}` : ''}</option>)}
                                    </select>
                                    {selectedStore?.address && (
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>📍 {selectedStore.address}</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Add Products Card */}
                    <div className="card glass-panel" style={{ overflow: 'visible' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Add Products</h3>

                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                            <input type="text" className="input-field" style={{ paddingLeft: '3rem' }} value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                placeholder="Search products to add..." />

                            {showSuggestions && suggestions.length > 0 && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '0.5rem', marginTop: '0.25rem', boxShadow: 'var(--shadow-lg)', zIndex: 50, maxHeight: '250px', overflowY: 'auto' }}>
                                    {suggestions.map(s => (
                                        <div key={s.id} onMouseDown={e => e.preventDefault()} onClick={() => addProduct(s)}
                                            style={{ padding: '0.875rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.sku} · Stock: {s.stockQuantity}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{s.price.toLocaleString('en-IN')}</span>
                                                <div style={{ background: 'var(--primary)', color: 'white', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {items.length > 0 ? (
                            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ color: '#64748b', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                            <th style={{ padding: '0.625rem 0', fontWeight: 600 }}>Item</th>
                                            <th style={{ padding: '0.625rem 0', fontWeight: 600 }}>Qty</th>
                                            <th style={{ padding: '0.625rem 0', fontWeight: 600, textAlign: 'right' }}>Rate</th>
                                            <th style={{ padding: '0.625rem 0', fontWeight: 600, textAlign: 'right' }}>Line Total</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(item => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                <td style={{ padding: '0.875rem 0' }}>
                                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.name}</div>
                                                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Disc: {item.discountPercent}%{gstEnabled ? ` · GST: ${item.gstPercent}%` : ''}</div>
                                                </td>
                                                <td style={{ padding: '0.875rem 0' }}>
                                                    <input type="number" min="1" max={item.stockQuantity} value={item.quantity} onChange={e => updateQty(item.id, parseInt(e.target.value))}
                                                        style={{ width: '56px', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border)', textAlign: 'center', fontWeight: 700 }} />
                                                </td>
                                                <td style={{ padding: '0.875rem 0', textAlign: 'right', color: '#64748b' }}>₹{item.price.toFixed(2)}</td>
                                                <td style={{ padding: '0.875rem 0', textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>₹{(item.price * item.quantity * (1 - item.discountPercent / 100)).toFixed(2)}</td>
                                                <td style={{ padding: '0.875rem 0', textAlign: 'right' }}>
                                                    <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--destructive)', cursor: 'pointer' }}><Trash2 size={15} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ marginTop: '2rem', textAlign: 'center', color: '#94a3b8', padding: '2rem 0' }}>Search for products to add them to this invoice.</div>
                        )}

                        {error && <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef2f2', color: '#ef4444', borderRadius: '0.5rem', fontSize: '0.875rem' }}>{error}</div>}
                    </div>
                </div>

                {/* Right: Summary */}
                <div style={{ flex: '1 1 300px', alignSelf: 'start' }}>
                    <div className="card glass-panel" style={{ position: 'sticky', top: '5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Invoice Summary</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}><span>Subtotal</span><span>₹{subTotal.toFixed(2)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}><span>Discount</span><span>−₹{totalDiscount.toFixed(2)}</span></div>
                            {gstEnabled && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}><span>GST</span><span>+₹{totalGst.toFixed(2)}</span></div>}
                            <div style={{ height: '1px', background: 'var(--border)' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: 'var(--foreground)' }}>
                                <span>Grand Total</span>
                                <span style={{ color: 'var(--primary)' }}>₹{finalTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        {selectedStore && (
                            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(37,99,235,0.05)', borderRadius: '0.625rem', border: '1px solid rgba(37,99,235,0.15)', fontSize: '0.78rem', color: '#475569' }}>
                                <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>📍 {selectedStore.name} — {selectedStore.branch}</div>
                                {selectedStore.address && <div>{selectedStore.address}</div>}
                            </div>
                        )}

                        <button
                            onClick={() => {
                                if (!customerName) { setError('Please enter customer name.'); return; }
                                if (items.length === 0) { setError('Please add at least one product.'); return; }
                                setError(''); setPreviewMode(true);
                            }}
                            disabled={!customerName || items.length === 0}
                            className="btn-primary"
                            style={{ width: '100%', padding: '1rem', fontSize: '1rem', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            <Eye size={18} /> Preview Invoice
                        </button>
                        {(!customerName || items.length === 0) && (
                            <p style={{ textAlign: 'center', fontSize: '0.73rem', color: '#94a3b8', marginTop: '0.75rem' }}>
                                Add customer name and products to preview.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
