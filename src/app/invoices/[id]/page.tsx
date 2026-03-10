'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Loader2, Share2, Download, AlertCircle, ChevronLeft, Printer, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

// Lazy load PDF components to keep main bundle light
const ClientPDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
    { ssr: false }
);

// Internal PDF Document definition (will be used by DownloadLink)
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// PDF Styles (Matching the HTML styles for consistency)
const pdfStyles = StyleSheet.create({
    page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#1e293b' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e3a8a' },
    section: { marginBottom: 20 },
    label: { color: '#64748b', fontSize: 9, textTransform: 'uppercase', marginBottom: 4 },
    value: { fontSize: 11, fontWeight: 'bold', marginBottom: 2 },
    table: { width: '100%', marginTop: 10 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#f8fafc', padding: 8, borderBottom: '1 solid #e2e8f0' },
    tableRow: { flexDirection: 'row', padding: 8, borderBottom: '1 solid #f1f5f9' },
    col1: { width: '40%' },
    col2: { width: '10%', textAlign: 'center' },
    col3: { width: '15%', textAlign: 'right' },
    col4: { width: '10%', textAlign: 'right' },
    col5: { width: '10%', textAlign: 'right' },
    col6: { width: '15%', textAlign: 'right' },
    summary: { alignSelf: 'flex-end', width: '40%', marginTop: 20 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    totalText: { fontSize: 14, fontWeight: 'bold', color: '#1e3a8a', marginTop: 10 },
    footer: { position: 'absolute', bottom: 40, left: 40, right: 40, textAlign: 'center', color: '#94a3b8', fontSize: 8, borderTop: '1 solid #e2e8f0', paddingTop: 10 }
});

// Interfaces
interface InvoiceItem {
    id: string;
    product: { name: string };
    quantity: number;
    priceAtTime: number;
    discountAtTime: number;
    gstAtTime: number;
}

interface Invoice {
    id: string;
    invoiceNumber: string;
    createdAt: string;
    customerName: string;
    customerPhone?: string;
    subTotal: number;
    discountTotal: number;
    gstTotal: number;
    totalAmount: number;
    paymentStatus: string;
    paidAmount: number;
    items: InvoiceItem[];
}

// PDF Document Component
const InvoicePDF = ({ invoice, gstEnabled = true }: { invoice: Invoice, gstEnabled?: boolean }) => (
    <Document title={`Invoice ${invoice.invoiceNumber}`}>
        <Page size="A4" style={pdfStyles.page}>
            <View style={pdfStyles.header}>
                <View>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e3a8a' }}>Inventory Pro Solutions</Text>
                    <Text>123 Business Avenue, Tech Park</Text>
                    <Text>Mumbai, Maharashtra 400001</Text>
                    {gstEnabled && <Text>GSTIN: 27AACCV9981K1ZA</Text>}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={pdfStyles.title}>INVOICE</Text>
                    <Text style={{ fontWeight: 'bold' }}>{invoice.invoiceNumber}</Text>
                    <Text>Date: {format(new Date(invoice.createdAt), 'dd MMM yyyy')}</Text>
                </View>
            </View>

            <View style={pdfStyles.section}>
                <Text style={pdfStyles.label}>Billed To</Text>
                <Text style={pdfStyles.value}>{invoice.customerName}</Text>
                {invoice.customerPhone && <Text>{invoice.customerPhone}</Text>}
            </View>

            <View style={pdfStyles.table}>
                <View style={pdfStyles.tableHeader}>
                    <Text style={pdfStyles.col1}>Description</Text>
                    <Text style={pdfStyles.col2}>Qty</Text>
                    <Text style={pdfStyles.col3}>Rate</Text>
                    <Text style={pdfStyles.col4}>Disc%</Text>
                    {gstEnabled && <Text style={pdfStyles.col5}>GST%</Text>}
                    <Text style={pdfStyles.col6}>Amount</Text>
                </View>
                {invoice.items.map(item => (
                    <View key={item.id} style={pdfStyles.tableRow}>
                        <Text style={pdfStyles.col1}>{item.product?.name || 'Unknown Item'}</Text>
                        <Text style={pdfStyles.col2}>{item.quantity}</Text>
                        <Text style={pdfStyles.col3}>₹{item.priceAtTime.toFixed(2)}</Text>
                        <Text style={pdfStyles.col4}>{item.discountAtTime}%</Text>
                        {gstEnabled && <Text style={pdfStyles.col5}>{item.gstAtTime}%</Text>}
                        <Text style={pdfStyles.col6}>₹{(item.priceAtTime * item.quantity * (1 - item.discountAtTime / 100) * (1 + item.gstAtTime / 100)).toFixed(2)}</Text>
                    </View>
                ))}
            </View>

            <View style={pdfStyles.summary}>
                <View style={pdfStyles.summaryRow}><Text>Subtotal</Text><Text>₹{invoice.subTotal.toFixed(2)}</Text></View>
                <View style={pdfStyles.summaryRow}><Text>Discount</Text><Text>-₹{invoice.discountTotal.toFixed(2)}</Text></View>
                {gstEnabled && <View style={pdfStyles.summaryRow}><Text>GST</Text><Text>+₹{invoice.gstTotal.toFixed(2)}</Text></View>}
                <View style={[pdfStyles.summaryRow, { borderTop: '1 solid #e2e8f0', marginTop: 5, paddingTop: 5 }]}>
                    <Text style={pdfStyles.totalText}>Total</Text>
                    <Text style={pdfStyles.totalText}>₹{invoice.totalAmount.toFixed(2)}</Text>
                </View>
            </View>

            <Text style={pdfStyles.footer}>Computer generated invoice - No signature required.</Text>
        </Page>
    </Document>
);

export default function InvoiceViewer() {
    const { id } = useParams();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isClient, setIsClient] = useState(false);
    const [gstEnabled, setGstEnabled] = useState(true);

    // Payment state
    const [partialAmount, setPartialAmount] = useState('');
    const [savingPayment, setSavingPayment] = useState(false);
    const [paymentMsg, setPaymentMsg] = useState('');

    const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
        PENDING: { label: 'Pending', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
        PARTIAL: { label: 'Partially Paid', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
        PAID: { label: 'Fully Paid', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
    };

    const WA_ICON = () => (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );

    const savePayment = async (status: string, amount?: number) => {
        if (!invoice) return;
        setSavingPayment(true);
        const paid = amount !== undefined ? amount : invoice.paidAmount;
        const res = await fetch(`/api/invoices/${invoice.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentStatus: status, paidAmount: paid }),
        });
        const updated = await res.json();
        setInvoice(prev => prev ? { ...prev, paymentStatus: updated.paymentStatus, paidAmount: updated.paidAmount } : prev);
        setSavingPayment(false);
        setPaymentMsg('Saved!');
        setTimeout(() => setPaymentMsg(''), 2000);
    };

    useEffect(() => {
        setIsClient(true);
        fetch('/api/settings').then(r => r.json()).then(d => setGstEnabled(d.gst_enabled !== 'false'));
        fetch(`/api/invoices/${id}`)
            .then(r => r.json())
            .then(data => { setInvoice(data); setIsLoading(false); })
            .catch(() => { setError('Failed to load invoice.'); setIsLoading(false); });
    }, [id]);

    const handlePrint = () => {
        if (!invoice) return;
        const originalTitle = document.title;
        document.title = `Invoice-${invoice.invoiceNumber}`;
        window.print();
        document.title = originalTitle;
    };

    const handleShareWhatsApp = () => {
        if (!invoice) return;
        const msg = `Invoice ${invoice.invoiceNumber} for ${invoice.customerName}\nAmount: ₹${invoice.totalAmount.toLocaleString('en-IN')}\nView here: ${window.location.href}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    };

    if (!isClient || isLoading) return (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', height: '80vh', gap: '1rem' }}>
            <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary)' }} />
            <p style={{ color: '#64748b', fontWeight: 500 }}>Loading Invoice Details...</p>
        </div>
    );

    if (error || !invoice) return (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="card glass-panel" style={{ display: 'inline-block', padding: '3rem' }}>
                <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Something went wrong</h2>
                <p style={{ color: '#64748b' }}>{error || 'Invoice not found.'}</p>
                <Link href="/invoices" className="btn-secondary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
                    <ChevronLeft size={18} /> Back to Invoices
                </Link>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '2rem' }}>

            {/* Left: Premium HTML Invoice Layout */}
            <div className="card glass-panel html-invoice-container" style={{ background: 'white', padding: '3rem', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4rem', gap: '2rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.5rem', whiteSpace: 'nowrap' }}>Inventory Pro Solutions</div>
                        <div style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: '1.5' }}>
                            123 Business Avenue, Tech Park<br />
                            Mumbai, Maharashtra 400001<br />
                            {gstEnabled && <><span style={{ fontWeight: 600 }}>GSTIN:</span> 27AACCV9981K1ZA</>}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1e3a8a', letterSpacing: '-0.02em', marginBottom: '1rem' }}>INVOICE</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{invoice.invoiceNumber}</div>
                        <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{format(new Date(invoice.createdAt), 'dd MMMM yyyy')}</div>
                    </div>
                </div>

                {/* Billed To */}
                <div style={{ marginBottom: '4rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Billed To</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{invoice.customerName}</div>
                    {invoice.customerPhone && <div style={{ color: '#64748b', marginTop: '0.25rem' }}>{invoice.customerPhone.startsWith('+91') ? invoice.customerPhone : `+91 ${invoice.customerPhone}`}</div>}
                </div>

                {/* Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <colgroup>
                        <col style={{ width: '32%' }} />
                        <col style={{ width: '6%' }} />
                        <col style={{ width: '15%' }} />
                        <col style={{ width: '15%' }} />
                        {gstEnabled && <col style={{ width: '14%' }} />}
                        <col style={{ width: gstEnabled ? '18%' : '28%' }} />
                    </colgroup>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ textAlign: 'left', padding: '0.875rem 1rem', color: '#475569', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
                            <th style={{ textAlign: 'center', padding: '0.875rem 0.5rem', color: '#475569', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Qty</th>
                            <th style={{ textAlign: 'right', padding: '0.875rem 1rem', color: '#475569', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rate</th>
                            <th style={{ textAlign: 'right', padding: '0.875rem 1rem', color: '#475569', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Discount</th>
                            {gstEnabled && <th style={{ textAlign: 'right', padding: '0.875rem 1rem', color: '#475569', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>GST</th>}
                            <th style={{ textAlign: 'right', padding: '0.875rem 1rem', color: '#475569', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item) => {
                            const gross = item.priceAtTime * item.quantity;
                            const discountAmt = gross * (item.discountAtTime / 100);
                            const afterDiscount = gross - discountAmt;
                            const gstAmt = afterDiscount * (item.gstAtTime / 100);
                            const lineTotal = afterDiscount + gstAmt;
                            return (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 0 }} title={item.product?.name || 'Deleted Product'}>
                                        {item.product?.name || 'Deleted Product'}
                                        {item.discountAtTime > 0 && (
                                            <span style={{ display: 'block', fontSize: '0.72rem', color: '#22c55e', fontWeight: 500, marginTop: '2px', whiteSpace: 'normal' }}>
                                                {item.discountAtTime}% discount applied
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{item.quantity}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', color: '#64748b', whiteSpace: 'nowrap' }}>₹{item.priceAtTime.toLocaleString('en-IN')}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap', color: discountAmt > 0 ? '#ef4444' : '#94a3b8' }}>
                                        {discountAmt > 0 ? `−₹${discountAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                                    </td>
                                    {gstEnabled && (
                                        <td style={{ padding: '1rem', textAlign: 'right', color: '#64748b', whiteSpace: 'nowrap' }}>
                                            <div style={{ fontWeight: 600 }}>{item.gstAtTime}%</div>
                                            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>₹{gstAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                        </td>
                                    )}
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: '#1e3a8a', whiteSpace: 'nowrap' }}>₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Totals */}
                <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: '300px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', color: '#64748b' }}>
                            <span>Subtotal</span>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>₹{invoice.subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', color: '#64748b' }}>
                            <span>Total Discount</span>
                            <span style={{ fontWeight: 600, color: '#ef4444' }}>- ₹{invoice.discountTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        {gstEnabled && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', color: '#64748b' }}>
                                <span>Tax (GST)</span>
                                <span style={{ fontWeight: 600, color: '#1e293b' }}>+ ₹{invoice.gstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 0', marginTop: '1rem', borderTop: '2px solid #e2e8f0' }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>Grand Total</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e3a8a' }}>₹{invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '6rem', paddingTop: '2rem', borderTop: '1px solid #f1f5f9', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                    Thank you for your business! This is a computer-generated invoice.
                </div>
            </div>

            {/* Right: Sidebar Actions */}
            <div className="action-sidebar" style={{ position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <Link href="/invoices" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
                    <ChevronLeft size={16} /> Back to All Invoices
                </Link>

                <div className="card glass-panel" style={{ padding: '1.75rem' }}>
                    {/* Payment Status */}
                    {(() => {
                        const cfg = STATUS_CONFIG[invoice.paymentStatus] || STATUS_CONFIG.PENDING;
                        const due = invoice.totalAmount - (invoice.paidAmount || 0);
                        return (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '0.75rem' }}>Payment Status</div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '999px', background: cfg.bg, fontSize: '0.875rem', fontWeight: 700, color: cfg.color, marginBottom: '0.75rem' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cfg.color }} />
                                    {cfg.label}
                                </div>
                                {invoice.paymentStatus === 'PARTIAL' && (
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                        Paid: <strong style={{ color: '#22c55e' }}>₹{invoice.paidAmount.toFixed(2)}</strong> &nbsp;·&nbsp; Due: <strong style={{ color: '#ef4444' }}>₹{due.toFixed(2)}</strong>
                                    </div>
                                )}
                                {paymentMsg && <div style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 600 }}>✓ {paymentMsg}</div>}
                            </div>
                        );
                    })()}

                    {/* Record Partial Payment */}
                    {invoice.paymentStatus !== 'PAID' && (
                        <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'rgba(245,158,11,0.06)', borderRadius: '0.75rem', border: '1px solid rgba(245,158,11,0.2)' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b45309', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Record Partial Payment</div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input type="number" placeholder="Amount paid (₹)" min="0" max={invoice.totalAmount}
                                    className="input-field" style={{ flex: 1, fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                                    value={partialAmount} onChange={e => setPartialAmount(e.target.value)} />
                                <button disabled={savingPayment || !partialAmount}
                                    onClick={() => savePayment('PARTIAL', parseFloat(partialAmount))}
                                    style={{ padding: '0.5rem 1rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.8rem', opacity: !partialAmount ? 0.5 : 1 }}>
                                    Save
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mark as Fully Paid */}
                    {invoice.paymentStatus !== 'PAID' && (
                        <button disabled={savingPayment}
                            onClick={() => savePayment('PAID', invoice.totalAmount)}
                            style={{ width: '100%', padding: '0.75rem', background: 'rgba(34,197,94,0.1)', border: '1.5px solid rgba(34,197,94,0.35)', borderRadius: '0.75rem', color: '#16a34a', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={16} /> Mark as Fully Paid
                        </button>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '0.5rem' }}>
                        <button onClick={handlePrint} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', height: '3.25rem', border: '1px solid #e2e8f0' }}>
                            <Printer size={18} /> Print Invoice
                        </button>

                        <ClientPDFDownloadLink document={<InvoicePDF invoice={invoice} gstEnabled={gstEnabled} />} fileName={`Invoice-${invoice.invoiceNumber}.pdf`} style={{ textDecoration: 'none' }}>
                            {({ loading }) => (
                                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', height: '3.5rem', background: '#1e3a8a' }} disabled={loading}>
                                    {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={18} />}
                                    <span style={{ marginLeft: '0.5rem' }}>{loading ? 'Preparing...' : 'Download PDF'}</span>
                                </button>
                            )}
                        </ClientPDFDownloadLink>

                        <button onClick={handleShareWhatsApp} style={{ width: '100%', justifyContent: 'center', height: '3.25rem', display: 'flex', alignItems: 'center', gap: '0.625rem', background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '0.5rem', color: '#16a34a', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                            <WA_ICON /> Share via WhatsApp
                        </button>
                    </div>

                    <p style={{ marginTop: '1.5rem', fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', lineHeight: '1.6' }}>
                        Computer-generated invoice.
                    </p>
                </div>
            </div>

            <style jsx>{`
                @media print {
                    /* Hide everything except the invoice container */
                    body * { visibility: hidden; }
                    .html-invoice-container, .html-invoice-container * { visibility: visible; }
                    
                    /* Reset positioning for the invoice container */
                    .html-invoice-container {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                    }

                    /* Remove background glassmorphism for cleaner print */
                    .html-invoice-container {
                        background: white !important;
                    }

                    /* Hide sidebar, navigation, badges, and top bar */
                    aside, header, .action-sidebar,
                    .sidebar, button, a, nav, [role="navigation"],
                    [id*="issue"], [class*="issue"] { display: none !important; }
                    
                    /* Ensure main content takes full width */
                    main { padding: 0 !important; margin: 0 !important; width: 100% !important; }
                    div[style*="z-index: 10"] { display: none !important; }
                }
            `}</style>
        </div>
    );
}
