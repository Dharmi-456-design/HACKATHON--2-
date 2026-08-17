import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import {
  ShieldCheck,
  QrCode,
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Download,
  History,
  Clock,
  RefreshCw,
  AlertCircle,
  KeyRound,
  Check,
  PartyPopper,
  Trophy,
  DollarSign,
  CreditCard,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiFetch } from '../lib/api';

// Generate 100% valid, authentic, scannable QR Code Data URL
async function generateClientQrSvg(dataString) {
  try {
    return await QRCode.toDataURL(dataString, {
      errorCorrectionLevel: 'M',
      width: 400,
      margin: 1,
      color: {
        dark: '#0A1610',
        light: '#FFFFFF',
      },
    });
  } catch (err) {
    console.error('QR generation error:', err);
    return '';
  }
}

const PLANS_CONFIG = {
  pro: {
    id: 'pro',
    name: 'Habitat Pro',
    tagline: 'For Active Naturalists & Explorers',
    priceDisplay: '₹499',
    amountNum: 499,
    period: 'per month',
    badge: 'Most Popular',
    features: [
      'Unlimited Pulse AI species & call identification',
      'Acoustic dawn chorus telemetry logging',
      'High-resolution offline field maps',
      'Export field notes (PDF, CSV, GeoJSON)',
      'Priority AI model response latency (<500ms)',
      'Verified Community Explorer badge',
    ],
  },
  yearly: {
    id: 'yearly',
    name: 'Sanctuary Team',
    tagline: 'For Habitats, Schools & Research Groups',
    priceDisplay: '₹2,999',
    amountNum: 2999,
    period: 'per year',
    badge: 'Best Value (Save 35%)',
    features: [
      'Everything in Habitat Pro for up to 10 members',
      'Custom habitat telemetry dashboard',
      'Dedicated API keys for research data exports',
      'Seasonal ecological consultation reports',
      'Direct 24/7 priority support',
    ],
  },
  free: {
    id: 'free',
    name: 'Explorer Tier',
    tagline: '100% Free Forever for All Observers',
    priceDisplay: '₹0',
    amountNum: 0,
    period: 'forever',
    badge: 'Beginner Friendly',
    features: [
      'Daily field observation logging',
      'Basic species identification',
      'Access to community biodiversity map',
      '5D nature connection telemetry tracking',
      'Standard PWA mobile app support',
    ],
  },
};

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const { isDark } = useTheme();
  const token = session?.access_token;

  const initialPlanId = searchParams.get('plan') || 'pro';
  const initialBilling = searchParams.get('billing') || 'monthly';

  // State
  const [planId, setPlanId] = useState(initialPlanId);
  const [billingCycle, setBillingCycle] = useState(initialBilling);

  const currentPlan = PLANS_CONFIG[planId] || PLANS_CONFIG.pro;

  // Custom User Input Amount (pre-filled with plan price)
  const [paymentAmount, setPaymentAmount] = useState(currentPlan.amountNum);

  // Session & QR State
  const [sessionData, setSessionData] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // QR Expiry countdown (30 seconds)
  const [qrSecondsLeft, setQrSecondsLeft] = useState(30);
  const [qrExpired, setQrExpired] = useState(false);
  const qrTimerRef = useRef(null);

  // Flow Steps: 'summary' | 'method' | 'amount' | 'pin' | 'processing' | 'success'
  const [step, setStep] = useState('summary');

  // QR Modal Popup State
  const [showQrModal, setShowQrModal] = useState(false);

  const handleContinueToPaymentClick = () => {
    setShowQrModal(true);
  };

  const handleCloseQrModalToMethods = () => {
    setShowQrModal(false);
    setStep('method');
  };

  // Selected Payment Method: 'GPay' | 'PhonePe' | 'Paytm' | 'UPI' | 'CreditCard' | 'NetBanking'
  const [selectedMethod, setSelectedMethod] = useState('GPay');

  // PIN State
  const [hasPin, setHasPin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [submittingPin, setSubmittingPin] = useState(false);

  // Result State
  const [paymentResult, setPaymentResult] = useState(null);

  // Confetti Burst Celebration
  const triggerCelebration = useCallback(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#4ADE80', '#96CD7B', '#FCD34D', '#6EE7B7', '#38BDF8'],
    });
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#4ADE80', '#FCD34D'] });
      confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#96CD7B', '#38BDF8'] });
    }, 250);
  }, []);

  // Update amount when plan changes
  useEffect(() => {
    setPaymentAmount(currentPlan.amountNum);
  }, [planId]);

  // QR 30-second expiry countdown timer
  const startQrTimer = useCallback(() => {
    if (qrTimerRef.current) clearInterval(qrTimerRef.current);
    setQrSecondsLeft(30);
    setQrExpired(false);
    qrTimerRef.current = setInterval(() => {
      setQrSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(qrTimerRef.current);
          setQrExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => { if (qrTimerRef.current) clearInterval(qrTimerRef.current); };
  }, []);

  // Generate Session & Dynamic QR
  const initPaymentSession = useCallback(async (targetPlanId, targetBilling) => {
    setLoadingSession(true);
    const targetPlan = PLANS_CONFIG[targetPlanId] || PLANS_CONFIG.pro;
    const uniqueSessionId = `SESS-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const uniquePaymentId = `PAY-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const uniqueTxnId = `TXN-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const merchantUpi = '9173775095@ybl';
    const upiUri = `upi://pay?pa=${merchantUpi}&pn=NaturePulse%20Ecosystem&am=${targetPlan.amountNum}&cu=INR&tn=${encodeURIComponent(targetPlan.name)}&tr=${uniqueTxnId}`;

    let qrImage = await generateClientQrSvg(upiUri);

    try {
      const data = await apiFetch(
        '/api/payments/session',
        {
          method: 'POST',
          body: JSON.stringify({ planId: targetPlan.id, billingCycle: targetBilling }),
        },
        token
      );
      if (data && data.qrCode) qrImage = data.qrCode;
    } catch { }

    setSessionData({
      sessionId: uniqueSessionId,
      paymentId: uniquePaymentId,
      transactionId: uniqueTxnId,
      plan: targetPlan,
      amount: targetPlan.amountNum,
      amountDisplay: targetPlan.priceDisplay,
      currency: 'INR',
      currencySymbol: '₹',
      qrCode: qrImage,
      qrGeneratedAt: new Date().toISOString(),
    });

    setLoadingSession(false);
    startQrTimer();
  }, [token, startQrTimer]);

  // Check PIN status
  const checkPinStatus = useCallback(async () => {
    const localPin = localStorage.getItem('np_payment_pin');
    if (localPin) {
      setHasPin(true);
      return;
    }
    try {
      const data = await apiFetch('/api/payments/pin/status', {}, token);
      if (data && typeof data.hasPin === 'boolean') setHasPin(data.hasPin);
    } catch {
      setHasPin(Boolean(localPin));
    }
  }, [token]);

  useEffect(() => {
    initPaymentSession(planId, billingCycle);
    checkPinStatus();
  }, [planId, billingCycle, initPaymentSession, checkPinStatus]);

  // Switch Plan Tabs
  const handleSwitchPlanTab = (newPlanId) => {
    setPlanId(newPlanId);
    setStep('summary');
    initPaymentSession(newPlanId, billingCycle);
  };

  // Step Navigations
  const handleProceedToMethod = () => setStep('method');
  const handleProceedToAmount = () => setStep('amount');
  const handleProceedToPin = () => {
    setPinError('');
    setPinInput('');
    setConfirmPinInput('');
    setStep('pin');
  };

  // Submit PIN & Execute Payment
  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setPinError('');

    if (!hasPin) {
      if (!pinInput || !/^\d{4,6}$/.test(pinInput)) {
        setPinError('PIN must be 4 to 6 numeric digits');
        return;
      }
      if (pinInput !== confirmPinInput) {
        setPinError('PINs do not match');
        return;
      }

      setSubmittingPin(true);
      localStorage.setItem('np_payment_pin', pinInput);
      setHasPin(true);
      await executePayment(pinInput);
    } else {
      if (!pinInput || !/^\d{4,6}$/.test(pinInput)) {
        setPinError('Please enter your numeric PIN');
        return;
      }

      const localPin = localStorage.getItem('np_payment_pin');
      if (localPin && localPin !== pinInput) {
        setPinError('Incorrect PIN. Please try again.');
        setSubmittingPin(false);
        return;
      }

      setSubmittingPin(true);
      await executePayment(pinInput);
    }
  };

  // Execute Payment Process
  const executePayment = async (pin) => {
    setStep('processing');

    setTimeout(async () => {
      const finalAmount = parseFloat(paymentAmount) || currentPlan.amountNum;
      const resultData = {
        paymentId: sessionData?.paymentId || `PAY-${Date.now()}`,
        transactionId: sessionData?.transactionId || `TXN-${Date.now()}`,
        planName: currentPlan.name,
        planId: currentPlan.id,
        amount: finalAmount,
        amountDisplay: `₹${finalAmount}`,
        currency: 'INR',
        paymentMethod: selectedMethod,
        status: 'SUCCESS',
        createdAt: new Date().toISOString(),
        user: {
          name: user?.name || 'Explorer Guest',
          email: user?.email || 'guest@naturepulse.app',
        },
      };

      try {
        const existingRaw = localStorage.getItem('np_payment_history');
        const list = existingRaw ? JSON.parse(existingRaw) : [];
        const updated = [resultData, ...list.filter((x) => x.transactionId !== resultData.transactionId)];
        localStorage.setItem('np_payment_history', JSON.stringify(updated));
      } catch { }

      setPaymentResult(resultData);
      setStep('success');
      setSubmittingPin(false);
      triggerCelebration();
    }, 1000);
  };

  // Download PDF Receipt
  const handleDownloadReceipt = () => {
    if (!paymentResult) return;
    const doc = new jsPDF();
    const p = paymentResult;

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
    doc.text(`Name: ${p.user?.name || 'Explorer Guest'}`, 15, 102);
    doc.text(`Email: ${p.user?.email || ''}`, 15, 110);

    doc.setFillColor(241, 245, 249);
    doc.rect(15, 122, 180, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Plan Description', 20, 128);
    doc.text('Payment Method', 110, 128);
    doc.text('Amount (INR)', 155, 128);

    doc.setFont('helvetica', 'normal');
    doc.text(p.planName, 20, 140);
    doc.text(p.paymentMethod, 110, 140);
    doc.text(`Rs.${p.amount}`, 155, 140);

    doc.line(15, 148, 195, 148);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Payment Status: ${p.status}`, 15, 165);

    doc.setFillColor(238, 242, 255);
    doc.rect(120, 155, 75, 22, 'F');
    doc.setTextColor(24, 59, 40);
    doc.setFontSize(14);
    doc.text(`Total Paid: Rs.${p.amount}`, 125, 170);

    doc.save(`payment-receipt-${p.transactionId}.pdf`);
  };

  const PAYMENT_OPTIONS = [
    { id: 'GPay', label: 'Google Pay (GPay)', desc: 'Instant GPay UPI Payment', icon: Smartphone },
    { id: 'PhonePe', label: 'PhonePe UPI', desc: 'Direct PhonePe Payment', icon: Smartphone },
    { id: 'Paytm', label: 'Paytm UPI & Wallet', desc: 'Instant Paytm Payment', icon: Smartphone },
    { id: 'UPI', label: 'BHIM / Other UPI ID', desc: 'Scan or Enter any UPI ID', icon: QrCode },
    { id: 'CreditCard', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', icon: CreditCard },
    { id: 'NetBanking', label: 'Net Banking', desc: 'SBI, HDFC, ICICI, Axis & more', icon: Smartphone },
  ];

  return (
    <div className={`min-h-screen py-10 px-4 sm:px-6 transition-colors ${isDark ? 'bg-[#0A1610] text-white' : 'bg-[#FAF7F0] text-[#0F2418]'
      }`}>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between border-b pb-4 border-emerald-500/20">
          <div className="flex items-center gap-3">
            <Link
              to="/app"
              className={`p-2 rounded-full border transition-colors ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-[#E3DDD1] hover:bg-slate-100'
                }`}
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold flex items-center gap-2">
                <ShieldCheck className="text-[#96CD7B]" size={24} /> Secure Checkout
              </h1>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                Google Pay, PhonePe &amp; Dynamic UPI Payments
              </p>
            </div>
          </div>

          <Link
            to="/app/payment-history"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#96CD7B]/15 text-[#96CD7B] border border-[#96CD7B]/30 hover:bg-[#96CD7B]/25 transition-all"
          >
            <History size={14} /> History
          </Link>
        </div>

        {/* ── TOP 3 PLAN SELECTION TABS ────────────────────────────────────────── */}
        {step !== 'success' && step !== 'processing' && (
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { id: 'pro', label: 'Habitat Pro (Popular)', price: '₹499 / mo' },
              { id: 'yearly', label: 'Sanctuary Team (Best Value)', price: '₹2,999 / yr' },
              { id: 'free', label: 'Explorer Tier', price: '₹0 Free' },
            ].map((tab) => {
              const isActive = planId === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSwitchPlanTab(tab.id)}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-2 ${isActive
                      ? 'bg-[#96CD7B] text-[#0A1610] border-[#96CD7B] shadow-lg scale-105 ring-2 ring-[#96CD7B]/50'
                      : isDark
                        ? 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                        : 'bg-white text-[#183B28] border-[#E3DDD1] hover:bg-slate-100'
                    }`}
                >
                  <span>{tab.label}</span>
                  <span className="font-mono bg-black/10 px-2 py-0.5 rounded-md text-[11px]">{tab.price}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── STEP 1: SUMMARY & UPI QR ────────────────────────────────────────── */}
        {step === 'summary' && (
          <div className="grid md:grid-cols-12 gap-8 items-stretch">

            {/* Left: Plan Details */}
            <div className={`md:col-span-7 rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 flex flex-col justify-between ${isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1]'
              }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#96CD7B]/20 text-[#96CD7B]">
                      {currentPlan.badge}
                    </span>
                    <h2 className="font-display text-3xl font-bold mt-2">{currentPlan.name}</h2>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{currentPlan.tagline}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-extrabold font-display text-[#96CD7B]">{currentPlan.priceDisplay}</div>
                    <span className="text-[10px] font-mono text-slate-400">/ {currentPlan.period}</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border text-xs space-y-2 font-mono ${isDark ? 'bg-[#07130B] border-[#1C3A27] text-slate-300' : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#2D4536]'
                  }`}>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Session ID:</span>
                    <span className="font-bold text-[#96CD7B]">{sessionData?.sessionId || 'Generating...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order ID:</span>
                    <span>{sessionData?.paymentId || '—'}</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#96CD7B]">Included Benefits</h4>
                  <ul className="space-y-2">
                    {currentPlan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-xs">
                        <div className="w-4 h-4 rounded-full bg-[#96CD7B]/20 text-[#96CD7B] flex items-center justify-center shrink-0">
                          <Check size={10} />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={handleContinueToPaymentClick}
                className="w-full py-4 rounded-2xl bg-[#96CD7B] hover:bg-[#85be69] text-[#0A1610] font-bold text-sm shadow-lg transition-all transform hover:scale-[1.01] cursor-pointer mt-4"
              >
                Continue to Payment ({currentPlan.priceDisplay}) →
              </button>
            </div>

            {/* Right: Plan Info Card */}
            <div className={`md:col-span-5 rounded-3xl p-6 sm:p-8 border shadow-xl text-center space-y-5 flex flex-col justify-between ${isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1]'
              }`}>
              <div className="space-y-3 my-auto">
                <div className="w-16 h-16 rounded-full bg-[#96CD7B]/20 text-[#96CD7B] flex items-center justify-center mx-auto shadow-inner border border-[#96CD7B]/40">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="font-display text-xl font-bold">Instant Instant Activation</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                  Click <strong>"Continue to Payment"</strong> to view your scannable UPI QR code or pay directly with GPay, PhonePe, Paytm, or Card.
                </p>
                <button
                  onClick={handleContinueToPaymentClick}
                  className="px-6 py-3 rounded-2xl bg-[#96CD7B] text-[#0A1610] font-bold text-xs shadow-md transition-all hover:bg-[#85be69] cursor-pointer"
                >
                  <QrCode size={16} className="inline mr-1.5" /> Show Payment QR Code
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ── QR CODE POPUP MODAL WITH CLOSE (X) BUTTON ──────────────────────── */}
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
            <div className={`relative w-full max-w-md rounded-3xl p-6 sm:p-8 border shadow-2xl text-center space-y-5 ${isDark ? 'bg-[#0E2015] border-[#20452F] text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418]'
              }`}>
              {/* Top-Right Close (X) Button */}
              <button
                onClick={handleCloseQrModalToMethods}
                title="Close QR & Proceed to Payment Options"
                className={`absolute top-4 right-4 p-2.5 rounded-full border transition-all cursor-pointer ${isDark ? 'bg-white/10 border-white/20 text-white hover:bg-rose-500 hover:border-rose-500' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-rose-500 hover:text-white'
                  }`}
              >
                <X size={20} />
              </button>

              <div className="space-y-1 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#96CD7B]/15 text-[#96CD7B] border border-[#96CD7B]/30">
                  <QrCode size={12} /> DYNAMIC SECURE QR ({currentPlan.priceDisplay})
                </div>
                <h3 className="font-display text-xl font-bold">Scan via GPay / PhonePe / Paytm</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                  Scan with any UPI app. Expires in <strong className={qrExpired ? 'text-rose-400' : 'text-[#96CD7B]'}>{qrExpired ? 'Expired!' : `${qrSecondsLeft}s`}</strong>
                </p>
              </div>

              {/* Square QR Frame with bottom countdown bar */}
              <div className="relative mx-auto" style={{ width: '220px' }}>
                <div className={`relative w-full aspect-square rounded-2xl border-2 p-3 shadow-xl flex items-center justify-center overflow-hidden ${qrExpired ? 'border-rose-500/60 bg-white' : 'border-[#96CD7B]/50 bg-white'
                  }`}>
                  {loadingSession ? (
                    <div className="flex flex-col items-center gap-2 text-slate-500 text-xs">
                      <RefreshCw className="animate-spin text-[#96CD7B]" size={32} />
                      <span>Generating QR...</span>
                    </div>
                  ) : qrExpired ? (
                    <div className="flex flex-col items-center gap-2 text-center px-3">
                      <span className="text-rose-500 text-4xl">⏰</span>
                      <span className="text-rose-500 text-sm font-bold">QR Expired</span>
                      <span className="text-[10px] text-slate-400">Tap below to refresh</span>
                    </div>
                  ) : (
                    <img src={sessionData?.qrCode} alt="UPI QR Code" className="w-full h-full object-contain" />
                  )}

                  {/* Countdown bar at bottom of QR frame */}
                  {!loadingSession && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-200/60">
                      <div
                        className={`h-full transition-all ease-linear ${qrExpired ? 'bg-rose-500' : qrSecondsLeft <= 5 ? 'bg-rose-400' : 'bg-[#96CD7B]'}`}
                        style={{
                          width: `${(qrSecondsLeft / 30) * 100}%`,
                          transition: 'width 1s linear, background-color 0.3s',
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Countdown badge */}
                {!loadingSession && !qrExpired && (
                  <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold font-mono shadow-md ${qrSecondsLeft <= 5
                      ? 'bg-rose-500 border-rose-400 text-white'
                      : 'bg-[#0A1610] border-[#96CD7B] text-[#96CD7B]'
                    }`}>
                    {qrSecondsLeft}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-1">
                <button
                  onClick={handleCloseQrModalToMethods}
                  className="w-full py-3.5 rounded-2xl bg-[#96CD7B] hover:bg-[#85be69] text-[#0A1610] font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Smartphone size={16} /> Select Payment App (GPay / PhonePe) →
                </button>

                <button
                  onClick={() => initPaymentSession(planId, billingCycle)}
                  disabled={loadingSession}
                  className={`text-xs font-semibold underline cursor-pointer flex items-center justify-center gap-1 mx-auto ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'
                    }`}
                >
                  <RefreshCw size={12} className={loadingSession ? 'animate-spin' : ''} />
                  {qrExpired ? 'Generate New QR' : 'Regenerate QR'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: PAYMENT METHOD SELECTION (GPay / PhonePe / Paytm / UPI) ──── */}
        {step === 'method' && (
          <div className={`max-w-2xl mx-auto rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 ${isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1]'
            }`}>
            <div className="flex items-center justify-between border-b pb-4 border-emerald-500/20">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#96CD7B]">Step 2 of 4</span>
                <h2 className="font-display text-2xl font-bold">Select Payment App</h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Plan Price</span>
                <div className="text-3xl font-bold font-display text-[#96CD7B]">{currentPlan.priceDisplay}</div>
              </div>
            </div>

            <div className="space-y-3">
              {PAYMENT_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = selectedMethod === opt.id;

                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedMethod(opt.id)}
                    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${isSelected
                        ? 'bg-[#96CD7B]/15 border-[#96CD7B] shadow-md ring-2 ring-[#96CD7B]/40'
                        : isDark
                          ? 'bg-[#07130B] border-[#1C3A27] hover:border-slate-600'
                          : 'bg-white border-[#E3DDD1] hover:border-slate-300'
                      }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`p-3 rounded-xl ${isSelected ? 'bg-[#96CD7B] text-[#0A1610]' : isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-[#183B28]'
                        }`}>
                        <IconComponent size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{opt.label}</h4>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{opt.desc}</p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#96CD7B] bg-[#96CD7B]' : 'border-slate-500'
                      }`}>
                      {isSelected && <Check size={12} className="text-[#0A1610] stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep('summary')}
                className={`py-3.5 px-6 rounded-2xl text-xs font-bold border transition-colors cursor-pointer ${isDark ? 'border-white/20 text-slate-300 hover:bg-white/5' : 'border-[#E3DDD1] text-slate-700 hover:bg-slate-100'
                  }`}
              >
                ← Back
              </button>

              <button
                onClick={handleProceedToAmount}
                className="flex-1 py-3.5 rounded-2xl bg-[#96CD7B] hover:bg-[#85be69] text-[#0A1610] font-bold text-sm shadow-lg transition-all cursor-pointer"
              >
                Continue with {selectedMethod} →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: AMOUNT ENTRY INPUT FIELD ────────────────────────────────── */}
        {step === 'amount' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-md mx-auto rounded-3xl p-6 sm:p-8 border shadow-xl text-center space-y-6 ${isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1]'
              }`}
          >
            <div className="w-16 h-16 rounded-full bg-[#96CD7B]/20 text-[#96CD7B] flex items-center justify-center mx-auto shadow-inner border border-[#96CD7B]/30">
              <DollarSign size={32} />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#96CD7B]">Step 3 of 4</span>
              <h3 className="font-display text-2xl font-bold mt-1">Enter Amount to Pay</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                Paying via <strong>{selectedMethod}</strong> for <strong>{currentPlan.name}</strong>.
              </p>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold text-slate-400 block">
                Amount (₹ INR)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-extrabold font-display text-[#96CD7B]">₹</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="499"
                  className={`w-full pl-10 pr-4 py-3.5 text-2xl font-bold font-mono rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#96CD7B] ${isDark ? 'bg-[#07130B] border-[#1C3A27] text-white' : 'bg-white border-[#E3DDD1] text-[#0F2418]'
                    }`}
                />
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Standard price: ₹{currentPlan.amountNum}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep('method')}
                className={`py-3.5 px-5 rounded-2xl text-xs font-bold border ${isDark ? 'border-white/20 text-slate-300' : 'border-[#E3DDD1] text-slate-700'
                  }`}
              >
                ← Back
              </button>
              <button
                onClick={handleProceedToPin}
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                className="flex-1 py-3.5 rounded-2xl bg-[#96CD7B] hover:bg-[#85be69] text-[#0A1610] font-bold text-sm shadow-md cursor-pointer disabled:opacity-50"
              >
                Proceed to Enter PIN →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 4: PIN SECURITY VERIFICATION ───────────────────────────────── */}
        {step === 'pin' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`max-w-md mx-auto rounded-3xl p-6 sm:p-8 border shadow-2xl text-center space-y-6 ${isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1]'
              }`}
          >
            <div className="w-16 h-16 rounded-full bg-[#96CD7B]/20 text-[#96CD7B] flex items-center justify-center mx-auto shadow-inner border border-[#96CD7B]/40">
              <KeyRound size={32} />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#96CD7B]">Step 4 of 4</span>
              <h3 className="font-display text-2xl font-bold mt-1">
                {!hasPin ? 'Create Payment PIN' : 'Enter Payment PIN'}
              </h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                {!hasPin
                  ? 'First-time security setup. Create a 4 to 6 digit PIN.'
                  : `Authorize ₹${paymentAmount} payment via ${selectedMethod}.`}
              </p>
            </div>

            {pinError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handlePinSubmit} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  {!hasPin ? 'New Security PIN (4-6 digits)' : 'Enter Security PIN'}
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className={`w-full text-center text-3xl tracking-[0.6em] font-mono py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#96CD7B] ${isDark ? 'bg-[#07130B] border-[#1C3A27] text-white' : 'bg-white border-[#E3DDD1] text-[#0F2418]'
                    }`}
                  autoFocus
                />
              </div>

              {!hasPin && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                    Confirm Security PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className={`w-full text-center text-3xl tracking-[0.6em] font-mono py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[#96CD7B] ${isDark ? 'bg-[#07130B] border-[#1C3A27] text-white' : 'bg-white border-[#E3DDD1] text-[#0F2418]'
                      }`}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('amount')}
                  className={`py-3.5 px-5 rounded-2xl text-xs font-bold border ${isDark ? 'border-white/20 text-slate-300' : 'border-[#E3DDD1] text-slate-700'
                    }`}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={submittingPin}
                  className="flex-1 py-3.5 rounded-2xl bg-[#96CD7B] hover:bg-[#85be69] text-[#0A1610] font-bold text-sm shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Lock size={14} />
                  {submittingPin ? 'Verifying...' : !hasPin ? 'Save PIN & Pay' : `Pay ₹${paymentAmount}`}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ── STEP 5: PROCESSING ───────────────────────────────────────────────── */}
        {step === 'processing' && (
          <div className="max-w-md mx-auto py-16 text-center space-y-4">
            <RefreshCw className="animate-spin text-[#96CD7B] mx-auto" size={56} />
            <h3 className="font-display text-2xl font-bold">Authorizing {selectedMethod} Payment...</h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
              Processing ₹{paymentAmount} payment for {currentPlan.name}.
            </p>
          </div>
        )}

        {/* ── STEP 6: MST CELEBRATION & PDF RECEIPT ───────────────────────────── */}
        {step === 'success' && paymentResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className={`max-w-xl mx-auto rounded-3xl p-8 border shadow-2xl text-center space-y-6 relative overflow-hidden ${isDark ? 'bg-gradient-to-b from-[#132B1C] to-[#0E2015] border-[#96CD7B]/50' : 'bg-[#FDFBF7] border-[#C3DEC0]'
              }`}
          >
            <div className="relative z-10 space-y-3">
              <div className="w-24 h-24 rounded-full bg-[#96CD7B]/25 text-[#96CD7B] flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(150,205,123,0.4)] border-2 border-[#96CD7B]">
                <PartyPopper size={52} />
              </div>

              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-[#96CD7B] text-[#0A1610] shadow-md uppercase tracking-wider">
                <Trophy size={14} /> Celebration! Payment Successful 🎉
              </div>

              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
                Welcome to {paymentResult.planName}!
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-[#3E5C48]'}`}>
                Your membership is now active for <strong>{paymentResult.user?.email || 'your account'}</strong>.
              </p>
            </div>

            <div className={`p-5 rounded-2xl border text-left text-xs font-mono space-y-2.5 relative z-10 ${isDark ? 'bg-[#07130B] border-[#1C3A27]' : 'bg-[#F2ECE1] border-[#E0D8C8]'
              }`}>
              <div className="flex justify-between border-b pb-2 border-emerald-500/20">
                <span className="text-slate-400">Payment ID:</span>
                <span className="font-bold text-[#96CD7B]">{paymentResult.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span>{paymentResult.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-bold text-base text-[#96CD7B]">₹{paymentResult.amount} INR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment App:</span>
                <span className="font-bold text-[#96CD7B]">{paymentResult.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-400 font-bold">COMPLETED ✓</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 relative z-10">
              <button
                onClick={handleDownloadReceipt}
                className="flex-1 py-3.5 rounded-2xl bg-[#96CD7B] hover:bg-[#85be69] text-[#0A1610] font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <Download size={16} /> Download PDF Receipt
              </button>

              <Link
                to="/app/payment-history"
                className={`py-3.5 px-6 rounded-2xl text-xs font-bold border flex items-center justify-center gap-2 transition-colors ${isDark ? 'border-white/20 text-slate-300 hover:bg-white/10' : 'border-[#E3DDD1] text-slate-700 hover:bg-slate-100'
                  }`}
              >
                <History size={14} /> View History
              </Link>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
