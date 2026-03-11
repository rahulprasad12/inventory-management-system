import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter');
        const daysAhead = parseInt(searchParams.get('days') || '30');

        if (filter === 'near_expiry') {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() + daysAhead);
            const products = await prisma.product.findMany({
                where: { expiryDate: { not: null, lte: cutoff } },
                orderBy: { expiryDate: 'asc' },
                include: { store: true }
            });
            return NextResponse.json(products);
        }

        if (filter === 'low_stock') {
            const products = await prisma.product.findMany({
                orderBy: { stockQuantity: 'asc' },
                include: { store: true }
            });
            const lowStock = products.filter((p: any) => p.stockQuantity < p.lowStockThreshold);
            return NextResponse.json(lowStock.slice(0, 20));
        }

        // Default: return all products filtered optionally by storeId and search query
        const storeId = searchParams.get('storeId');
        const q = searchParams.get('q');
        const where: any = {};
        if (storeId) where.storeId = storeId;
        if (q) {
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { sku: { contains: q, mode: 'insensitive' } }
            ];
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: { name: 'asc' },
            include: { store: true }
        });
        return NextResponse.json(products);
    } catch (error) {
        console.error('Products API error:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            name, sku, section, price, gstPercent, discountPercent,
            stockQuantity, lowStockThreshold, cartonsCount, itemsPerCarton,
            measurementType, measurementValue, measurementUnit,
            expiryDate, storeId
        } = body;

        if (!name || !sku || !section || !price) {
            return NextResponse.json({ error: 'Name, SKU, section and price are required' }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                name, sku, section,
                price: parseFloat(price),
                gstPercent: parseFloat(gstPercent) || 0,
                discountPercent: parseFloat(discountPercent) || 0,
                stockQuantity: parseInt(stockQuantity) || 0,
                lowStockThreshold: parseInt(lowStockThreshold) || 10,
                cartonsCount: parseInt(cartonsCount) || 0,
                itemsPerCarton: parseInt(itemsPerCarton) || 0,
                measurementType: measurementType || null,
                measurementValue: measurementValue ? parseFloat(measurementValue) : null,
                measurementUnit: measurementUnit || null,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                storeId: storeId || null,
            }
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error: any) {
        console.error('Product POST error:', error);
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'A product with this SKU already exists.' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
