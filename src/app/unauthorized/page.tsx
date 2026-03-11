'use client';

import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem' }}>
            <div className="card glass-panel" style={{ maxWidth: '460px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <ShieldAlert size={32} />
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>
                    Access Denied
                </h1>
                <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>
                    You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
                </p>
                <Link href="/" className="btn-primary" style={{ display: 'inline-flex', justifyContent: 'center' }}>
                    <ArrowLeft size={16} /> Return to Dashboard
                </Link>
            </div>
        </div>
    );
}
