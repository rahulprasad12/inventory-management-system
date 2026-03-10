export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const sectionsOnly = searchParams.get('sectionsOnly');

        if (sectionsOnly === 'true') {
            // Get unique sections
            const sections = await prisma.product.findMany({
                select: { section: true },
                distinct: ['section'],
            });
            return NextResponse.json(sections.map((s: { section: string }) => s.section).filter(Boolean));
        }

        if (query) {
            // Elasticsearch-style autocomplete prefix match
            const products = await prisma.product.findMany({
                where: {
                    name: {
                        contains: query,
                        // sqlite doesn't support insensitive easily natively but prisma normally masks it. 
                    },
                },
                take: 10, // match limit for dropdown
                orderBy: { name: 'asc' }
            });
            return NextResponse.json(products);
        }

        const allProducts = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(allProducts);

    } catch (error) {
        console.error('Failed to fetch products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, sku, section, price, gstPercent, discountPercent, stockQuantity } = body;

        if (!name || !sku || price === undefined || stockQuantity === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                name,
                sku,
                section: section || 'Uncategorized',
                price: parseFloat(price),
                gstPercent: gstPercent ? parseFloat(gstPercent) : 0,
                discountPercent: discountPercent ? parseFloat(discountPercent) : 0,
                stockQuantity: parseInt(stockQuantity),
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error: unknown) {
        console.error('Failed to create product:', error);
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return NextResponse.json({ error: 'A product with this SKU already exists.' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
