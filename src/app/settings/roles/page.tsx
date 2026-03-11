'use client';

import { useState, useEffect } from 'react';
import { Shield, Save, Loader2, CheckSquare, Square, Info } from 'lucide-react';

interface RolePermissions {
    role: string;
    permissions: {
        dashboard: boolean;
        products: boolean;
        invoices: boolean;
        analytics: boolean;
        settings: boolean;
    };
}

const SECTIONS = [
    { key: 'dashboard', label: 'Dashboard', desc: 'View metrics and recent activity' },
    { key: 'products', label: 'Products & Inventory', desc: 'Manage products, stock, and categories' },
    { key: 'invoices', label: 'Invoices', desc: 'Create and view invoices' },
    { key: 'analytics', label: 'Analytics', desc: 'View revenue charts and reports' },
    { key: 'settings', label: 'System Settings', desc: 'Manage stores, users, and roles' },
];

export default function RolesPage() {
    const [roles, setRoles] = useState<RolePermissions[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/roles').then(r => r.json()).then(d => { setRoles(d); setLoading(false); });
    }, []);

    const togglePermission = (role: string, section: keyof RolePermissions['permissions']) => {
        if (role === 'ADMIN') return; // Admin permissions cannot be changed
        setRoles(roles.map(r => {
            if (r.role === role) {
                return { ...r, permissions: { ...r.permissions, [section]: !r.permissions[section] } };
            }
            return r;
        }));
    };

    const handleSave = async (roleObj: RolePermissions) => {
        setSaving(roleObj.role);
        try {
            await fetch('/api/roles', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: roleObj.role, permissions: roleObj.permissions })
            });
            // Show brief success (could use a toast)
        } finally {
            setSaving(null);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={32} /></div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="page-title"><Shield style={{ display: 'inline', marginRight: '0.75rem' }} />Role Permissions</h1>
                <p className="page-description">Configure which sections of the app each user role can access.</p>
            </div>

            <div className="card glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                            <th style={{ padding: '1rem', width: '25%' }}>Section</th>
                            <th style={{ padding: '1rem', width: '25%' }}>Admin <span title="Full access"><Info size={12} style={{ display: 'inline', color: '#94a3b8' }} /></span></th>
                            <th style={{ padding: '1rem', width: '25%' }}>Manager</th>
                            <th style={{ padding: '1rem', width: '25%' }}>Staff</th>
                        </tr>
                    </thead>
                    <tbody>
                        {SECTIONS.map((section, idx) => (
                            <tr key={section.key} style={{ borderBottom: idx === SECTIONS.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1.25rem 1rem' }}>
                                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{section.label}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{section.desc}</div>
                                </td>
                                {['ADMIN', 'MANAGER', 'STAFF'].map(roleName => {
                                    const roleObj = roles.find(r => r.role === roleName);
                                    if (!roleObj) return <td key={roleName} />;

                                    const hasPerm = roleObj.permissions[section.key as keyof RolePermissions['permissions']];
                                    const isAdmin = roleName === 'ADMIN';

                                    return (
                                        <td key={roleName} style={{ padding: '1rem' }} onClick={() => togglePermission(roleName, section.key as keyof RolePermissions['permissions'])}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isAdmin ? 'not-allowed' : 'pointer', opacity: isAdmin ? 0.6 : 1 }}>
                                                {hasPerm ?
                                                    <CheckSquare size={20} style={{ color: 'var(--primary)' }} /> :
                                                    <Square size={20} style={{ color: '#cbd5e1' }} />
                                                }
                                                <span style={{ fontSize: '0.875rem', color: hasPerm ? '#1e293b' : '#94a3b8', fontWeight: hasPerm ? 600 : 400 }}>
                                                    {hasPerm ? 'Allowed' : 'Denied'}
                                                </span>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Save Buttons Row */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '2rem', marginTop: '1.5rem', padding: '0 1rem' }}>
                {['MANAGER', 'STAFF'].map(roleName => {
                    const roleObj = roles.find(r => r.role === roleName);
                    const isSaving = saving === roleName;
                    return (
                        <div key={roleName} style={{ width: '25%', paddingLeft: '1rem' }}>
                            <button
                                onClick={() => roleObj && handleSave(roleObj)}
                                disabled={isSaving || !roleObj}
                                className="btn-secondary"
                                style={{ width: '100%', justifyContent: 'center', background: 'white' }}
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Save {roleName === 'MANAGER' ? 'Manager' : 'Staff'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
