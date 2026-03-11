import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DEFAULT_PERMISSIONS = {
    dashboard: true,
    products: true,
    invoices: true,
    analytics: true,
    settings: false,
};

export async function GET() {
    try {
        const roles = ['ADMIN', 'MANAGER', 'STAFF'];
        const dbRoles = await prisma.rolePermission.findMany();

        const mappedRoles = roles.map(role => {
            const found = dbRoles.find(r => r.role === role);
            return found || { role, permissions: role === 'ADMIN' ? { dashboard: true, products: true, invoices: true, analytics: true, settings: true } : DEFAULT_PERMISSIONS };
        });

        return NextResponse.json(mappedRoles);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { role, permissions } = await request.json();
        const updated = await prisma.rolePermission.upsert({
            where: { role },
            update: { permissions },
            create: { role, permissions },
        });
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update role permissions' }, { status: 500 });
    }
}
