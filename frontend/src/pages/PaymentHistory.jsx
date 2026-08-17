import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import {
  History,
  ArrowLeft,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiFetch } from '../lib/api';

export default function PaymentHistory() {
  const { session, user } = useAuth();
  const { isDark } = useTheme();
  const token = session?.access_token;

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');

    let localHistory = [];
    try {
      const raw = localStorage.getItem('np_payment_history');
      if (raw) localHistory = JSON.parse(raw);
    } catch {}

    try {
      const data = await apiFetch('/api/payments/history', {}, token);
      if (data && Array.isArray(data.payments) && data.payments.length > 0) {
        const merged = [...data.payments, ...localHistory.filter(l => !data.payments.some(dp => dp.transactionId === l.transactionId))];
        setPayments(merged);
        setLoading(false);
        return;
      }
    } catch {
      console.log('[PaymentHistory] Backend API unreachable, using local history');
    }

    setPayments(localHistory);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  // Generate & Download PDF Receipt for any past payment
  const downloadReceipt = (p) => {
    const doc = new jsPDF();

    doc.setDrawColor(24, 59, 40);
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 277);

    doc.setFillColor(24, 59, 40);
    doc.rect(10, 10, 190, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('NATUREPULSE ECOSYSTEM', 15, 26);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Payment Receipt & Tax Invoice', 15, 34);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Receipt #: REC-${p.paymentId}`, 15, 58);
    doc.text(`Transaction ID: ${p.transactionId}`, 15, 66);
    doc.text(`Date: ${new Date(p.createdAt).toLocaleString()}`, 15, 74);

    doc.setDrawColor(226, 232, 240);
    doc.line(15, 82, 195, 82);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Billed To:', 15, 94);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Name: ${user?.name || 'Explorer'}`, 15, 102);
    doc.text(`Email: ${user?.email || ''}`, 15, 110);

    doc.setFillColor(241, 245, 249);
    doc.rect(15, 122, 180, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Plan Description', 20, 128);
    doc.text('Billing', 110, 128);
    doc.text('Amount (USD)', 155, 128);

    doc.setFont('helvetica', 'normal');
    doc.text(p.planName, 20, 140);
    doc.text(p.billingCycle || 'Monthly', 110, 140);
    doc.text(`$${p.amount}`, 155, 140);

    doc.line(15, 148, 195, 148);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Payment Method: ${p.paymentMethod}`, 15, 162);
    doc.text(`Payment Status: ${p.status}`, 15, 170);

    doc.setFillColor(238, 242, 255);
    doc.rect(120, 155, 75, 22, 'F');
    doc.setTextColor(24, 59, 40);
    doc.setFontSize(14);
    doc.text(`Total Paid: $${p.amount}`, 125, 170);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'Thank you for contributing to urban biodiversity conservation with NaturePulse.',
      15,
      260
    );

    doc.save(`payment-receipt-${p.transactionId}.pdf`);
  };

  return (
    <div className={`min-h-screen py-10 px-4 sm:px-6 transition-colors ${
      isDark ? 'bg-[#0A1610] text-white' : 'bg-[#FAF7F0] text-[#0F2418]'
    }`}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between border-b pb-4 border-emerald-500/20">
          <div className="flex items-center gap-3">
            <Link
              to="/app/payment"
              className={`p-2 rounded-full border transition-colors ${
                isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-[#E3DDD1] hover:bg-slate-100'
              }`}
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold flex items-center gap-2">
                <History className="text-[#96CD7B]" size={24} /> Payment History
              </h1>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                Your complete transaction record &amp; downloadable invoices
              </p>
            </div>
          </div>

          <Link
            to="/app/payment"
            className="px-4 py-2 rounded-2xl text-xs font-bold bg-[#96CD7B] hover:bg-[#85be69] text-[#0A1610] shadow-md transition-all"
          >
            + Upgrade / New Plan
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="animate-spin text-[#96CD7B] mx-auto" size={36} />
            <p className="text-xs text-slate-400">Loading your payment records from backend...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 max-w-lg mx-auto">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && payments.length === 0 && (
          <div className={`p-12 rounded-3xl border text-center space-y-4 max-w-lg mx-auto ${
            isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1]'
          }`}>
            <ShieldCheck className="mx-auto text-slate-500" size={48} />
            <h3 className="font-display text-lg font-bold">No Payments Yet</h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
              You haven't completed any plan upgrades yet. Choose a plan to unlock premium features!
            </p>
            <Link
              to="/app/payment"
              className="inline-block px-6 py-3 rounded-2xl bg-[#96CD7B] text-[#0A1610] font-bold text-xs shadow-md"
            >
              Explore Pricing Plans
            </Link>
          </div>
        )}

        {/* Payment History List / Table */}
        {!loading && !error && payments.length > 0 && (
          <div className={`rounded-3xl border shadow-xl overflow-hidden ${
            isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1]'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-[11px] font-mono uppercase tracking-wider ${
                    isDark ? 'border-white/10 bg-[#07130B] text-slate-400' : 'border-[#E3DDD1] bg-[#F2ECE1] text-[#3E5C48]'
                  }`}>
                    <th className="py-4 px-6">Plan</th>
                    <th className="py-4 px-6">Amount</th>
                    <th className="py-4 px-6">Method</th>
                    <th className="py-4 px-6">Transaction ID</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/10 text-xs">
                  {payments.map((p) => (
                    <tr key={p._id || p.paymentId} className={`transition-colors ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                    }`}>
                      <td className="py-4 px-6 font-bold">{p.planName}</td>
                      <td className="py-4 px-6 font-mono font-bold text-[#96CD7B]">${p.amount}</td>
                      <td className="py-4 px-6">{p.paymentMethod || 'UPI'}</td>
                      <td className="py-4 px-6 font-mono text-[11px] text-slate-400">{p.transactionId}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'SUCCESS'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : p.status === 'PENDING'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}>
                          {p.status === 'SUCCESS' && <CheckCircle2 size={10} />}
                          {p.status === 'PENDING' && <Clock size={10} />}
                          {p.status === 'FAILED' && <XCircle size={10} />}
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {p.status === 'SUCCESS' ? (
                          <button
                            onClick={() => downloadReceipt(p)}
                            className="px-3 py-1.5 rounded-xl bg-[#96CD7B]/20 text-[#96CD7B] hover:bg-[#96CD7B] hover:text-[#0A1610] text-[11px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Download size={12} /> Receipt
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
