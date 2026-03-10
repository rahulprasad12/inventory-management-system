'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Package, Eye, EyeOff, Shield, AlertCircle, Leaf } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Please enter both username and password');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Login failed. Please check your credentials.');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch {
            setError('Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 40%, #e8f5e9 100%)',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Soft decorative blobs */}
            <div style={{
                position: 'absolute', top: '-150px', right: '-150px',
                width: '500px', height: '500px', borderRadius: '50%',
                background: 'rgba(38, 166, 154, 0.12)',
                filter: 'blur(60px)', pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '-150px', left: '-150px',
                width: '500px', height: '500px', borderRadius: '50%',
                background: 'rgba(102, 187, 106, 0.12)',
                filter: 'blur(60px)', pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', top: '40%', left: '10%',
                width: '200px', height: '200px', borderRadius: '50%',
                background: 'rgba(128, 203, 196, 0.1)',
                filter: 'blur(40px)', pointerEvents: 'none',
            }} />

            {/* Card */}
            <div style={{
                width: '100%', maxWidth: '460px',
                background: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(20px)',
                borderRadius: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                padding: '3rem',
                boxShadow: '0 20px 60px rgba(38, 166, 154, 0.15), 0 4px 16px rgba(0,0,0,0.06)',
                position: 'relative',
                zIndex: 1,
            }}>
                {/* Logo & Title */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '72px', height: '72px',
                        background: 'linear-gradient(135deg, #26a69a, #43a047)',
                        borderRadius: '1.5rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 8px 32px rgba(38, 166, 154, 0.35)',
                    }}>
                        <Package size={36} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1b5e20', marginBottom: '0.4rem' }}>
                        Inventory Pro
                    </h1>
                    <p style={{ color: '#78909c', fontSize: '0.875rem' }}>
                        Admin Portal — Authorized Access Only
                    </p>
                </div>

                {/* Security Badge */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: 'rgba(38, 166, 154, 0.08)',
                    border: '1px solid rgba(38, 166, 154, 0.2)',
                    borderRadius: '0.75rem',
                    padding: '0.875rem 1rem',
                    marginBottom: '2rem',
                }}>
                    <Shield size={18} color="#26a69a" />
                    <span style={{ color: '#00695c', fontSize: '0.8rem', fontWeight: 500 }}>
                        Secure login with encrypted session management
                    </span>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', color: '#455a64', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            autoComplete="username"
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: '#f1f8f7',
                                border: '1.5px solid #b2dfdb',
                                borderRadius: '0.875rem',
                                color: '#263238',
                                fontSize: '0.95rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                            }}
                            onFocus={(e) => { e.target.style.borderColor = '#26a69a'; e.target.style.boxShadow = '0 0 0 3px rgba(38,166,154,0.12)'; }}
                            onBlur={(e) => { e.target.style.borderColor = '#b2dfdb'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#455a64', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 3rem 0.875rem 1rem',
                                    background: '#f1f8f7',
                                    border: '1.5px solid #b2dfdb',
                                    borderRadius: '0.875rem',
                                    color: '#263238',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                }}
                                onFocus={(e) => { e.target.style.borderColor = '#26a69a'; e.target.style.boxShadow = '0 0 0 3px rgba(38,166,154,0.12)'; }}
                                onBlur={(e) => { e.target.style.borderColor = '#b2dfdb'; e.target.style.boxShadow = 'none'; }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: '#90a4ae',
                                    padding: 0, display: 'flex', alignItems: 'center',
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.625rem',
                            background: 'rgba(239, 68, 68, 0.07)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            borderRadius: '0.75rem',
                            padding: '0.75rem 1rem',
                            color: '#c62828',
                            fontSize: '0.875rem',
                        }}>
                            <AlertCircle size={16} style={{ flexShrink: 0 }} />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: isLoading ? 'rgba(38,166,154,0.5)' : 'linear-gradient(135deg, #26a69a, #43a047)',
                            border: 'none',
                            borderRadius: '0.875rem',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            marginTop: '0.5rem',
                            boxShadow: '0 4px 24px rgba(38, 166, 154, 0.35)',
                            transition: 'all 0.2s',
                        }}
                    >
                        {isLoading ? (
                            <>
                                <div style={{
                                    width: '20px', height: '20px', borderRadius: '50%',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTopColor: 'white',
                                    animation: 'spin 0.8s linear infinite',
                                }} />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <LogIn size={20} />
                                Sign In to Dashboard
                            </>
                        )}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '2rem' }}>
                    <Leaf size={13} color="#80cbc4" />
                    <p style={{ textAlign: 'center', color: '#b0bec5', fontSize: '0.75rem', margin: 0 }}>
                        © 2024 Inventory Pro. All rights reserved.
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                input::placeholder { color: #90a4ae; }
            `}</style>
        </div>
    );
}
