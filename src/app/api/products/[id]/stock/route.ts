import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { stockQuantity } = body;

        if (stockQuantity === undefined || typeof stockQuantity !== 'number') {
            return NextResponse.json({ error: 'Invalid stock quantity' }, { status: 400 });
        }

        const product = await prisma.product.update({
            where: { id },
            data: { stockQuantity },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('Failed to update stock:', error);
        return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
    }
}
