'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Package, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';

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
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Glowing orbs background */}
            <div style={{
                position: 'absolute', top: '-200px', right: '-200px',
                width: '600px', height: '600px', borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.15)',
                filter: 'blur(80px)', pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '-200px', left: '-200px',
                width: '600px', height: '600px', borderRadius: '50%',
                background: 'rgba(37, 99, 235, 0.15)',
                filter: 'blur(80px)', pointerEvents: 'none',
            }} />

            <div style={{
                width: '100%', maxWidth: '460px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                borderRadius: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '3rem',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                position: 'relative',
                zIndex: 1,
            }}>
                {/* Logo & Title */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '72px', height: '72px',
                        background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                        borderRadius: '1.5rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
                    }}>
                        <Package size={36} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
                        Inventory Pro
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                        Admin Portal — Authorized Access Only
                    </p>
                </div>

                {/* Security Badge */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '0.75rem',
                    padding: '0.875rem 1rem',
                    marginBottom: '2rem',
                }}>
                    <Shield size={18} color="#60a5fa" />
                    <span style={{ color: '#93c5fd', fontSize: '0.8rem', fontWeight: 500 }}>
                        Secure login with encrypted session management
                    </span>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
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
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '0.875rem',
                                color: 'white',
                                fontSize: '0.95rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
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
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '0.875rem',
                                    color: 'white',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
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
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '0.75rem',
                            padding: '0.75rem 1rem',
                            color: '#fca5a5',
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
                            background: isLoading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
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
                            boxShadow: '0 4px 24px rgba(99, 102, 241, 0.4)',
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

                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '2rem' }}>
                    © 2024 Inventory Pro. All rights reserved.
                </p>
            </div>

            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                input::placeholder { color: rgba(255,255,255,0.3); }
            `}</style>
        </div>
    );
}
