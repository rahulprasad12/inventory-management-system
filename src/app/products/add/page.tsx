'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Save, Plus } from 'lucide-react';

const KNOWN_CATEGORIES = ['Electronics', 'Furniture', 'Stationery', 'Networking', 'Clothing', 'Food & Beverages', 'Tools', 'Medical'];

export default function AddProductPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [gstEnabled, setGstEnabled] = useState(true);

    // Form fields
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [skuEdited, setSkuEdited] = useState(false);
    const [section, setSection] = useState('');
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [price, setPrice] = useState('');
    const [gstPercent, setGstPercent] = useState('18');
    const [discountPercent, setDiscountPercent] = useState('0');

    // Carton logic
    const [cartonsCount, setCartonsCount] = useState('');
    const [itemsPerCarton, setItemsPerCarton] = useState('');
    const totalUnits = cartonsCount && itemsPerCarton
        ? parseInt(cartonsCount) * parseInt(itemsPerCarton)
        : 0;

    const [existingSections, setExistingSections] = useState<string[]>([]);

    useEffect(() => {
        fetch('/api/settings').then(r => r.json()).then(d => setGstEnabled(d.gst_enabled !== 'false'));
        fetch('/api/products?sectionsOnly=true').then(r => r.json()).then(d => setExistingSections(d));
    }, []);

    const effectiveSection = isNewCategory ? newCategoryName : section;

    // Auto-generate SKU when category is set and user hasn't manually edited it
    const fetchSku = useCallback(async (cat: string) => {
        if (!cat || skuEdited) return;
        const res = await fetch(`/api/products/sku-preview?category=${encodeURIComponent(cat)}`);
        const data = await res.json();
        setSku(data.sku);
    }, [skuEdited]);

    useEffect(() => {
        if (effectiveSection) fetchSku(effectiveSection);
    }, [effectiveSection, fetchSku]);

    const allSections = [
        ...new Set([...KNOWN_CATEGORIES, ...existingSections]),
    ].sort();

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
                    stockQuantity: totalUnits || 0,
                    cartonsCount: parseInt(cartonsCount) || 0,
                    itemsPerCarton: parseInt(itemsPerCarton) || 0,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Something went wrong');
            }

            setSuccess('Product added successfully!');
            setName(''); setSku(''); setSkuEdited(false);
            setPrice(''); setCartonsCount(''); setItemsPerCarton('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Package /> Add New Product
                </h1>
                <p className="page-description">Fill in the details to add a new inventory item.</p>
            </div>

            <div className="card glass-panel" style={{ padding: '2rem' }}>
                {error && (
                    <div style={{ padding: '1rem', background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                        {error}
                    </div>
                )}
                {success && (
                    <div style={{ padding: '1rem', background: '#ecfdf5', color: '#10b981', border: '1px solid #6ee7b7', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                        {/* Product Name */}
                        <div className="input-group">
                            <label className="input-label" htmlFor="name">Product Name *</label>
                            <input id="name" type="text" className="input-field" value={name}
                                onChange={e => setName(e.target.value)} placeholder="e.g. Wireless Mouse" required />
                        </div>

                        {/* Category */}
                        <div className="input-group">
                            <label className="input-label">Category *</label>
                            {!isNewCategory ? (
                                <select
                                    className="input-field"
                                    value={section}
                                    onChange={e => {
                                        if (e.target.value === '__new__') {
                                            setIsNewCategory(true);
                                            setSection('');
                                        } else {
                                            setSection(e.target.value);
                                        }
                                    }}
                                    required={!isNewCategory}
                                >
                                    <option value="">Select a category...</option>
                                    {allSections.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                    <option value="__new__" style={{ color: '#2563eb', fontWeight: 600 }}>
                                        ➕ Add new category...
                                    </option>
                                </select>
                            ) : (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={newCategoryName}
                                        onChange={e => setNewCategoryName(e.target.value)}
                                        placeholder="New category name..."
                                        required
                                        autoFocus
                                        style={{ flex: 1 }}
                                    />
                                    <button type="button" onClick={() => { setIsNewCategory(false); setNewCategoryName(''); }}
                                        style={{ padding: '0 1rem', background: '#f1f5f9', border: '1px solid var(--border)', borderRadius: '0.5rem', cursor: 'pointer', color: '#64748b', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* SKU */}
                        <div className="input-group">
                            <label className="input-label" htmlFor="sku">
                                SKU Code *
                                {!skuEdited && <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.75rem', marginLeft: '0.5rem' }}>(auto-generated)</span>}
                            </label>
                            <input id="sku" type="text" className="input-field" value={sku}
                                onChange={e => { setSku(e.target.value); setSkuEdited(true); }}
                                placeholder="Auto-filled from category" required />
                        </div>

                        {/* Base Price */}
                        <div className="input-group">
                            <label className="input-label" htmlFor="price">Base Price (₹) *</label>
                            <input id="price" type="number" step="0.01" min="0" className="input-field"
                                value={price} onChange={e => setPrice(e.target.value)} required />
                        </div>

                        {/* GST — only shown when GST is enabled */}
                        {gstEnabled && (
                            <div className="input-group">
                                <label className="input-label" htmlFor="gstPercent">GST (%)</label>
                                <select id="gstPercent" className="input-field" value={gstPercent}
                                    onChange={e => setGstPercent(e.target.value)}>
                                    <option value="0">0% (Exempt)</option>
                                    <option value="5">5%</option>
                                    <option value="12">12%</option>
                                    <option value="18">18%</option>
                                    <option value="28">28%</option>
                                </select>
                            </div>
                        )}

                        {/* Discount */}
                        <div className="input-group">
                            <label className="input-label" htmlFor="discountPercent">Default Discount (%)</label>
                            <input id="discountPercent" type="number" step="0.1" min="0" max="100"
                                className="input-field" value={discountPercent}
                                onChange={e => setDiscountPercent(e.target.value)} />
                        </div>
                    </div>

                    {/* Carton / Stock Section */}
                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.12)', borderRadius: '1rem' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--foreground)' }}>
                            📦 Stock / Carton Details
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', alignItems: 'end' }}>
                            <div className="input-group" style={{ margin: 0 }}>
                                <label className="input-label" htmlFor="cartonsCount">No. of Cartons</label>
                                <input id="cartonsCount" type="number" min="0" className="input-field"
                                    value={cartonsCount} onChange={e => setCartonsCount(e.target.value)}
                                    placeholder="0" />
                            </div>
                            <div className="input-group" style={{ margin: 0 }}>
                                <label className="input-label" htmlFor="itemsPerCarton">Items per Carton</label>
                                <input id="itemsPerCarton" type="number" min="0" className="input-field"
                                    value={itemsPerCarton} onChange={e => setItemsPerCarton(e.target.value)}
                                    placeholder="0" />
                            </div>
                            <div style={{ textAlign: 'center', padding: '0.75rem', borderRadius: '0.75rem', background: totalUnits > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(148,163,184,0.1)', border: `1px solid ${totalUnits > 0 ? 'rgba(34,197,94,0.25)' : 'rgba(148,163,184,0.2)'}` }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Units</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: totalUnits > 0 ? '#16a34a' : '#94a3b8' }}>
                                    {totalUnits || 0}
                                </div>
                                {cartonsCount && itemsPerCarton && (
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cartonsCount} × {itemsPerCarton}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                        <button type="button" className="btn-secondary" onClick={() => router.push('/products')} disabled={isSubmitting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            <Save size={18} />
                            {isSubmitting ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
