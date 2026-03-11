import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const updateData: Record<string, unknown> = {};

        if (body.name) updateData.name = body.name;
        if (body.role) updateData.role = body.role;
        if (body.password) updateData.password = await bcrypt.hash(body.password, 10);

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: { id: true, name: true, username: true, role: true, createdAt: true }
        });
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.user.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
