import React from 'react';
  
  const Payment = () =>  {
	return (
	  <div>
	  </div>
	);
  }
  
  export default Payment;
  const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    planId: {
      type: String,
      required: true,
      enum: ['free', 'pro', 'yearly'],
    },
    planName: {
      type: String,
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentMethod: {
      type: String,
      default: 'UPI',
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    qrData: {
      type: String,
    },
    qrGeneratedAt: {
      type: Date,
      default: Date.now,
    },
    sessionId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
