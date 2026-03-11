const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const now = new Date();
const daysFromNow = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

async function main() {
    console.log('🗑️  Clearing old data...');
    await prisma.invoiceItem.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.store.deleteMany({});
    console.log('✅ Cleared.\n');

    // ─── STORES ─────────────────────────────────────────────
    console.log('🏪 Creating stores...');
    const [storeA, storeB, storeC] = await Promise.all([
        prisma.store.create({ data: { name: 'QuickMart Superstore', branch: 'Koramangala', address: '12, 80 Feet Rd, Koramangala, Bengaluru – 560034', phone: '9900112233', gstin: '29ABCDE1234F1Z5' } }),
        prisma.store.create({ data: { name: 'QuickMart Superstore', branch: 'Indiranagar', address: '45, 100 Feet Rd, Indiranagar, Bengaluru – 560038', phone: '9900112244', gstin: '29ABCDE1234F2Z4' } }),
        prisma.store.create({ data: { name: 'QuickMart Superstore', branch: 'Whitefield', address: '7, ITPL Main Rd, Whitefield, Bengaluru – 560066', phone: '9900112255', gstin: '29ABCDE1234F3Z3' } }),
    ]);
    console.log(`✅ 3 stores created.\n`);

    const stores = [storeA, storeB, storeC];

    // ─── PRODUCTS (FMCG — 50+) ──────────────────────────────
    console.log('📦 Seeding 54 FMCG products across 3 stores...');

    const PRODUCTS = [
        // ── Dairy ────────────────────────────────────────────
        { name: 'Amul Full Cream Milk 1L', sku: 'DAIRY-001', section: 'Dairy', price: 68, discountPercent: 0, stockQuantity: 4, lowStockThreshold: 20, measurementType: 'volume', measurementValue: 1, measurementUnit: 'L', expiryDate: daysFromNow(4) },
        { name: 'Amul Butter 500g', sku: 'DAIRY-002', section: 'Dairy', price: 250, discountPercent: 2, stockQuantity: 6, lowStockThreshold: 10, measurementType: 'weight', measurementValue: 500, measurementUnit: 'g', expiryDate: daysFromNow(25) },
        { name: 'Nestlé Yogurt Mango 200g', sku: 'DAIRY-003', section: 'Dairy', price: 45, discountPercent: 0, stockQuantity: 12, lowStockThreshold: 15, measurementType: 'weight', measurementValue: 200, measurementUnit: 'g', expiryDate: daysFromNow(7) },
        { name: 'Amul Paneer 200g', sku: 'DAIRY-004', section: 'Dairy', price: 80, discountPercent: 0, stockQuantity: 3, lowStockThreshold: 10, measurementType: 'weight', measurementValue: 200, measurementUnit: 'g', expiryDate: daysFromNow(6) },
        { name: 'Mother Dairy Toned Milk 500ml', sku: 'DAIRY-005', section: 'Dairy', price: 30, discountPercent: 0, stockQuantity: 30, lowStockThreshold: 20, measurementType: 'volume', measurementValue: 500, measurementUnit: 'ml', expiryDate: daysFromNow(3) },

        // ── Beverages ─────────────────────────────────────────
        { name: 'Tropicana Orange Juice 1L', sku: 'BEV-001', section: 'Beverages', price: 120, discountPercent: 5, stockQuantity: 2, lowStockThreshold: 12, measurementType: 'volume', measurementValue: 1, measurementUnit: 'L', expiryDate: daysFromNow(30) },
        { name: 'Coca-Cola 2L', sku: 'BEV-002', section: 'Beverages', price: 95, discountPercent: 0, stockQuantity: 45, lowStockThreshold: 10, measurementType: 'volume', measurementValue: 2, measurementUnit: 'L', expiryDate: daysFromNow(180) },
        { name: 'Red Bull Energy Drink 250ml', sku: 'BEV-003', section: 'Beverages', price: 125, discountPercent: 0, stockQuantity: 8, lowStockThreshold: 15, measurementType: 'volume', measurementValue: 250, measurementUnit: 'ml', expiryDate: daysFromNow(90) },
        { name: 'Nescafé Classic Coffee 50g', sku: 'BEV-004', section: 'Beverages', price: 175, discountPercent: 3, stockQuantity: 20, lowStockThreshold: 8, measurementType: 'weight', measurementValue: 50, measurementUnit: 'g', expiryDate: daysFromNow(365) },
        { name: 'Lipton Green Tea 25 Bags', sku: 'BEV-005', section: 'Beverages', price: 120, discountPercent: 5, stockQuantity: 15, lowStockThreshold: 5, measurementType: 'pieces', measurementValue: 25, measurementUnit: 'pcs', expiryDate: daysFromNow(540) },

        // ── Snacks ───────────────────────────────────────────
        { name: "Lay's Classic Salted 150g", sku: 'SNACK-001', section: 'Snacks', price: 30, discountPercent: 0, stockQuantity: 50, lowStockThreshold: 20, measurementType: 'weight', measurementValue: 150, measurementUnit: 'g', expiryDate: daysFromNow(60) },
        { name: 'Bingo Mad Angles 160g', sku: 'SNACK-002', section: 'Snacks', price: 20, discountPercent: 0, stockQuantity: 5, lowStockThreshold: 20, measurementType: 'weight', measurementValue: 160, measurementUnit: 'g', expiryDate: daysFromNow(45) },
        { name: 'Haldiram Aloo Bhujia 400g', sku: 'SNACK-003', section: 'Snacks', price: 115, discountPercent: 0, stockQuantity: 25, lowStockThreshold: 10, measurementType: 'weight', measurementValue: 400, measurementUnit: 'g', expiryDate: daysFromNow(120) },
        { name: 'Oreo Cookies 300g', sku: 'SNACK-004', section: 'Snacks', price: 85, discountPercent: 5, stockQuantity: 7, lowStockThreshold: 15, measurementType: 'weight', measurementValue: 300, measurementUnit: 'g', expiryDate: daysFromNow(10) },
        { name: 'Britannia Good Day Butter 200g', sku: 'SNACK-005', section: 'Snacks', price: 40, discountPercent: 0, stockQuantity: 40, lowStockThreshold: 10, measurementType: 'weight', measurementValue: 200, measurementUnit: 'g', expiryDate: daysFromNow(90) },
        { name: 'Parle-G Original Biscuits 800g', sku: 'SNACK-006', section: 'Snacks', price: 60, discountPercent: 0, stockQuantity: 60, lowStockThreshold: 15, measurementType: 'weight', measurementValue: 800, measurementUnit: 'g', expiryDate: daysFromNow(150) },
        { name: 'Act II Microwave Popcorn 3-pack', sku: 'SNACK-007', section: 'Snacks', price: 90, discountPercent: 0, stockQuantity: 18, lowStockThreshold: 8, measurementType: 'pieces', measurementValue: 3, measurementUnit: 'pcs', expiryDate: daysFromNow(240) },

        // ── Staples / Grains ──────────────────────────────────
        { name: 'India Gate Basmati Rice 5kg', sku: 'GRAIN-001', section: 'Staples', price: 430, discountPercent: 3, stockQuantity: 2, lowStockThreshold: 10, measurementType: 'weight', measurementValue: 5, measurementUnit: 'kg', expiryDate: daysFromNow(730) },
        { name: 'Aashirvaad Atta 5kg', sku: 'GRAIN-002', section: 'Staples', price: 265, discountPercent: 0, stockQuantity: 14, lowStockThreshold: 10, measurementType: 'weight', measurementValue: 5, measurementUnit: 'kg', expiryDate: daysFromNow(180) },
        { name: 'Tata Salt 1kg', sku: 'GRAIN-003', section: 'Staples', price: 22, discountPercent: 0, stockQuantity: 80, lowStockThreshold: 20, measurementType: 'weight', measurementValue: 1, measurementUnit: 'kg', expiryDate: daysFromNow(1800) },
        { name: 'Fortune Sunflower Oil 1L', sku: 'GRAIN-004', section: 'Staples', price: 150, discountPercent: 0, stockQuantity: 30, lowStockThreshold: 15, measurementType: 'volume', measurementValue: 1, measurementUnit: 'L', expiryDate: daysFromNow(365) },
        { name: 'Tata Sampann Moong Dal 500g', sku: 'GRAIN-005', section: 'Staples', price: 80, discountPercent: 0, stockQuantity: 1, lowStockThreshold: 10, measurementType: 'weight', measurementValue: 500, measurementUnit: 'g', expiryDate: daysFromNow(540) },
        { name: 'Saffola Active Refined Oil 2L', sku: 'GRAIN-006', section: 'Staples', price: 310, discountPercent: 2, stockQuantity: 22, lowStockThreshold: 10, measurementType: 'volume', measurementValue: 2, measurementUnit: 'L', expiryDate: daysFromNow(300) },

        // ── Personal Care ─────────────────────────────────────
        { name: 'Dove Soap Bar 100g (Pack of 4)', sku: 'CARE-001', section: 'Personal Care', price: 180, discountPercent: 5, stockQuantity: 3, lowStockThreshold: 12, measurementType: 'weight', measurementValue: 400, measurementUnit: 'g', expiryDate: daysFromNow(730) },
        { name: "Head & Shoulders Shampoo 400ml", sku: 'CARE-002', section: 'Personal Care', price: 320, discountPercent: 10, stockQuantity: 9, lowStockThreshold: 8, measurementType: 'volume', measurementValue: 400, measurementUnit: 'ml', expiryDate: daysFromNow(730) },
        { name: 'Colgate MaxFresh Toothpaste 150g', sku: 'CARE-003', section: 'Personal Care', price: 85, discountPercent: 0, stockQuantity: 35, lowStockThreshold: 10, measurementType: 'weight', measurementValue: 150, measurementUnit: 'g', expiryDate: daysFromNow(1095) },
        { name: 'Nivea Body Lotion 400ml', sku: 'CARE-004', section: 'Personal Care', price: 299, discountPercent: 8, stockQuantity: 11, lowStockThreshold: 5, measurementType: 'volume', measurementValue: 400, measurementUnit: 'ml', expiryDate: daysFromNow(1095) },
        { name: 'Dettol Soap 75g', sku: 'CARE-005', section: 'Personal Care', price: 48, discountPercent: 0, stockQuantity: 4, lowStockThreshold: 20, measurementType: 'weight', measurementValue: 75, measurementUnit: 'g', expiryDate: daysFromNow(730) },

        // ── Household Cleaning ─────────────────────────────────
        { name: 'Vim Dishwash Bar 200g (pack 2)', sku: 'CLEAN-001', section: 'Household', price: 44, discountPercent: 0, stockQuantity: 30, lowStockThreshold: 15, measurementType: 'weight', measurementValue: 400, measurementUnit: 'g', expiryDate: daysFromNow(730) },
        { name: 'Surf Excel Easy Wash 1kg', sku: 'CLEAN-002', section: 'Household', price: 130, discountPercent: 0, stockQuantity: 5, lowStockThreshold: 10, measurementType: 'weight', measurementValue: 1, measurementUnit: 'kg', expiryDate: daysFromNow(1095) },
        { name: 'Harpic Power Plus 500ml', sku: 'CLEAN-003', section: 'Household', price: 145, discountPercent: 5, stockQuantity: 20, lowStockThreshold: 8, measurementType: 'volume', measurementValue: 500, measurementUnit: 'ml', expiryDate: daysFromNow(1095) },
        { name: 'Colin Glass Cleaner 500ml', sku: 'CLEAN-004', section: 'Household', price: 120, discountPercent: 0, stockQuantity: 2, lowStockThreshold: 8, measurementType: 'volume', measurementValue: 500, measurementUnit: 'ml', expiryDate: daysFromNow(1825) },

        // ── Packaged Foods ────────────────────────────────────
        { name: 'Maggi 2-Minute Noodles 12-pack', sku: 'FOOD-001', section: 'Packaged Foods', price: 228, discountPercent: 3, stockQuantity: 18, lowStockThreshold: 10, measurementType: 'pieces', measurementValue: 12, measurementUnit: 'pcs', expiryDate: daysFromNow(270) },
        { name: "Heinz Tomato Ketchup 500g", sku: 'FOOD-002', section: 'Packaged Foods', price: 145, discountPercent: 0, stockQuantity: 14, lowStockThreshold: 8, measurementType: 'weight', measurementValue: 500, measurementUnit: 'g', expiryDate: daysFromNow(365) },
        { name: 'MTR Ready-to-Eat Dal Makhani 300g', sku: 'FOOD-003', section: 'Packaged Foods', price: 90, discountPercent: 0, stockQuantity: 6, lowStockThreshold: 8, measurementType: 'weight', measurementValue: 300, measurementUnit: 'g', expiryDate: daysFromNow(12) },
        { name: 'Knorr Chicken Soup Mix 46g', sku: 'FOOD-004', section: 'Packaged Foods', price: 55, discountPercent: 0, stockQuantity: 25, lowStockThreshold: 5, measurementType: 'weight', measurementValue: 46, measurementUnit: 'g', expiryDate: daysFromNow(365) },
        { name: 'Kissan Mixed Fruit Jam 500g', sku: 'FOOD-005', section: 'Packaged Foods', price: 138, discountPercent: 5, stockQuantity: 3, lowStockThreshold: 8, measurementType: 'weight', measurementValue: 500, measurementUnit: 'g', expiryDate: daysFromNow(365) },
        { name: 'Amul Dark Chocolate 150g', sku: 'FOOD-006', section: 'Packaged Foods', price: 75, discountPercent: 0, stockQuantity: 20, lowStockThreshold: 10, measurementType: 'weight', measurementValue: 150, measurementUnit: 'g', expiryDate: daysFromNow(8) },
        { name: 'Pedigree Dry Dog Food Adult 3kg', sku: 'FOOD-007', section: 'Packaged Foods', price: 780, discountPercent: 5, stockQuantity: 7, lowStockThreshold: 5, measurementType: 'weight', measurementValue: 3, measurementUnit: 'kg', expiryDate: daysFromNow(365) },

        // ── Baby & Infant ─────────────────────────────────────
        { name: 'Nestlé Cerelac Rice 300g', sku: 'BABY-001', section: 'Baby Care', price: 195, discountPercent: 0, stockQuantity: 9, lowStockThreshold: 5, measurementType: 'weight', measurementValue: 300, measurementUnit: 'g', expiryDate: daysFromNow(240) },
        { name: 'Pampers Active Diapers S 60pcs', sku: 'BABY-002', section: 'Baby Care', price: 649, discountPercent: 10, stockQuantity: 4, lowStockThreshold: 5, measurementType: 'pieces', measurementValue: 60, measurementUnit: 'pcs', expiryDate: daysFromNow(1095) },
        { name: "Johnson's Baby Powder 200g", sku: 'BABY-003', section: 'Baby Care', price: 185, discountPercent: 0, stockQuantity: 13, lowStockThreshold: 5, measurementType: 'weight', measurementValue: 200, measurementUnit: 'g', expiryDate: daysFromNow(1095) },

        // ── Frozen & Chilled ──────────────────────────────────
        { name: 'McCain French Fries 400g', sku: 'FROZEN-001', section: 'Frozen Foods', price: 135, discountPercent: 0, stockQuantity: 1, lowStockThreshold: 8, measurementType: 'weight', measurementValue: 400, measurementUnit: 'g', expiryDate: daysFromNow(180) },
        { name: 'Kwality Walls Vanilla Ice Cream 700ml', sku: 'FROZEN-002', section: 'Frozen Foods', price: 175, discountPercent: 5, stockQuantity: 10, lowStockThreshold: 6, measurementType: 'volume', measurementValue: 700, measurementUnit: 'ml', expiryDate: daysFromNow(90) },
        { name: 'ITC Master Chef Seekh Kebab 250g', sku: 'FROZEN-003', section: 'Frozen Foods', price: 210, discountPercent: 0, stockQuantity: 5, lowStockThreshold: 5, measurementType: 'weight', measurementValue: 250, measurementUnit: 'g', expiryDate: daysFromNow(60) },

        // ── Health & Wellness ─────────────────────────────────
        { name: 'Revital H Capsules 30s', sku: 'HEALTH-001', section: 'Health', price: 380, discountPercent: 0, stockQuantity: 12, lowStockThreshold: 5, measurementType: 'pieces', measurementValue: 30, measurementUnit: 'pcs', expiryDate: daysFromNow(18) },
        { name: 'Dabur Chyawanprash 500g', sku: 'HEALTH-002', section: 'Health', price: 225, discountPercent: 5, stockQuantity: 3, lowStockThreshold: 5, measurementType: 'weight', measurementValue: 500, measurementUnit: 'g', expiryDate: daysFromNow(540) },
        { name: 'Himalaya Ashwagandha 60 Tabs', sku: 'HEALTH-003', section: 'Health', price: 215, discountPercent: 0, stockQuantity: 8, lowStockThreshold: 5, measurementType: 'pieces', measurementValue: 60, measurementUnit: 'pcs', expiryDate: daysFromNow(730) },
        { name: 'Ensure Nutrition Powder Vanilla 400g', sku: 'HEALTH-004', section: 'Health', price: 650, discountPercent: 3, stockQuantity: 2, lowStockThreshold: 5, measurementType: 'weight', measurementValue: 400, measurementUnit: 'g', expiryDate: daysFromNow(365) },

        // ── Condiments ─────────────────────────────────────────
        { name: 'MDH Garam Masala 100g', sku: 'SPICE-001', section: 'Condiments', price: 60, discountPercent: 0, stockQuantity: 35, lowStockThreshold: 10, measurementType: 'weight', measurementValue: 100, measurementUnit: 'g', expiryDate: daysFromNow(540) },
        { name: "Everest Pav Bhaji Masala 50g", sku: 'SPICE-002', section: 'Condiments', price: 37, discountPercent: 0, stockQuantity: 4, lowStockThreshold: 10, measurementType: 'weight', measurementValue: 50, measurementUnit: 'g', expiryDate: daysFromNow(365) },
        { name: 'Keya Herbs Italian Seasoning 25g', sku: 'SPICE-003', section: 'Condiments', price: 85, discountPercent: 5, stockQuantity: 15, lowStockThreshold: 5, measurementType: 'weight', measurementValue: 25, measurementUnit: 'g', expiryDate: daysFromNow(730) },
        { name: 'Veeba Chipotle Mayo 300g', sku: 'SPICE-004', section: 'Condiments', price: 145, discountPercent: 0, stockQuantity: 3, lowStockThreshold: 5, measurementType: 'weight', measurementValue: 300, measurementUnit: 'g', expiryDate: daysFromNow(11) },

        // ── Fruits & Veggies (Packaged) ─────────────────────────
        { name: 'Del Monte Corn Kernels Can 418g', sku: 'VEG-001', section: 'Canned & Preserved', price: 105, discountPercent: 0, stockQuantity: 22, lowStockThreshold: 8, measurementType: 'weight', measurementValue: 418, measurementUnit: 'g', expiryDate: daysFromNow(1095) },
        { name: 'Safal Frozen Green Peas 500g', sku: 'VEG-002', section: 'Frozen Foods', price: 70, discountPercent: 0, stockQuantity: 6, lowStockThreshold: 10, measurementType: 'weight', measurementValue: 500, measurementUnit: 'g', expiryDate: daysFromNow(180) },
        { name: 'B Natural Mixed Berries Juice 1L', sku: 'VEG-003', section: 'Beverages', price: 110, discountPercent: 5, stockQuantity: 9, lowStockThreshold: 8, measurementType: 'volume', measurementValue: 1, measurementUnit: 'L', expiryDate: daysFromNow(5) },
    ];

    const storeAssignment = [storeA.id, storeA.id, storeA.id, storeA.id, storeA.id, storeA.id, storeA.id, storeA.id, storeA.id, storeA.id, storeA.id, storeA.id, storeA.id, storeA.id, storeA.id, storeA.id, storeA.id, storeA.id, storeB.id, storeB.id, storeB.id, storeB.id, storeB.id, storeB.id, storeB.id, storeB.id, storeB.id, storeB.id, storeB.id, storeB.id, storeB.id, storeB.id, storeB.id, storeB.id, storeB.id, storeB.id, storeC.id, storeC.id, storeC.id, storeC.id, storeC.id, storeC.id, storeC.id, storeC.id, storeC.id, storeC.id, storeC.id, storeC.id, storeC.id, storeC.id, storeC.id, storeC.id, storeC.id, storeC.id];

    const createdProducts = [];
    for (let i = 0; i < PRODUCTS.length; i++) {
        const p = PRODUCTS[i];
        const prod = await prisma.product.create({
            data: { ...p, gstPercent: 0, storeId: storeAssignment[i] }
        });
        createdProducts.push(prod);
    }
    const byStore = {};
    for (const p of createdProducts) {
        if (!byStore[p.storeId]) byStore[p.storeId] = [];
        byStore[p.storeId].push(p);
    }
    console.log(`✅ ${createdProducts.length} products created.\n`);

    // ─── INVOICES — 4 per store ──────────────────────────────
    console.log('🧾 Seeding invoices (4 per store)...');

    const invoiceDefs = [
        // ── Store A (Koramangala) ──
        { store: storeA, num: 'INV-2026-K001', customer: 'Rohit Nair', phone: '9845001122', status: 'PAID', paidAmount: null, items: ['DAIRY-001', 'DAIRY-002', 'SNACK-001', 'BEV-002'], date: daysAgo(2) },
        { store: storeA, num: 'INV-2026-K002', customer: 'Priya Menon', phone: '9845002233', status: 'PARTIAL', paidAmount: 400, items: ['GRAIN-001', 'GRAIN-002', 'CLEAN-001'], date: daysAgo(5) },
        { store: storeA, num: 'INV-2026-K003', customer: 'Suresh Babu', phone: '9845003344', status: 'PENDING', paidAmount: 0, items: ['FOOD-001', 'FOOD-002', 'BEV-004', 'SNACK-003'], date: daysAgo(1) },
        { store: storeA, num: 'INV-2026-K004', customer: 'Ananya Krishnan', phone: '9845004455', status: 'PAID', paidAmount: null, items: ['CARE-001', 'CARE-002', 'HEALTH-002', 'VEG-001'], date: daysAgo(10) },
        // ── Store B (Indiranagar) ──
        { store: storeB, num: 'INV-2026-I001', customer: 'Faraz Shaikh', phone: '9876101010', status: 'PAID', paidAmount: null, items: ['BEV-001', 'BEV-005', 'SNACK-004', 'SNACK-005'], date: daysAgo(3) },
        { store: storeB, num: 'INV-2026-I002', customer: 'Deepa Rao', phone: '9876202020', status: 'PENDING', paidAmount: 0, items: ['CLEAN-002', 'CLEAN-003', 'CARE-003'], date: daysAgo(1) },
        { store: storeB, num: 'INV-2026-I003', customer: 'Aakash Gupta', phone: '9876303030', status: 'PARTIAL', paidAmount: 600, items: ['FOOD-003', 'FOOD-005', 'HEALTH-001', 'BABY-001'], date: daysAgo(7) },
        { store: storeB, num: 'INV-2026-I004', customer: 'Meera Pillai', phone: '9876404040', status: 'PAID', paidAmount: null, items: ['FROZEN-002', 'FROZEN-003', 'VEG-002', 'SNACK-006'], date: daysAgo(4) },
        // ── Store C (Whitefield) ──
        { store: storeC, num: 'INV-2026-W001', customer: 'Kiran Reddy', phone: '9654101010', status: 'PAID', paidAmount: null, items: ['GRAIN-004', 'GRAIN-005', 'SPICE-001', 'BEV-003'], date: daysAgo(2) },
        { store: storeC, num: 'INV-2026-W002', customer: 'Sunita Shah', phone: '9654202020', status: 'PENDING', paidAmount: 0, items: ['FOOD-006', 'FOOD-007', 'SNACK-007'], date: daysAgo(6) },
        { store: storeC, num: 'INV-2026-W003', customer: 'Vijay Malhotra', phone: '9654303030', status: 'PARTIAL', paidAmount: 500, items: ['BABY-002', 'BABY-003', 'CARE-004', 'CARE-005'], date: daysAgo(3) },
        { store: storeC, num: 'INV-2026-W004', customer: 'Ritu Sharma', phone: '9654404040', status: 'PAID', paidAmount: null, items: ['HEALTH-003', 'HEALTH-004', 'SPICE-002', 'SPICE-004'], date: daysAgo(9) },
    ];

    const productMap = {};
    for (const p of createdProducts) productMap[p.sku] = p;

    let invoiceCount = 0;
    for (const inv of invoiceDefs) {
        let subTotal = 0, discountTotal = 0;
        for (const sku of inv.items) {
            const p = productMap[sku];
            if (!p) { console.warn(`  ⚠ SKU not found: ${sku}`); continue; }
            const gross = p.price;
            subTotal += gross;
            discountTotal += gross * (p.discountPercent / 100);
        }
        const totalAmount = subTotal - discountTotal;
        const paidAmount = inv.status === 'PAID' ? totalAmount : (inv.paidAmount || 0);

        await prisma.invoice.create({
            data: {
                invoiceNumber: inv.num,
                customerName: inv.customer,
                customerPhone: inv.phone,
                subTotal, discountTotal, gstTotal: 0, totalAmount,
                paymentStatus: inv.status,
                paidAmount,
                storeId: inv.store.id,
                createdAt: inv.date,
                items: {
                    create: inv.items.filter(sku => !!productMap[sku]).map(sku => {
                        const p = productMap[sku];
                        return { productId: p.id, quantity: 1, priceAtTime: p.price, gstAtTime: 0, discountAtTime: p.discountPercent };
                    })
                }
            }
        });
        console.log(`  ✓ ${inv.num} — ${inv.customer} (${inv.status}) — ₹${totalAmount.toFixed(0)}`);
        invoiceCount++;
    }

    console.log(`\n✅ Done! 3 stores | ${createdProducts.length} FMCG products | ${invoiceCount} invoices`);
    console.log('\n📊 Simulation coverage:');
    console.log('  🔴 Critical expiry (≤7 days):  Amul Milk, B Natural Juice, Mother Dairy Milk, Oreo Cookies, MTR Dal Makhani, Veeba Mayo, Amul Dark Choc, Revital H Caps');
    console.log('  🟡 Near expiry (8–14 days):    Nestlé Yogurt, Amul Paneer');
    console.log('  🟠 Low stock (≤5 units):       Amul Paneer, Tata Sampann Dal, McCain Fries, Ensure, Pampers, Veeba Mayo');
}

main()
    .catch(e => { console.error('Seed error:', e.message); process.exit(1); })
    .finally(() => prisma.$disconnect());
