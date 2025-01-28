const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User who owns the cart
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Reference to the Product (Book) in the cart
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'] // Ensure that the quantity is at least 1
    },
    price: {
      type: Number,
      required: false,
      default:0,
      min: [0, 'Price cannot be negative'] // Ensure the price is valid
    },
    discount: {
      type: Number,
      required: false,
      default:0,
      min: [0, 'discount cannot be negative'] // Ensure the price is valid
    }
  }],
  totalPrice: {
    type: Number,
    required: false,
    default:0,
    min: [0, 'totalPrice cannot be negative'] // Ensure the price is valid
  },
  totalAmount: {
    type: Number,
    required: false,
    default:0,
    min: [0, 'totalAmount cannot be negative'] // Ensure the price is valid
  },
  totalDiscount: {
    type: Number,
    required: false,
    default:0,
    min: [0, 'totalDiscount cannot be negative'] // Ensure the price is valid
  },
  couponDiscount: {
    type: Number,
    required: false,
    default:0,
    min: [0, 'couponDiscount cannot be negative'] // Ensure the price is valid
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically set when the cart is created
  },
  updatedAt: {
    type: Date,
    default: Date.now // Automatically set when the cart is updated
  },

});

// Create and export the Cart model
module.exports = mongoose.model('Cart', cartSchema);
