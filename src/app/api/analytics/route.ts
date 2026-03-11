import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'day';
        const storeId = searchParams.get('storeId');

        // Set date boundaries
        const now = new Date();
        let startDate = new Date(0);

        if (period === 'day') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (period === 'week') {
            startDate = new Date(now);
            const day = startDate.getDay();
            const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            startDate.setDate(diff);
            startDate.setHours(0, 0, 0, 0);
        } else if (period === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        // Set query filters
        const whereClause: any = {};
        if (period !== 'all_time') {
            whereClause.createdAt = { gte: startDate };
        }
        if (storeId) {
            whereClause.storeId = storeId;
        }

        // Fetch all invoices in the period
        const invoices = await prisma.invoice.findMany({
            where: whereClause,
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        // 1. Revenue
        let totalEarnings = 0;
        let totalPaid = 0;

        invoices.forEach(inv => {
            totalEarnings += inv.totalAmount;
            totalPaid += inv.paidAmount;
        });

        const totalDue = totalEarnings - totalPaid;

        // 2. Revenue by Status
        // Count & Sum grouped by paymentStatus
        const revenueByStatus = {
            PENDING: { count: 0, sum: 0 },
            PARTIAL: { count: 0, sum: 0 },
            PAID: { count: 0, sum: 0 },
        };

        invoices.forEach(inv => {
            const status = inv.paymentStatus as 'PENDING' | 'PARTIAL' | 'PAID';
            if (revenueByStatus[status]) {
                revenueByStatus[status].count++;
                revenueByStatus[status].sum += inv.totalAmount;
            }
        });

        // 3. Sales by Product
        const productSalesMap = new Map<string, { id: string, name: string, quantity: number, revenue: number }>();
        // 4. Sales by Segment
        const segmentSalesMap = new Map<string, { name: string, quantity: number, revenue: number }>();

        invoices.forEach(inv => {
            inv.items.forEach(item => {
                const prodName = item.product?.name || 'Unknown Item';
                const section = item.product?.section || 'Uncategorized';
                const itemRevenue = item.priceAtTime * item.quantity; // Gross item revenue before invoice-level discount processing if we want pure product gross

                // Alternatively, computing line total with discount and GST
                const taxableAmt = (item.priceAtTime * item.quantity) * (1 - item.discountAtTime / 100);
                const finalAmt = taxableAmt * (1 + item.gstAtTime / 100);

                if (!productSalesMap.has(item.productId)) {
                    productSalesMap.set(item.productId, { id: item.productId, name: prodName, quantity: 0, revenue: 0 });
                }
                const prodStat = productSalesMap.get(item.productId)!;
                prodStat.quantity += item.quantity;
                prodStat.revenue += finalAmt;

                if (!segmentSalesMap.has(section)) {
                    segmentSalesMap.set(section, { name: section, quantity: 0, revenue: 0 });
                }
                const segStat = segmentSalesMap.get(section)!;
                segStat.quantity += item.quantity;
                segStat.revenue += finalAmt;
            });
        });

        const salesByProduct = Array.from(productSalesMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10); // Top 10
        const salesBySegment = Array.from(segmentSalesMap.values()).sort((a, b) => b.revenue - a.revenue);

        return NextResponse.json({
            revenue: { totalEarnings, totalPaid, totalDue },
            revenueByStatus,
            salesByProduct,
            salesBySegment
        });

    } catch (error) {
        console.error('Analytics Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
    }
}
