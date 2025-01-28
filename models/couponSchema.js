const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true, // Ensures that each coupon code is unique
    uppercase: true, // Force coupon codes to be uppercase
    trim: true // Remove any extra spaces
  },
  offerType: {
    type: String,
    enum: ['Percentage', 'Flat'], // Type of discount: percentage or flat amount
    required: true
  },
  offerValue: {
    type: Number,
    required: true,
    min: [0, 'Discount value must be a positive number'] // Minimum discount is 0
  },
  minimumPurchase: {
    type: Number,
    default: 0, // Minimum purchase amount for the coupon to be applicable
    min: [0, 'Minimum purchase cannot be negative']
  },
  UserId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Reference to applicable product categories (e.g., genres)
  }],
  fromDate: {
    type: Date,
    required: true // Expiration date of the coupon
  },
  toDate: {
    type: Date,
    required: true // Expiration date of the coupon
  },
 
  isActive: {
    type: Boolean,
    default: true // Indicates if the coupon is currently active
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically set when the coupon is created
  }
});

// Create and export the Coupon model
module.exports = mongoose.model('Coupon', couponSchema);
