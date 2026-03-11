import Link from 'next/link';
import { Package, FileText, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import AlertsWidget from '@/components/AlertsWidget';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const [
    totalProducts,
    totalInvoices,
    recentInvoices,
    allProducts,
    revenueData
  ] = await Promise.all([
    prisma.product.count(),
    prisma.invoice.count(),
    prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { items: true, store: true }
    }),
    prisma.product.findMany({ select: { stockQuantity: true, lowStockThreshold: true } }),
    prisma.invoice.aggregate({ _sum: { totalAmount: true } })
  ]);

  const totalRevenue = revenueData._sum.totalAmount || 0;
  const lowStockCount = allProducts.filter(p => p.stockQuantity < p.lowStockThreshold).length;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-description">Welcome to your inventory and invoice management system.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/products/add" className="btn-secondary">
            <Plus size={18} /> Add Product
          </Link>
          <Link href="/invoices/new" className="btn-primary">
            <FileText size={18} /> Make Invoice
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card glass-panel" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Total Products</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--foreground)' }}>{totalProducts}</h3>
          </div>
          <div style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '0.5rem' }}>
            <Package size={24} />
          </div>
        </div>

        <div className="card glass-panel" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Total Invoices</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--foreground)' }}>{totalInvoices}</h3>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.75rem', borderRadius: '0.5rem' }}>
            <FileText size={24} />
          </div>
        </div>

        <div className="card glass-panel" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Total Revenue</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '0.75rem', borderRadius: '0.5rem', flexShrink: 0 }}>
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="card glass-panel" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Low Stock Items</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--foreground)' }}>{lowStockCount}</h3>
          </div>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--destructive)', padding: '0.75rem', borderRadius: '0.5rem' }}>
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '1.5rem' }}>
        {/* Recent Invoices */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Recent Invoices</h3>
            <Link href="/invoices" style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>View All →</Link>
          </div>
          <div style={{ padding: '1rem' }}>
            {recentInvoices.length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>No recent invoices found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {recentInvoices.map(inv => {
                  const STATUS_CONFIG: Record<string, { label: string; border: string; bg: string; color: string }> = {
                    PENDING: { label: 'Pending', border: '#ef4444', bg: 'rgba(239,68,68,0.08)', color: '#ef4444' },
                    PARTIAL: { label: 'Partial', border: '#f59e0b', bg: 'rgba(245,158,11,0.08)', color: '#f59e0b' },
                    PAID: { label: 'Paid', border: '#22c55e', bg: 'rgba(34,197,94,0.08)', color: '#22c55e' },
                  };
                  const status = STATUS_CONFIG[inv.paymentStatus] || STATUS_CONFIG.PENDING;
                  return (
                    <Link key={inv.id} href={`/invoices/${inv.id}`} className="glass-panel" style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '1rem', borderRadius: '0.5rem', textDecoration: 'none', color: 'inherit',
                      transition: 'transform 0.2s', borderLeft: `4px solid ${status.border}`
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                          {inv.customerName}
                          <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: status.bg, color: status.color, textTransform: 'uppercase' }}>
                            {status.label}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {inv.invoiceNumber} • {format(new Date(inv.createdAt), 'dd MMM yyyy')}
                          {inv.store && <> • {inv.store.branch || inv.store.name}</>}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--primary)', textAlign: 'right' }}>
                        <div>₹{inv.totalAmount.toLocaleString('en-IN')}</div>
                        {inv.paymentStatus === 'PARTIAL' && (
                          <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>Due: ₹{(inv.totalAmount - inv.paidAmount).toLocaleString('en-IN')}</div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Alerts Widget — toggleable Low Stock / Near Expiry */}
        <AlertsWidget />
      </div>
    </>
  );
}
