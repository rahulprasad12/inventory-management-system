'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Search, Plus, Loader2, Minus, AlertTriangle } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    sku: string;
    section: string;
    price: number;
    stockQuantity: number;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
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

    // Group products by section
    const groupedProducts = products.reduce((acc, product) => {
        if (!acc[product.section]) {
            acc[product.section] = [];
        }
        acc[product.section].push(product);
        return acc;
    }, {} as Record<string, Product[]>);

    // Filter items in the main view based on search
    const displayGroups = Object.keys(groupedProducts).reduce((acc, section) => {
        const filteredSectionProducts = groupedProducts[section].filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filteredSectionProducts.length > 0) {
            acc[section] = filteredSectionProducts;
        }
        return acc;
    }, {} as Record<string, Product[]>);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Package /> Product Management
                    </h1>
                    <p className="page-description">Manage your inventory, group by sections, and track stock.</p>
                </div>

                <Link href="/products/add" className="btn-primary">
                    <Plus size={18} /> Add Product
                </Link>
            </div>

            <div className="card glass-panel" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
                <Search className="text-gray-400" size={20} style={{ color: '#94a3b8' }} />
                <input
                    type="text"
                    placeholder="Search products by name or SKU..."
                    className="input-field"
                    style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: 0 }}
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />

                {showSuggestions && suggestions.length > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.5rem',
                        marginTop: '0.5rem',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 50,
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }}>
                        <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#f8fafc' }}>
                            Suggestions
                        </div>
                        {suggestions.map(s => (
                            <div
                                key={s.id}
                                style={{
                                    padding: '1rem',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #f1f5f9',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    setSearchQuery(s.name);
                                    setShowSuggestions(false);
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 500, color: 'var(--foreground)' }}>{s.name}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{s.section} • SKU: {s.sku}</div>
                                </div>
                                <div style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                    ₹{s.price.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                    <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary)' }} />
                    <style>{`
            @keyframes spin { 100% { transform: rotate(360deg); } }
            .animate-spin { animation: spin 1s linear infinite; }
          `}</style>
                </div>
            ) : Object.keys(displayGroups).length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <Package size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No products found</h3>
                    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Get started by adding your first product to the inventory.</p>
                    <Link href="/products/add" className="btn-primary" style={{ display: 'inline-flex' }}>
                        <Plus size={18} /> Add Product
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {Object.entries(displayGroups).map(([section, sectionProducts]) => (
                        <div key={section} style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                marginBottom: '1rem',
                                paddingBottom: '0.5rem',
                                borderBottom: '2px solid var(--border)'
                            }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>
                                    {section}
                                </h2>
                                <span style={{ background: 'var(--primary)', color: 'white', padding: '0.125rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                                    {sectionProducts.length} items
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                {sectionProducts.map(product => (
                                    <div key={product.id} className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>{product.name}</h3>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>₹{product.price.toFixed(2)}</span>
                                        </div>

                                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                            SKU: <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{product.sku}</span>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            paddingTop: '0.5rem',
                                            borderTop: '1px solid #f1f5f9'
                                        }}>
                                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: product.stockQuantity < 10 ? '#ef4444' : '#22c55e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                {product.stockQuantity < 10 && <AlertTriangle size={14} />}
                                                Stock: {product.stockQuantity}
                                            </span>

                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#f8fafc', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                                <button
                                                    onClick={() => handleUpdateStock(product.id, product.stockQuantity - 1)}
                                                    className="btn-secondary"
                                                    style={{ padding: '0.125rem', minWidth: 'auto', height: '28px', width: '28px' }}
                                                    disabled={updatingId === product.id}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <input
                                                    type="number"
                                                    value={product.stockQuantity}
                                                    onChange={(e) => handleUpdateStock(product.id, parseInt(e.target.value) || 0)}
                                                    style={{ width: '40px', border: 'none', background: 'transparent', textAlign: 'center', fontWeight: 700, fontSize: '0.875rem' }}
                                                />
                                                <button
                                                    onClick={() => handleUpdateStock(product.id, product.stockQuantity + 1)}
                                                    className="btn-secondary"
                                                    style={{ padding: '0.125rem', minWidth: 'auto', height: '28px', width: '28px' }}
                                                    disabled={updatingId === product.id}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
