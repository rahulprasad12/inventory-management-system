'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Package, LayoutDashboard, FileText, PlusCircle, Settings, BarChart3 } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Login page gets no shell at all — it is fully standalone
    if (pathname === '/login') {
        return <>{children}</>;
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                background: 'var(--card)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                padding: '1.5rem',
                position: 'sticky',
                top: 0,
                height: '100vh',
                flexShrink: 0,
            }}>
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: 'auto' }}>
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
                </div>

            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, overflowY: 'auto', background: 'var(--background)' }}>
                {/* Top Bar */}
                <div className="no-print" style={{
                    height: '60px',
                    borderBottom: '1px solid var(--border)',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 2rem',
                    justifyContent: 'flex-end',
                    gap: '1rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
