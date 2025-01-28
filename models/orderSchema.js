const mongoose = require('mongoose');
const {v4:uuidv4}=require('uuid')

const orderSchema = new mongoose.Schema({
   orderId:{
    type:String,
    default:()=>uuidv4(),
    unique:true
   } ,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User who made the order
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Reference to the Product (Book) in the order
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'] // Ensure that the quantity is at least 1
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'] // Ensure the price is valid
    },
    discount: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'] // Ensure the price is valid
    },
    return: {
      type: Boolean,
      required: false // Ensure the price is valid
    }
  }],
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative'] // Ensure the total price is valid
  },
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address', // Reference to the Address where the order will be shipped
    required: true
  },
  discount:{
        type:Number,
        required: true,
        min: [0, 'Total price cannot be negative'] // Ensure the total price is valid
     
  },
  couponDiscount:{
    type:Number,
    required: true,
    min: [0, 'Total price cannot be negative'] // Ensure the total price is valid
 
},
deliveryCharge:{
  type:Number,
  required: true,
  min: [0, 'Total price cannot be negative'] // Ensure the total price is valid

},
totalAmount: {
  type: Number,
  required: true,
  min: [0, 'Total price cannot be negative'] // Ensure the total price is valid
},
  FinalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative'] // Ensure the total price is valid
  },
  statuss: {
    type: String,
    enum: ['pending', 'shipped', 'delivered', 'cancelled','processing'],
    default: 'pending' // Default status is 'Pending'
  },
  paymentType:{
    type: String,
    enum: [ 'cod','online',"wallets"],
    default: 'cod' // Default status is 'Pending'
  },
  paymentSuccess:{
    type: String,
    enum: [ 'wallets','success',"cod",'fail'],
    default: 'success' // Default status is 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically set when the order is created
  },
  updatedAt: {
    type: Date,
    default: Date.now // Automatically set when the order is updated
  },
  invoiceDate:{
    type:Date
  },
  isReturn:{
    type:Boolean,
    default:false
  },
  isReturnStatus: {
    type: String,
    enum: ['pending', 'rejected', 'aproved'],
    default: 'pending' // Default status is 'Pending'
  },
});

// Create and export the Order model
module.exports = mongoose.model('Order', orderSchema);
