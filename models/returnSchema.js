// models/Return.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const returnSchema = new Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order', // Reference to the Order model
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the Customer model
    required: true,
  },
  returnedProducts: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the Product model
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  reason: {
    type: String,
    required: true,
  },
  comments: {
    type: String,
    required: false,
  },
  totalRefundAmount: {
    type: Number,
    required: true,
  },
  couponDiscount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isReturnStatus: {
    type: String,
    enum: ['pending', 'rejected', 'aproved'],
    default: 'pending' // Default status is 'Pending'
  },
});

module.exports = mongoose.model('Return', returnSchema);
