import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: { items: { include: { product: true } } },
    });
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(invoice);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json();
    const { paymentStatus, paidAmount } = body;

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await prisma.invoice.update({
        where: { id },
        data: {
            paymentStatus: paymentStatus ?? invoice.paymentStatus,
            paidAmount: paidAmount !== undefined ? paidAmount : invoice.paidAmount,
        },
    });
    return NextResponse.json(updated);
}
