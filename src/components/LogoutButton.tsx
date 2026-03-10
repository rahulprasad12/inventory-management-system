'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

export default function LogoutButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        } catch {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '0.5rem',
                color: '#ef4444',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                transition: 'all 0.2s',
                opacity: isLoading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.15)';
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.08)';
            }}
        >
            <LogOut size={16} />
            {isLoading ? 'Signing out...' : 'Sign Out'}
        </button>
    );
}
