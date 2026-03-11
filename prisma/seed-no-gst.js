const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Cleaning existing invoices...');
    await prisma.invoiceItem.deleteMany({});
    await prisma.invoice.deleteMany({});
    console.log('✅ Invoices cleared.');

    console.log('📦 Seeding products...');
    const products = await Promise.all([
        prisma.product.upsert({ where: { sku: 'ELEC-001' }, update: {}, create: { name: 'MacBook Air M2', sku: 'ELEC-001', section: 'Electronics', price: 99900, gstPercent: 0, discountPercent: 5, stockQuantity: 15 } }),
        prisma.product.upsert({ where: { sku: 'ELEC-002' }, update: {}, create: { name: 'Dell XPS 13 Laptop', sku: 'ELEC-002', section: 'Electronics', price: 85000, gstPercent: 0, discountPercent: 3, stockQuantity: 8 } }),
        prisma.product.upsert({ where: { sku: 'ELEC-003' }, update: {}, create: { name: 'Sony WH-1000XM5 Headphones', sku: 'ELEC-003', section: 'Electronics', price: 29990, gstPercent: 0, discountPercent: 10, stockQuantity: 25 } }),
        prisma.product.upsert({ where: { sku: 'ELEC-004' }, update: {}, create: { name: 'Apple iPhone 15 Pro', sku: 'ELEC-004', section: 'Electronics', price: 134900, gstPercent: 0, discountPercent: 0, stockQuantity: 12 } }),
        prisma.product.upsert({ where: { sku: 'ELEC-005' }, update: {}, create: { name: 'Samsung Galaxy Tab S9', sku: 'ELEC-005', section: 'Electronics', price: 72999, gstPercent: 0, discountPercent: 8, stockQuantity: 6 } }),
        prisma.product.upsert({ where: { sku: 'FURN-001' }, update: {}, create: { name: 'Ergonomic Office Chair', sku: 'FURN-001', section: 'Furniture', price: 18500, gstPercent: 0, discountPercent: 5, stockQuantity: 20 } }),
        prisma.product.upsert({ where: { sku: 'FURN-002' }, update: {}, create: { name: 'Standing Desk (Electric)', sku: 'FURN-002', section: 'Furniture', price: 32000, gstPercent: 0, discountPercent: 0, stockQuantity: 10 } }),
        prisma.product.upsert({ where: { sku: 'FURN-003' }, update: {}, create: { name: '4-Shelf Bookcase', sku: 'FURN-003', section: 'Furniture', price: 8500, gstPercent: 0, discountPercent: 0, stockQuantity: 30 } }),
        prisma.product.upsert({ where: { sku: 'STAT-001' }, update: {}, create: { name: 'A4 Paper Ream (500 Sheets)', sku: 'STAT-001', section: 'Stationery', price: 450, gstPercent: 0, discountPercent: 0, stockQuantity: 200 } }),
        prisma.product.upsert({ where: { sku: 'STAT-002' }, update: {}, create: { name: 'Whiteboard Marker Set (12pcs)', sku: 'STAT-002', section: 'Stationery', price: 350, gstPercent: 0, discountPercent: 0, stockQuantity: 150 } }),
        prisma.product.upsert({ where: { sku: 'NETW-001' }, update: {}, create: { name: 'TP-Link Wi-Fi 6 Router', sku: 'NETW-001', section: 'Networking', price: 7999, gstPercent: 0, discountPercent: 5, stockQuantity: 18 } }),
        prisma.product.upsert({ where: { sku: 'NETW-002' }, update: {}, create: { name: 'Cat6 Ethernet Cable (20m)', sku: 'NETW-002', section: 'Networking', price: 850, gstPercent: 0, discountPercent: 0, stockQuantity: 50 } }),
    ]);
    console.log(`✅ ${products.length} products upserted.`);

    const productMap = {};
    for (const p of products) productMap[p.sku] = p;

    function calcTotals(items) {
        let subTotal = 0, discountTotal = 0;
        for (const item of items) {
            const p = productMap[item.sku];
            const gross = p.price * item.qty;
            const disc = gross * (p.discountPercent / 100);
            subTotal += gross;
            discountTotal += disc;
        }
        return { subTotal, discountTotal, gstTotal: 0, totalAmount: subTotal - discountTotal };
    }

    console.log('🧾 Seeding invoices (no GST)...');
    const invoiceData = [
        { invoiceNumber: 'INV-2026-001', customerName: 'Rajesh Kumar', customerPhone: '9876543210', items: [{ sku: 'ELEC-001', qty: 1 }, { sku: 'NETW-001', qty: 1 }] },
        { invoiceNumber: 'INV-2026-002', customerName: 'Priya Sharma', customerPhone: '9123456789', items: [{ sku: 'ELEC-003', qty: 2 }, { sku: 'STAT-001', qty: 5 }] },
        { invoiceNumber: 'INV-2026-003', customerName: 'Amit Verma', customerPhone: '9988776655', items: [{ sku: 'ELEC-004', qty: 1 }, { sku: 'ELEC-005', qty: 1 }] },
        { invoiceNumber: 'INV-2026-004', customerName: 'Sunita Patel', customerPhone: '9871234567', items: [{ sku: 'FURN-001', qty: 2 }, { sku: 'FURN-003', qty: 3 }] },
        { invoiceNumber: 'INV-2026-005', customerName: 'Vikram Singh', customerPhone: '9955443322', items: [{ sku: 'ELEC-002', qty: 1 }, { sku: 'NETW-001', qty: 1 }, { sku: 'NETW-002', qty: 3 }] },
    ];

    for (const inv of invoiceData) {
        const { subTotal, discountTotal, gstTotal, totalAmount } = calcTotals(inv.items);
        await prisma.invoice.create({
            data: {
                invoiceNumber: inv.invoiceNumber,
                customerName: inv.customerName,
                customerPhone: inv.customerPhone,
                subTotal,
                discountTotal,
                gstTotal: 0,
                totalAmount,
                paymentStatus: 'PENDING',
                paidAmount: 0,
                items: {
                    create: inv.items.map(item => {
                        const p = productMap[item.sku];
                        return {
                            productId: p.id,
                            quantity: item.qty,
                            priceAtTime: p.price,
                            gstAtTime: 0,
                            discountAtTime: p.discountPercent,
                        };
                    }),
                },
            },
        });
        console.log(`  ✓ Created ${inv.invoiceNumber} for ${inv.customerName} — ₹${totalAmount.toLocaleString('en-IN')}`);
    }

    console.log('\n✅ Seeding complete! 5 invoices created with no GST.');
}

main()
    .catch(e => { console.error('Error:', e.message); process.exit(1); })
    .finally(() => prisma.$disconnect());
