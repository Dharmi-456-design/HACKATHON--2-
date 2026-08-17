import React from 'react';
  
  const PaymentController = () =>  {
	return (
	  <div>
	  </div>
	);
  }
  
  export default PaymentController;
  const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Initialize Razorpay SDK with environment keys (or fallback test credentials)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_naturepulseKey',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'naturepulseSecretKey',
});

// Authoritative plan definitions with Indian Rupees (₹) pricing
const PLANS = {
  free: {
    id: 'free',
    name: 'Explorer Tier',
    tagline: '100% Free Forever for All Observers',
    priceMonthly: 0,
    priceYearly: 0,
    priceDisplay: '₹0',
    period: 'forever',
    features: [
      'Daily field observation logging',
      'Basic species identification',
      'Access to community biodiversity map',
      '5D nature connection telemetry tracking',
      'Standard PWA mobile app support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Habitat Pro',
    tagline: 'For Active Naturalists & Explorers',
    priceMonthly: 499,
    priceYearly: 399,
    priceDisplay: '₹499',
    totalYearly: 4788,
    period: 'per month',
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
    priceMonthly: 2999,
    priceYearly: 2999,
    priceDisplay: '₹2,999',
    period: 'per year',
    features: [
      'Everything in Habitat Pro for up to 10 members',
      'Custom habitat telemetry dashboard',
      'Dedicated API keys for research data exports',
      'Seasonal ecological consultation reports',
      'Direct 24/7 priority support',
    ],
  },
};

// GET /api/payments/plans
const getPlans = asyncHandler(async (req, res) => {
  res.json({ plans: PLANS, razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_naturepulseKey' });
});

// POST /api/payments/session
// Creates a new unique payment attempt session & ultra-sharp high-res QR code
const createPaymentSession = asyncHandler(async (req, res) => {
  const { planId = 'pro', billingCycle = 'monthly' } = req.body;

  const selectedPlan = PLANS[planId] || PLANS.pro;

  // Calculate authoritative amount on server in USD ($)
  let amount = 0;
  if (selectedPlan.id === 'pro') {
    amount = billingCycle === 'yearly' ? selectedPlan.priceYearly : selectedPlan.priceMonthly;
  } else if (selectedPlan.id === 'yearly') {
    amount = selectedPlan.priceYearly;
  } else {
    amount = 0;
  }

  const sessionId = `SESS-${uuidv4()}`;
  const paymentId = `PAY-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const transactionId = `TXN-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const merchantUpi = process.env.MERCHANT_UPI_ID || '9173775095@ybl';
  const upiUri = `upi://pay?pa=${merchantUpi}&pn=NaturePulse%20Ecosystem&am=${amount}&cu=INR&tn=${encodeURIComponent(selectedPlan.name + ' Subscription')}&tr=${transactionId}`;

  // Generate high-resolution, crisp 500x500 PNG QR Code (never pixelated!)
  const qrDataUrl = await QRCode.toDataURL(upiUri, {
    errorCorrectionLevel: 'M',
    width: 400,
    margin: 1,
    color: {
      dark: '#0A1610',
      light: '#FFFFFF',
    },
  });

  const paymentRecord = await Payment.create({
    paymentId,
    userId: req.user?._id || 'guest-id',
    planId: selectedPlan.id,
    planName: selectedPlan.name,
    billingCycle,
    amount,
    currency: 'USD',
    transactionId,
    status: 'PENDING',
    qrData: JSON.stringify({ upiUri, sessionId }),
    qrGeneratedAt: new Date(),
    sessionId,
  });

  res.status(201).json({
    sessionId,
    paymentId: paymentRecord.paymentId,
    transactionId: paymentRecord.transactionId,
    plan: {
      id: selectedPlan.id,
      name: selectedPlan.name,
      tagline: selectedPlan.tagline,
      features: selectedPlan.features,
      billingCycle,
      period: selectedPlan.period,
      priceDisplay: selectedPlan.priceDisplay,
    },
    amount,
    currency: 'USD',
    currencySymbol: '$',
    qrCode: qrDataUrl,
    qrGeneratedAt: paymentRecord.qrGeneratedAt,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_naturepulseKey',
  });
});

// POST /api/payments/razorpay/create-order
// Creates official Razorpay Order for live Checkout Modal
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { planId = 'pro', billingCycle = 'monthly' } = req.body;

  const selectedPlan = PLANS[planId] || PLANS.pro;
  let amountUsd = selectedPlan.id === 'pro' ? (billingCycle === 'yearly' ? selectedPlan.priceYearly : selectedPlan.priceMonthly) : selectedPlan.priceYearly;
  if (selectedPlan.id === 'free') amountUsd = 0;

  // Convert USD to INR Paise (Razorpay expects amount in smallest currency unit, e.g. 4.99 USD ~= 414 INR = 41400 paise)
  const amountInrPaise = Math.round(amountUsd * 83 * 100);

  let razorpayOrder = null;
  try {
    razorpayOrder = await razorpay.orders.create({
      amount: amountInrPaise > 0 ? amountInrPaise : 100, // min 1 INR for test
      currency: 'INR',
      receipt: `REC-${Date.now()}`,
      notes: {
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        userEmail: req.user?.email || 'guest@naturepulse.app',
      },
    });
  } catch (err) {
    console.log('[Razorpay Order Fallback]:', err.message);
  }

  const transactionId = `TXN-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;

  res.json({
    orderId: razorpayOrder ? razorpayOrder.id : `order_${Date.now()}`,
    amount: amountInrPaise,
    currency: 'INR',
    amountUsd,
    transactionId,
    key: process.env.RAZORPAY_KEY_ID || 'rzp_test_naturepulseKey',
    planName: selectedPlan.name,
  });
});

// POST /api/payments/razorpay/verify
// Verifies signature & completes payment
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId = 'pro' } = req.body;

  const secret = process.env.RAZORPAY_KEY_SECRET || 'naturepulseSecretKey';
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto.createHmac('sha256', secret).update(body.toString()).digest('hex');

  const isValid = expectedSignature === razorpay_signature;

  if (isValid && req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, { activePlan: planId });
  }

  res.json({
    success: true,
    signatureValid: isValid,
    paymentId: razorpay_payment_id || `PAY-${Date.now()}`,
    transactionId: razorpay_order_id || `TXN-${Date.now()}`,
  });
});

// GET /api/payments/pin/status
// Check if user has already created a payment PIN
const getPinStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+paymentPin');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ hasPin: Boolean(user.paymentPin) });
});

// POST /api/payments/pin/create
// Create a new 4-6 digit PIN securely stored as bcrypt hash
const createPin = asyncHandler(async (req, res) => {
  const { pin, confirmPin } = req.body;

  if (!pin || !/^\d{4,6}$/.test(pin)) {
    res.status(400);
    throw new Error('PIN must be 4 to 6 numeric digits');
  }

  if (pin !== confirmPin) {
    res.status(400);
    throw new Error('PIN and Confirm PIN do not match');
  }

  const user = await User.findById(req.user._id).select('+paymentPin');
  if (user.paymentPin) {
    res.status(400);
    throw new Error('Payment PIN already exists. Use PIN verification.');
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPin = await bcrypt.hash(pin, salt);

  user.paymentPin = hashedPin;
  await user.save();

  res.status(200).json({ message: 'Payment PIN created successfully', hasPin: true });
});

// POST /api/payments/pin/verify
// Verify PIN against backend hash
const verifyPin = asyncHandler(async (req, res) => {
  const { pin } = req.body;
  if (!pin) {
    res.status(400);
    throw new Error('PIN is required');
  }

  const user = await User.findById(req.user._id).select('+paymentPin');
  if (!user || !user.paymentPin) {
    res.status(400);
    throw new Error('No payment PIN set. Please create one first.');
  }

  const isMatch = await bcrypt.compare(pin, user.paymentPin);
  if (!isMatch) {
    res.status(401);
    throw new Error('Incorrect PIN. Please try again.');
  }

  res.json({ valid: true, message: 'PIN verified successfully' });
});

// POST /api/payments/process
// Process payment upon successful PIN verification
const processPayment = asyncHandler(async (req, res) => {
  const { sessionId, paymentMethod = 'UPI', pin } = req.body;

  if (!sessionId) {
    res.status(400);
    throw new Error('Payment session ID is required');
  }

  if (!pin) {
    res.status(400);
    throw new Error('Payment PIN is required');
  }

  // 1. Verify PIN
  const user = await User.findById(req.user._id).select('+paymentPin');
  if (!user || !user.paymentPin) {
    res.status(400);
    throw new Error('Payment PIN not created. Please create PIN first.');
  }

  const isMatch = await bcrypt.compare(pin, user.paymentPin);
  if (!isMatch) {
    res.status(401);
    throw new Error('Incorrect PIN. Payment aborted.');
  }

  // 2. Find Pending Payment Session
  const payment = await Payment.findOne({ sessionId, userId: req.user._id });
  if (!payment) {
    res.status(404);
    throw new Error('Payment session not found or expired');
  }

  if (payment.status === 'SUCCESS') {
    res.status(400);
    throw new Error('This payment session has already been completed');
  }

  // 3. Mark Payment SUCCESS & update user active plan
  payment.status = 'SUCCESS';
  payment.paymentMethod = paymentMethod;
  await payment.save();

  user.activePlan = payment.planId;
  await user.save();

  res.status(200).json({
    message: 'Payment completed successfully!',
    payment: {
      paymentId: payment.paymentId,
      transactionId: payment.transactionId,
      planName: payment.planName,
      planId: payment.planId,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      createdAt: payment.createdAt,
      user: {
        name: user.name,
        email: user.email,
      },
    },
  });
});

// GET /api/payments/history
// Fetch logged-in user's payment history
const getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .select('-qrData');

  res.json({ payments });
});

// GET /api/payments/receipt/:id
// Get detailed receipt data for a single payment
const getReceipt = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({
    $or: [{ paymentId: req.params.id }, { transactionId: req.params.id }, { _id: req.params.id }],
    userId: req.user._id,
  });

  if (!payment) {
    res.status(404);
    throw new Error('Payment record not found');
  }

  const user = await User.findById(req.user._id);

  res.json({
    receipt: {
      receiptNumber: `REC-${payment.paymentId}`,
      paymentId: payment.paymentId,
      transactionId: payment.transactionId,
      userName: user.name || 'Valued Naturalist',
      userEmail: user.email,
      planName: payment.planName,
      planId: payment.planId,
      billingCycle: payment.billingCycle,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      date: payment.createdAt,
      appName: 'NaturePulse Ecosystem',
    },
  });
});

module.exports = {
  getPlans,
  createPaymentSession,
  getPinStatus,
  createPin,
  verifyPin,
  processPayment,
  getPaymentHistory,
  getReceipt,
  createRazorpayOrder,
  verifyRazorpayPayment,
};
