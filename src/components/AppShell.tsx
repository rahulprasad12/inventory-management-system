'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Package, LayoutDashboard, FileText, PlusCircle, Settings, BarChart3, Store, Users, Shield, Menu, X } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Login page gets no shell at all — it is fully standalone
    if (pathname === '/login') {
        return <>{children}</>;
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
            {/* Mobile Backdrop Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="show-on-mobile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, backdropFilter: 'blur(2px)'
                    }}
                />
            )}

            {/* Sidebar */}
            <aside
                className={isMobileMenuOpen ? '' : 'hide-on-mobile'}
                style={{
                    width: '260px', background: 'var(--card)', borderRight: '1px solid var(--border)',
                    display: 'flex', flexDirection: 'column', padding: '1.5rem',
                    position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 50,
                    transition: 'transform 0.3s ease-in-out',
                    transform: 'translateX(0)',
                }}
            >
                {/* Desktop layout overrides the absolute fixed position to be sticky flex */}
                <style>{`
                    @media (min-width: 769px) {
                        aside { position: sticky !important; height: 100vh; flex-shrink: 0; }
                    }
                `}</style>
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Package size={20} />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Inventory Pro</h2>
                    </div>
                    <button
                        className="show-on-mobile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <Link href="/" style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                        borderRadius: '0.5rem', textDecoration: 'none',
                        color: pathname === '/' ? 'var(--foreground)' : '#64748b',
                        background: pathname === '/' ? 'var(--input)' : 'transparent',
                        fontWeight: 500,
                    }}>
                        <LayoutDashboard size={18} />
                        Dashboard
                    </Link>
                    <Link href="/products" style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                        borderRadius: '0.5rem', textDecoration: 'none',
                        color: pathname.startsWith('/products') ? 'var(--foreground)' : '#64748b',
                        background: pathname.startsWith('/products') ? 'var(--input)' : 'transparent',
                        fontWeight: 500,
                    }}>
                        <Package size={18} />
                        Products
                    </Link>
                    <Link href="/products/add" style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                        borderRadius: '0.5rem', textDecoration: 'none',
                        color: pathname === '/products/add' ? 'var(--foreground)' : '#64748b',
                        background: pathname === '/products/add' ? 'var(--input)' : 'transparent',
                        fontWeight: 500,
                    }}>
                        <PlusCircle size={18} />
                        Add Product
                    </Link>
                    <Link href="/invoices" style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                        borderRadius: '0.5rem', textDecoration: 'none',
                        color: pathname.startsWith('/invoices') ? 'var(--foreground)' : '#64748b',
                        background: pathname.startsWith('/invoices') ? 'var(--input)' : 'transparent',
                        fontWeight: 500,
                    }}>
                        <FileText size={18} />
                        Invoices
                    </Link>
                    <Link href="/analytics" style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                        borderRadius: '0.5rem', textDecoration: 'none',
                        color: pathname.startsWith('/analytics') ? 'var(--foreground)' : '#64748b',
                        background: pathname.startsWith('/analytics') ? 'var(--input)' : 'transparent',
                        fontWeight: 500,
                    }}>
                        <BarChart3 size={18} />
                        Analytics
                    </Link>
                </nav>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <Link href="/settings" style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 1rem',
                        borderRadius: '0.5rem', textDecoration: 'none',
                        color: pathname === '/settings' ? 'var(--foreground)' : '#64748b',
                        background: pathname === '/settings' ? 'var(--input)' : 'transparent',
                        fontWeight: 500, fontSize: '0.9rem',
                    }}>
                        <Settings size={17} />
                        Settings
                    </Link>
                    <Link href="/settings/stores" style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem 0.5rem 2.25rem',
                        borderRadius: '0.5rem', textDecoration: 'none',
                        color: pathname === '/settings/stores' ? 'var(--foreground)' : '#64748b',
                        background: pathname === '/settings/stores' ? 'var(--input)' : 'transparent',
                        fontWeight: 500, fontSize: '0.82rem',
                    }}>
                        <Store size={15} />
                        Stores & Warehouses
                    </Link>
                    <Link href="/settings/users" style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem 0.5rem 2.25rem',
                        borderRadius: '0.5rem', textDecoration: 'none',
                        color: pathname === '/settings/users' ? 'var(--foreground)' : '#64748b',
                        background: pathname === '/settings/users' ? 'var(--input)' : 'transparent',
                        fontWeight: 500, fontSize: '0.82rem',
                    }}>
                        <Users size={15} />
                        User Management
                    </Link>
                    <Link href="/settings/roles" style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem 0.5rem 2.25rem',
                        borderRadius: '0.5rem', textDecoration: 'none',
                        color: pathname === '/settings/roles' ? 'var(--foreground)' : '#64748b',
                        background: pathname === '/settings/roles' ? 'var(--input)' : 'transparent',
                        fontWeight: 500, fontSize: '0.82rem',
                    }}>
                        <Shield size={15} />
                        Role Permissions
                    </Link>
                </div>

            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, overflowY: 'auto', background: 'var(--background)', width: '100%' }}>
                {/* Top Bar */}
                <div className="no-print" style={{
                    height: '60px', borderBottom: '1px solid var(--border)',
                    background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                    position: 'sticky', top: 0, zIndex: 10,
                    display: 'flex', alignItems: 'center', padding: '0 1.5rem',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            className="show-on-mobile"
                            onClick={() => setIsMobileMenuOpen(true)}
                            style={{ background: 'none', border: 'none', color: 'var(--foreground)', cursor: 'pointer', display: 'none', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Menu size={24} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', fontSize: '0.875rem'
                        }}>
                            A
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.9rem' }}>Admin</span>
                    </div>
                    <LogoutButton />
                </div>

                <div className="container" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                    <style>{`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        nav a:hover { background-color: var(--input) !important; color: var(--foreground) !important; }
                    `}</style>
                    {children}
                </div>
            </main>
        </div>
    );
}
