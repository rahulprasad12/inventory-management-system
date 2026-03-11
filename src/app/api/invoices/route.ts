export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper to generate a sequential-looking invoice number
const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `INV-${year}${month}-${randomStr}`;
};

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        // Search invoices by customer name (elasticsearch style suggestion)
        if (query) {
            const allRecent = await prisma.invoice.findMany({
                take: 100, // Fetch recent 100 to filter in memory
                orderBy: { createdAt: 'desc' },
                include: {
                    items: { include: { product: true } }
                }
            });
            const qLower = query.toLowerCase();
            const filteredInvoices = allRecent
                .filter(inv => inv.customerName.toLowerCase().includes(qLower))
                .slice(0, 10);

            return NextResponse.json(filteredInvoices);
        }

        const allInvoices = await prisma.invoice.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        return NextResponse.json(allInvoices);
    } catch (error) {
        console.error('Failed to fetch invoices:', error);
        return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customerName, customerPhone, items } = body;

        if (!customerName || !items || !items.length) {
            return NextResponse.json({ error: 'Missing customer details or items' }, { status: 400 });
        }

        let subTotal = 0;
        let gstTotal = 0;
        let discountTotal = 0;

        // Run within a transaction to ensure atomic updates (Invoice creation + Inventory deduction)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await prisma.$transaction(async (tx: any) => {
            // 1. Validate items and calculate totals, and update stock
            const invoiceItemsData = [];

            for (const item of items) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });

                if (!product) throw new Error(`Product ${item.productId} not found`);
                if (product.stockQuantity < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`);
                }

                // Calculate item totals based on current product configuration
                const itemGross = product.price * item.quantity;
                const discountAmt = itemGross * (product.discountPercent / 100);
                const itemAfterDiscount = itemGross - discountAmt;
                const gstAmt = itemAfterDiscount * (product.gstPercent / 100);

                subTotal += itemGross;
                discountTotal += discountAmt;
                gstTotal += gstAmt;

                invoiceItemsData.push({
                    productId: product.id,
                    quantity: item.quantity,
                    priceAtTime: product.price,
                    gstAtTime: product.gstPercent,
                    discountAtTime: product.discountPercent,
                });

                // 2. Decrement product stock
                await tx.product.update({
                    where: { id: product.id },
                    data: { stockQuantity: { decrement: item.quantity } }
                });
            }

            const totalAmount = subTotal - discountTotal + gstTotal;
            const invoiceNumber = generateInvoiceNumber();

            // 3. Create the invoice
            const newInvoice = await tx.invoice.create({
                data: {
                    invoiceNumber,
                    customerName,
                    customerPhone: customerPhone || null,
                    subTotal,
                    gstTotal,
                    discountTotal,
                    totalAmount,
                    items: {
                        create: invoiceItemsData
                    }
                },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });

            return newInvoice;
        });

        return NextResponse.json(result, { status: 201 });

    } catch (error: any) {
        console.error('Failed to create invoice:', error);
        return NextResponse.json({ error: error.message || 'Failed to create invoice' }, { status: 500 });
    }
}
