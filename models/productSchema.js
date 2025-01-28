const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Book title is mandatory
        trim: true // Removes extra spaces around the title
    },
    author: {
        type: String,
        required: true // Author name is mandatory
    },
    language: {
        type: String,
        required: true // Author name is mandatory
    },
    /* categ: {
       type: String,
       required: true, // Genre (like fiction, non-fiction, sci-fi) is required
       enum: ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Fantasy', 'Mystery', 'Biography', 'Children', 'History', 'Others'], // Possible genres
       default: 'Others'
     },*/
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category", 
        required: true
    },
    Product: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Offer",
        required: false
    }],
    regularPrice: {
        type: Number,
        required: true, // Price is mandatory
        min: [0, 'Price cannot be negative'] // Ensure the price is not negative
    },
    salePrice: {
        type: Number,
        required: true, // Price is mandatory
        min: [0, 'Price cannot be negative'] // Ensure the price is not negative
    },
    stock: {
        type: Number,
        required: true, // Stock is mandatory
        min: [0, 'Stock cannot be negative'] // Ensure stock cannot be negative
    },
    description: {
        type: String,
        required: false, // Description is optional but can be useful for marketing
        trim: true
    },
    coverImage: {
        type: [String], // URL or path to the book cover image
        required: true
    },
    publishedDate: {
        type: Date,
        required: false,
        default: Date.now  // The date when the book was published
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0 // Rating between 0 and 5, with a default value of 0
    },
    discount: {
        type: Number,
        default: 0 // Rating between 0 and 5, with a default value of 0
    },
    productDiscount: {
        type: Number,
        default: 0 // Rating between 0 and 5, with a default value of 0
    },
    categoryDiscount: {
        type: Number,
        default: 0 // Rating between 0 and 5, with a default value of 0
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically set the creation date when the product is added
    },
    updatedAt: {
        type: Date,
        default: Date.now // Automatically set the last update date when modified
    },
    isDeleted: {
        type: Boolean,
        default: false // Automatically set the last update date when modified
    },
    status:{
        type:String,
        enum:["Available","Out of stock"],
        required:true,
        default:"Available"
    }
});

// Create and export the Product model
module.exports = mongoose.model('Product', productSchema);
