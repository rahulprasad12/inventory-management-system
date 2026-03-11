'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Save, Weight, Layers, Droplets, Calendar, Store } from 'lucide-react';

const FMCG_CATEGORIES = ['Baby Care', 'Beverages', 'Canned & Preserved', 'Condiments', 'Dairy', 'Frozen Foods', 'Health', 'Household', 'Packaged Foods', 'Personal Care', 'Snacks', 'Staples', 'Electronics', 'Furniture', 'Stationery', 'Networking'];

const UNITS: Record<string, { label: string; options: string[] }> = {
    weight: { label: 'Weight', options: ['g', 'kg', 'mg'] },
    volume: { label: 'Volume', options: ['ml', 'L'] },
    pieces: { label: 'Pieces / Count', options: ['pcs', 'tabs', 'bags', 'sachets', 'strips'] },
};

export default function AddProductPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [gstEnabled, setGstEnabled] = useState(false);

    // Core fields
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [skuEdited, setSkuEdited] = useState(false);
    const [section, setSection] = useState('');
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [price, setPrice] = useState('');
    const [gstPercent, setGstPercent] = useState('0');
    const [discountPercent, setDiscountPercent] = useState('0');
    const [lowStockThreshold, setLowStockThreshold] = useState('10');

    // Measurement fields
    const [measurementType, setMeasurementType] = useState<'weight' | 'volume' | 'pieces'>('pieces');
    const [measurementValue, setMeasurementValue] = useState('');
    const [measurementUnit, setMeasurementUnit] = useState('pcs');

    // Expiry
    const [hasExpiry, setHasExpiry] = useState(false);
    const [expiryDate, setExpiryDate] = useState('');

    // Stock / carton
    const [cartonsCount, setCartonsCount] = useState('');
    const [itemsPerCarton, setItemsPerCarton] = useState('');
    const [manualStock, setManualStock] = useState('');
    const totalUnitsFromCarton = cartonsCount && itemsPerCarton ? parseInt(cartonsCount) * parseInt(itemsPerCarton) : 0;
    const finalStock = totalUnitsFromCarton > 0 ? totalUnitsFromCarton : parseInt(manualStock) || 0;

    // Store
    const [storeId, setStoreId] = useState('');
    const [stores, setStores] = useState<{ id: string; name: string; branch?: string }[]>([]);
    const [existingSections, setExistingSections] = useState<string[]>([]);

    useEffect(() => {
        fetch('/api/settings').then(r => r.json()).then(d => setGstEnabled(d.gst_enabled === 'true'));
        fetch('/api/stores').then(r => r.json()).then(d => { setStores(d); if (d.length > 0) setStoreId(d[0].id); });
    }, []);

    const effectiveSection = isNewCategory ? newCategoryName : section;

    const fetchSku = useCallback(async (cat: string) => {
        if (!cat || skuEdited) return;
        const res = await fetch(`/api/products/sku-preview?category=${encodeURIComponent(cat)}`);
        const data = await res.json();
        setSku(data.sku);
    }, [skuEdited]);

    useEffect(() => { if (effectiveSection) fetchSku(effectiveSection); }, [effectiveSection, fetchSku]);

    // When measurement type changes, reset unit to first option
    const handleMeasurementType = (type: 'weight' | 'volume' | 'pieces') => {
        setMeasurementType(type);
        setMeasurementUnit(UNITS[type].options[0]);
    };

    const allSections = [...new Set([...FMCG_CATEGORIES, ...existingSections])].sort();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!effectiveSection) { setError('Please select or enter a category.'); return; }
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name, sku, section: effectiveSection,
                    price, gstPercent: gstEnabled ? gstPercent : '0',
                    discountPercent,
                    stockQuantity: finalStock,
                    lowStockThreshold: parseInt(lowStockThreshold) || 10,
                    cartonsCount: parseInt(cartonsCount) || 0,
                    itemsPerCarton: parseInt(itemsPerCarton) || 0,
                    measurementType,
                    measurementValue: parseFloat(measurementValue) || null,
                    measurementUnit,
                    expiryDate: hasExpiry && expiryDate ? expiryDate : null,
                    storeId: storeId || null,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Something went wrong');
            }

            setSuccess('Product added successfully!');
            setName(''); setSku(''); setSkuEdited(false); setPrice('');
            setCartonsCount(''); setItemsPerCarton(''); setManualStock('');
            setMeasurementValue(''); setExpiryDate(''); setHasExpiry(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const sectionBox = (type: 'weight' | 'volume' | 'pieces', icon: React.ReactNode, label: string) => (
        <button
            type="button"
            onClick={() => handleMeasurementType(type)}
            style={{
                flex: 1, padding: '0.75rem 1rem', border: `2px solid ${measurementType === type ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: '0.75rem', background: measurementType === type ? 'rgba(37,99,235,0.06)' : 'transparent',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                color: measurementType === type ? 'var(--primary)' : '#64748b', transition: 'all 0.16s'
            }}
        >
            {icon}
            <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>{label}</span>
        </button>
    );

    return (
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Package /> Add New Product
                </h1>
                <p className="page-description">Fill in the details to add a new inventory item.</p>
            </div>

            <form onSubmit={handleSubmit}>
                {error && <div style={{ padding: '1rem', background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>{error}</div>}
                {success && <div style={{ padding: '1rem', background: '#ecfdf5', color: '#10b981', border: '1px solid #6ee7b7', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>{success}</div>}

                {/* ── Section 1: Basic Info ─────────────────── */}
                <div className="card glass-panel" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '1.25rem' }}>📝 Basic Info</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div className="input-group">
                            <label className="input-label" htmlFor="name">Product Name *</label>
                            <input id="name" type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Amul Butter 500g" required />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Category *</label>
                            {!isNewCategory ? (
                                <select className="input-field" value={section} onChange={e => { if (e.target.value === '__new__') { setIsNewCategory(true); setSection(''); } else setSection(e.target.value); }} required>
                                    <option value="">Select a category...</option>
                                    {allSections.map(s => <option key={s} value={s}>{s}</option>)}
                                    <option value="__new__" style={{ color: '#2563eb', fontWeight: 600 }}>➕ Add new category...</option>
                                </select>
                            ) : (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="text" className="input-field" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="New category name..." required autoFocus style={{ flex: 1 }} />
                                    <button type="button" onClick={() => { setIsNewCategory(false); setNewCategoryName(''); }} style={{ padding: '0 1rem', background: '#f1f5f9', border: '1px solid var(--border)', borderRadius: '0.5rem', cursor: 'pointer', color: '#64748b', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Cancel</button>
                                </div>
                            )}
                        </div>

                        <div className="input-group">
                            <label className="input-label" htmlFor="sku">
                                SKU Code *{!skuEdited && <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.75rem', marginLeft: '0.5rem' }}>(auto-generated)</span>}
                            </label>
                            <input id="sku" type="text" className="input-field" value={sku} onChange={e => { setSku(e.target.value); setSkuEdited(true); }} placeholder="Auto-filled from category" required />
                        </div>

                        {/* Store selector */}
                        <div className="input-group">
                            <label className="input-label" htmlFor="store"><Store size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />Store / Warehouse</label>
                            <select id="store" className="input-field" value={storeId} onChange={e => setStoreId(e.target.value)}>
                                <option value="">No specific store</option>
                                {stores.map(s => <option key={s.id} value={s.id}>{s.name}{s.branch ? ` — ${s.branch}` : ''}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* ── Section 2: Pricing ───────────────────── */}
                <div className="card glass-panel" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '1.25rem' }}>💰 Pricing</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem' }}>
                        <div className="input-group">
                            <label className="input-label" htmlFor="price">Base Price (₹) *</label>
                            <input id="price" type="number" step="0.01" min="0" className="input-field" value={price} onChange={e => setPrice(e.target.value)} required />
                        </div>
                        {gstEnabled && (
                            <div className="input-group">
                                <label className="input-label" htmlFor="gstPercent">GST (%)</label>
                                <select id="gstPercent" className="input-field" value={gstPercent} onChange={e => setGstPercent(e.target.value)}>
                                    {['0', '5', '12', '18', '28'].map(v => <option key={v} value={v}>{v}%{v === '0' ? ' (Exempt)' : ''}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="input-group">
                            <label className="input-label" htmlFor="discountPercent">Default Discount (%)</label>
                            <input id="discountPercent" type="number" step="0.1" min="0" max="100" className="input-field" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* ── Section 3: Measurement ───────────────────*/}
                <div className="card glass-panel" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '1.25rem' }}>📏 Measurement</h3>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        {sectionBox('pieces', <Layers size={18} />, 'Pieces / Count')}
                        {sectionBox('weight', <Weight size={18} />, 'Weight')}
                        {sectionBox('volume', <Droplets size={18} />, 'Volume')}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div className="input-group">
                            <label className="input-label">Value</label>
                            <input type="number" step="0.1" min="0" className="input-field" value={measurementValue} onChange={e => setMeasurementValue(e.target.value)} placeholder={`e.g. ${measurementType === 'pieces' ? '12' : measurementType === 'weight' ? '500' : '1'}`} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Unit</label>
                            <select className="input-field" value={measurementUnit} onChange={e => setMeasurementUnit(e.target.value)}>
                                {UNITS[measurementType].options.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* ── Section 4: Stock & Expiry ──────────────── */}
                <div className="card glass-panel" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '1.25rem' }}>📦 Stock & Expiry</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        <div className="input-group">
                            <label className="input-label" htmlFor="cartonsCount">No. of Cartons</label>
                            <input id="cartonsCount" type="number" min="0" className="input-field" value={cartonsCount} onChange={e => setCartonsCount(e.target.value)} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label className="input-label" htmlFor="itemsPerCarton">Items per Carton</label>
                            <input id="itemsPerCarton" type="number" min="0" className="input-field" value={itemsPerCarton} onChange={e => setItemsPerCarton(e.target.value)} placeholder="0" />
                        </div>
                        {!totalUnitsFromCarton && (
                            <div className="input-group">
                                <label className="input-label" htmlFor="manualStock">Direct Stock Count</label>
                                <input id="manualStock" type="number" min="0" className="input-field" value={manualStock} onChange={e => setManualStock(e.target.value)} placeholder="0" />
                            </div>
                        )}
                        <div className="input-group">
                            <label className="input-label" htmlFor="lowStockThreshold">Low Stock Alert At</label>
                            <input id="lowStockThreshold" type="number" min="1" className="input-field" value={lowStockThreshold} onChange={e => setLowStockThreshold(e.target.value)} placeholder="10" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0.75rem', borderRadius: '0.75rem', background: finalStock > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(148,163,184,0.1)', border: `1px solid ${finalStock > 0 ? 'rgba(34,197,94,0.25)' : 'rgba(148,163,184,0.2)'}` }}>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Stock</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: finalStock > 0 ? '#16a34a' : '#94a3b8' }}>{finalStock}</div>
                        </div>
                    </div>

                    {/* Expiry date toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'rgba(245,158,11,0.05)', border: '1.5px solid rgba(245,158,11,0.2)', borderRadius: '0.75rem' }}>
                        <input type="checkbox" id="hasExpiry" checked={hasExpiry} onChange={e => setHasExpiry(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#f59e0b', cursor: 'pointer' }} />
                        <label htmlFor="hasExpiry" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', color: '#92400e' }}>
                            <Calendar size={15} /> This product has an expiry date
                        </label>
                        {hasExpiry && (
                            <input
                                type="date"
                                value={expiryDate}
                                onChange={e => setExpiryDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                style={{ marginLeft: 'auto', padding: '0.5rem 0.75rem', border: '1.5px solid #fcd34d', borderRadius: '0.5rem', fontSize: '0.875rem', accentColor: '#f59e0b' }}
                                required={hasExpiry}
                            />
                        )}
                    </div>
                </div>

                {/* Submit */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button type="button" className="btn-secondary" onClick={() => router.push('/products')} disabled={isSubmitting}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                        <Save size={18} /> {isSubmitting ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}
