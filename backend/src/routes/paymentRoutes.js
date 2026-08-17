import React from 'react';
  
  const PaymentRoutes = () =>  {
	return (
	  <div>
	  </div>
	);
  }
  
  export default PaymentRoutes;
  const express = require('express');
const router = express.Router();
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/paymentController');

// Public route to view plans & prices
router.get('/plans', getPlans);

// Payment endpoints (with optional authentication for guests)
router.post('/session', optionalProtect, createPaymentSession);
router.get('/pin/status', optionalProtect, getPinStatus);
router.post('/pin/create', optionalProtect, createPin);
router.post('/pin/verify', optionalProtect, verifyPin);
router.post('/process', optionalProtect, processPayment);
router.get('/history', optionalProtect, getPaymentHistory);
router.get('/receipt/:id', optionalProtect, getReceipt);

// Razorpay Live Order & Verification Endpoints
router.post('/razorpay/create-order', optionalProtect, createRazorpayOrder);
router.post('/razorpay/verify', optionalProtect, verifyRazorpayPayment);

module.exports = router;
