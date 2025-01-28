const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User who created the wishlist
    required: true
  },
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the Product (Book) in the cart
        required: true
      }
    }],
  createdAt: {
    type: Date,
    default: Date.now // Automatically set when the wishlist is created
  },
  updatedAt: {
    type: Date,
    default: Date.now // Automatically set when the wishlist is updated
  }
});

// Create and export the Wishlist model
module.exports = mongoose.model('Wishlist', wishlistSchema);
