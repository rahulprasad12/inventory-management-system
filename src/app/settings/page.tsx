'use client';

import { useState, useEffect } from 'react';
import { Settings, Lock, ToggleLeft, ToggleRight, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
    const [gstEnabled, setGstEnabled] = useState(true);
    const [gstSaving, setGstSaving] = useState(false);
    const [gstSaved, setGstSaved] = useState(false);

    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetch('/api/settings')
            .then(r => r.json())
            .then(data => setGstEnabled(data.gst_enabled !== 'false'));
    }, []);

    const toggleGst = async () => {
        const newVal = !gstEnabled;
        setGstEnabled(newVal);
        setGstSaving(true);
        await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'gst_enabled', value: String(newVal) }),
        });
        setGstSaving(false);
        setGstSaved(true);
        setTimeout(() => setGstSaved(false), 2000);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwMsg(null);
        if (newPw !== confirmPw) { setPwMsg({ type: 'error', text: 'New passwords do not match' }); return; }
        if (newPw.length < 8) { setPwMsg({ type: 'error', text: 'Password must be at least 8 characters' }); return; }
        setPwLoading(true);
        const res = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
        });
        const data = await res.json();
        setPwLoading(false);
        if (res.ok) {
            setPwMsg({ type: 'success', text: 'Password changed successfully!' });
            setCurrentPw(''); setNewPw(''); setConfirmPw('');
        } else {
            setPwMsg({ type: 'error', text: data.error });
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Settings size={28} /> Settings
                </h1>
                <p className="page-description">Manage application preferences and account security.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '700px' }}>

                {/* GST Toggle */}
                <div className="card glass-panel">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--foreground)' }}>
                                GST Feature
                            </h2>
                            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6' }}>
                                When <strong>ON</strong>, GST percentages and amounts are calculated and shown on invoices, product pages, and reports.<br />
                                When <strong>OFF</strong>, all GST-related fields, columns, and calculations are hidden application-wide.
                            </p>
                            {gstSaved && (
                                <p style={{ color: '#22c55e', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Check size={14} /> Saved
                                </p>
                            )}
                        </div>
                        <button
                            onClick={toggleGst}
                            disabled={gstSaving}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: gstEnabled ? '#22c55e' : '#94a3b8',
                                flexShrink: 0, padding: '0.25rem',
                                transition: 'color 0.2s',
                            }}
                            title={gstEnabled ? 'Click to disable GST' : 'Click to enable GST'}
                        >
                            {gstEnabled
                                ? <ToggleRight size={48} strokeWidth={1.5} />
                                : <ToggleLeft size={48} strokeWidth={1.5} />
                            }
                        </button>
                    </div>
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.6rem 1rem',
                        borderRadius: '0.5rem',
                        background: gstEnabled ? 'rgba(34,197,94,0.08)' : 'rgba(148,163,184,0.1)',
                        border: `1px solid ${gstEnabled ? 'rgba(34,197,94,0.2)' : 'rgba(148,163,184,0.2)'}`,
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        fontSize: '0.8rem', fontWeight: 600,
                        color: gstEnabled ? '#16a34a' : '#64748b',
                    }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: gstEnabled ? '#22c55e' : '#94a3b8' }} />
                        GST is currently {gstEnabled ? 'ENABLED' : 'DISABLED'}
                    </div>
                </div>

                {/* Change Password */}
                <div className="card glass-panel">
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Lock size={18} /> Change Password
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
                        Update the admin account password.
                    </p>

                    <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Current Password */}
                        <div className="input-group">
                            <label className="input-label">Current Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showCurrent ? 'text' : 'password'}
                                    className="input-field"
                                    value={currentPw}
                                    onChange={e => setCurrentPw(e.target.value)}
                                    placeholder="Enter current password"
                                    required
                                    style={{ paddingRight: '3rem' }}
                                />
                                <button type="button" onClick={() => setShowCurrent(v => !v)}
                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="input-group">
                            <label className="input-label">New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    className="input-field"
                                    value={newPw}
                                    onChange={e => setNewPw(e.target.value)}
                                    placeholder="Min 8 characters"
                                    required
                                    style={{ paddingRight: '3rem' }}
                                />
                                <button type="button" onClick={() => setShowNew(v => !v)}
                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="input-group">
                            <label className="input-label">Confirm New Password</label>
                            <input
                                type="password"
                                className="input-field"
                                value={confirmPw}
                                onChange={e => setConfirmPw(e.target.value)}
                                placeholder="Re-enter new password"
                                required
                            />
                        </div>

                        {pwMsg && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem',
                                background: pwMsg.type === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                                border: `1px solid ${pwMsg.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                                color: pwMsg.type === 'success' ? '#16a34a' : '#ef4444',
                            }}>
                                {pwMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                                {pwMsg.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={pwLoading}
                            className="btn-primary"
                            style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
                        >
                            {pwLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
