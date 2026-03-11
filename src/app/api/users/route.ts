import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, username: true, role: true, createdAt: true },
            orderBy: { createdAt: 'asc' }
        });
        return NextResponse.json(users);
    } catch (error) {
        console.error('Users GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { name, username, password, role } = await request.json();
        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }
        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name: name || username, username, password: hashed, role: role || 'STAFF' },
            select: { id: true, name: true, username: true, role: true, createdAt: true }
        });
        return NextResponse.json(user, { status: 201 });
    } catch (error: any) {
        if (error?.code === 'P2002') return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
        console.error('Users POST error:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
