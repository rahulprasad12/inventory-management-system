import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const stores = await prisma.store.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { products: true, invoices: true } }
            }
        });
        return NextResponse.json(stores);
    } catch (error) {
        console.error('Stores GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, branch, address, phone, gstin } = body;
        if (!name) return NextResponse.json({ error: 'Store name is required' }, { status: 400 });

        const store = await prisma.store.create({
            data: { name, branch, address, phone, gstin }
        });
        return NextResponse.json(store, { status: 201 });
    } catch (error) {
        console.error('Stores POST error:', error);
        return NextResponse.json({ error: 'Failed to create store' }, { status: 500 });
    }
}
