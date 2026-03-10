'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search, Plus, Trash2, CheckCircle2 } from 'lucide-react';

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

export default function MakeInvoicePage() {
    const router = useRouter();
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    // Product Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Invoice Items State
    const [items, setItems] = useState<InvoiceItem[]>([]);

    // Submission State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successId, setSuccessId] = useState<string | null>(null);
    const [gstEnabled, setGstEnabled] = useState(true);

    useEffect(() => {
        fetch('/api/settings').then(r => r.json()).then(d => setGstEnabled(d.gst_enabled !== 'false'));
    }, []);

    useEffect(() => {
        if (searchQuery.length > 1) {
            fetch(`/api/products?q=${encodeURIComponent(searchQuery)}`)
                .then(res => res.json())
                .then(data => setSuggestions(data))
                .catch(err => console.error(err));
        } else {
            setSuggestions([]);
        }
    }, [searchQuery]);

    const addProductToInvoice = (product: Product) => {
        if (product.stockQuantity <= 0) {
            setError(`Cannot add ${product.name} - Out of stock!`);
            setTimeout(() => setError(''), 3000);
            return;
        }

        const existingItem = items.find(item => item.id === product.id);

        if (existingItem) {
            if (existingItem.quantity >= product.stockQuantity) {
                setError(`Cannot add more ${product.name} - Max stock reached!`);
                setTimeout(() => setError(''), 3000);
                return;
            }
            setItems(items.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setItems([...items, { ...product, quantity: 1 }]);
        }

        setSearchQuery('');
        setShowSuggestions(false);
    };

    const updateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        const product = items.find(i => i.id === id);
        if (!product) return;

        if (newQuantity > product.stockQuantity) {
            setError(`Cannot add more ${product.name} - Max stock (${product.stockQuantity}) reached!`);
            setTimeout(() => setError(''), 3000);
            return;
        }

        setItems(items.map(item =>
            item.id === id ? { ...item, quantity: newQuantity } : item
        ));
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    // Calculations
    const subTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalDiscount = items.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        return sum + (itemTotal * (item.discountPercent / 100));
    }, 0);
    const amountAfterDiscount = subTotal - totalDiscount;

    const totalGst = gstEnabled ? items.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        const itemDiscountAmt = itemTotal * (item.discountPercent / 100);
        const taxableAmt = itemTotal - itemDiscountAmt;
        return sum + (taxableAmt * (item.gstPercent / 100));
    }, 0) : 0;

    const finalTotal = amountAfterDiscount + totalGst;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) {
            setError('Please add at least one product to the invoice.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const formattedItems = items.map(i => ({
                productId: i.id,
                quantity: i.quantity
            }));

            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName,
                    customerPhone,
                    items: formattedItems
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create invoice');
            }

            const invoiceData = await res.json();
            setSuccessId(invoiceData.id);

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(msg);
            setIsSubmitting(false);
        }
    };

    if (successId) {
        return (
            <div className="container" style={{ maxWidth: '600px', textAlign: 'center', paddingTop: '4rem' }}>
                <div className="card glass-panel" style={{ padding: '3rem 2rem' }}>
                    <CheckCircle2 color="#10b981" size={64} style={{ margin: '0 auto 1.5rem auto' }} />
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Invoice Created!</h1>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                        The invoice has been generated successfully and inventory has been updated.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                setCustomerName('');
                                setCustomerPhone('');
                                setItems([]);
                                setSuccessId(null);
                                setIsSubmitting(false);
                            }}
                        >
                            Create Another
                        </button>
                        <button
                            className="btn-primary"
                            onClick={() => router.push(`/invoices/${successId}`)}
                        >
                            <FileText size={18} /> View & Share PDF
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FileText /> Create Invoice
                    </h1>
                    <p className="page-description">Generate a new GST-compliant invoice.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* Left Side: Customer & Search */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    <div className="card glass-panel">
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Customer Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label className="input-label" htmlFor="customer">Full Name *</label>
                                <input
                                    id="customer"
                                    type="text"
                                    className="input-field"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="e.g. Acme Corp"
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label" htmlFor="phone">Phone Number</label>
                                <input
                                    id="phone"
                                    type="text"
                                    className="input-field"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    placeholder="+91..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card glass-panel" style={{ overflow: 'visible' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Add Products</h3>

                        <div className="input-group" style={{ position: 'relative' }}>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <Search size={20} style={{ position: 'absolute', left: '1rem', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    className="input-field"
                                    style={{ paddingLeft: '3rem' }}
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    placeholder="Search products by name to add..."
                                />
                            </div>

                            {/* Autocomplete Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    background: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '0.5rem',
                                    marginTop: '0.25rem',
                                    boxShadow: 'var(--shadow-lg)',
                                    zIndex: 50,
                                    maxHeight: '250px',
                                    overflowY: 'auto'
                                }}>
                                    {suggestions.map(s => (
                                        <div
                                            key={s.id}
                                            style={{
                                                padding: '1rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                            }}
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => addProductToInvoice(s)}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{s.name}</div>
                                                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Stock: {s.stockQuantity}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{s.price.toFixed(2)}</span>
                                                <div style={{
                                                    background: 'var(--primary)', color: 'white', width: '28px', height: '28px',
                                                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <Plus size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Items Table */}
                        {items.length > 0 ? (
                            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                                    <thead>
                                        <tr style={{ color: '#64748b', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                            <th style={{ padding: '0.75rem 0', fontWeight: 500 }}>Item</th>
                                            <th style={{ padding: '0.75rem 0', fontWeight: 500 }}>Qty</th>
                                            <th style={{ padding: '0.75rem 0', fontWeight: 500, textAlign: 'right' }}>Price</th>
                                            <th style={{ padding: '0.75rem 0', fontWeight: 500, textAlign: 'right' }}>Total</th>
                                            <th style={{ padding: '0.75rem 0' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(item => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '1rem 0' }}>
                                                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                        {gstEnabled ? `GST: ${item.gstPercent}% | ` : ''}Disc: {item.discountPercent}%
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem 0' }}>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={item.stockQuantity}
                                                        value={item.quantity}
                                                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                                        style={{
                                                            width: '60px', padding: '0.25rem 0.5rem', borderRadius: '0.25rem',
                                                            border: '1px solid var(--border)', textAlign: 'center'
                                                        }}
                                                    />
                                                </td>
                                                <td style={{ padding: '1rem 0', textAlign: 'right' }}>₹{item.price.toFixed(2)}</td>
                                                <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 500 }}>
                                                    ₹{(item.price * item.quantity).toFixed(2)}
                                                </td>
                                                <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        style={{ background: 'none', border: 'none', color: 'var(--destructive)', cursor: 'pointer', padding: '0.5rem' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ marginTop: '2rem', textAlign: 'center', color: '#94a3b8', padding: '2rem 0' }}>
                                Search for products to add them to this invoice.
                            </div>
                        )}

                        {error && (
                            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef2f2', color: '#ef4444', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Summary Card */}
                <div style={{ alignSelf: 'start' }}>
                    <div className="card glass-panel" style={{ position: 'sticky', top: '5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                            Invoice Summary
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                                <span>Subtotal</span>
                                <span>₹{subTotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                                <span>Total Discount</span>
                                <span>- ₹{totalDiscount.toFixed(2)}</span>
                            </div>
                            {gstEnabled && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                                    <span>Total GST</span>
                                    <span>+ ₹{totalGst.toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{ height: '1px', background: 'var(--border)', margin: '0.5rem 0' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, color: 'var(--foreground)' }}>
                                <span>Grand Total</span>
                                <span style={{ color: 'var(--primary)' }}>₹{finalTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || items.length === 0 || !customerName}
                            className="btn-primary"
                            style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', justifyContent: 'center' }}
                        >
                            {isSubmitting ? 'Generating...' : 'Finalize & Create Invoice'}
                        </button>
                        {(!customerName || items.length === 0) && (
                            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem' }}>
                                Please fill customer name and add items to proceed.
                            </p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
