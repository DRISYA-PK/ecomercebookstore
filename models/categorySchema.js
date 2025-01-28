const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Genre name is required
    unique: true, // Ensure no duplicate genre names
    trim: true // Removes extra spaces around the genre name
  },
  description: {
    type: String,
    required: false, // Description is optional
    trim: true // Removes extra spaces from the description
  },
  image: {
    type: String,
    required: false, // Optional image URL for the genre
  },
  categoryOffer: {
    type: Number,
    default: 0 // Rating between 0 and 5, with a default value of 0
},
  createdAt: {
    type: Date,
    default: Date.now // Automatically set when the genre is created
  },
  updatedAt: {
    type: Date,
    default: Date.now // Automatically set when the genre is updated
  },

  isDeleted: { type: Boolean, default: false }, // Marks if the category is deleted
    deletedAt: { type: Date }


});

// Create and export the Genre model
module.exports = mongoose.model('Category', categorySchema);
