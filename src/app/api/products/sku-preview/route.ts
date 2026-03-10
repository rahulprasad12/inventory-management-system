import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';

    const prefix = category
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 5);

    const count = await prisma.product.count({
        where: { section: { equals: category } },
    });

    const sku = `${prefix}-${String(count + 1).padStart(3, '0')}`;
    return NextResponse.json({ sku });
}
