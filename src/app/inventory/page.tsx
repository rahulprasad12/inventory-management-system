'use client';

import { useState, useEffect } from 'react';
import { Package, Search, Loader2, AlertTriangle, Plus, Minus, Check } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    sku: string;
    section: string;
    stockQuantity: number;
}

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStock = async (id: string, newStock: number) => {
        if (newStock < 0) return;

        setUpdatingId(id);
        try {
            const res = await fetch(`/api/products/${id}/stock`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stockQuantity: newStock }),
            });

            if (res.ok) {
                setProducts(products.map(p => p.id === id ? { ...p, stockQuantity: newStock } : p));
            }
        } catch (error) {
            console.error('Failed to update stock:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groupedProducts = filteredProducts.reduce((groups: Record<string, Product[]>, product) => {
        const section = product.section || 'Uncategorized';
        if (!groups[section]) groups[section] = [];
        groups[section].push(product);
        return groups;
    }, {});

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Package /> Inventory Management
                </h1>
                <p className="page-description">Manage stock levels, monitor low inventory, and bulk adjust product quantities.</p>
            </div>

            {/* Search Bar */}
            <div className="card glass-panel" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Search size={20} style={{ color: '#94a3b8' }} />
                <input
                    type="text"
                    placeholder="Search by product name or SKU..."
                    className="input-field"
                    style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: 0 }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                    <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary)' }} />
                </div>
            ) : Object.keys(groupedProducts).length === 0 ? (
                <div className="card glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <Package size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No products found</h3>
                    <p style={{ color: '#64748b' }}>Try adjusting your search criteria.</p>
                </div>
            ) : (
                Object.entries(groupedProducts).map(([section, sectionProducts]) => (
                    <div key={section} style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b', borderLeft: '4px solid var(--primary)', paddingLeft: '0.75rem' }}>
                            {section}
                        </h2>

                        <div className="card glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>SKU</th>
                                        <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Product Name</th>
                                        <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', textAlign: 'center' }}>Stock Level</th>
                                        <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Adjustment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sectionProducts.map((p) => (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>{p.sku}</td>
                                            <td style={{ padding: '1rem', fontWeight: 500 }}>{p.name}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontWeight: 600, fontSize: '0.875rem', ...(p.stockQuantity < 10 ? { background: '#fef2f2', color: '#ef4444' } : { background: '#f0fdf4', color: '#22c55e' }) }}>
                                                    {p.stockQuantity < 10 && <AlertTriangle size={14} />}
                                                    {p.stockQuantity} {p.stockQuantity < 10 ? 'Low' : ''}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '0.5rem' }}>
                                                    <button
                                                        onClick={() => handleUpdateStock(p.id, p.stockQuantity - 1)}
                                                        className="btn-secondary"
                                                        style={{ padding: '0.25rem', minWidth: 'auto' }}
                                                        disabled={updatingId === p.id}
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={p.stockQuantity}
                                                        onChange={(e) => handleUpdateStock(p.id, parseInt(e.target.value) || 0)}
                                                        onBlur={(e) => {
                                                            if (parseInt(e.target.value) < 0) handleUpdateStock(p.id, 0);
                                                        }}
                                                        style={{ width: '50px', border: 'none', background: 'transparent', textAlign: 'center', fontWeight: 600 }}
                                                    />
                                                    <button
                                                        onClick={() => handleUpdateStock(p.id, p.stockQuantity + 1)}
                                                        className="btn-secondary"
                                                        style={{ padding: '0.25rem', minWidth: 'auto' }}
                                                        disabled={updatingId === p.id}
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
