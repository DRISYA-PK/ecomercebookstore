const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", // Reference to the User who owns this address
    required: true 
  },
  name:{
    type: String, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  post:{
    type: String, 
    required: true 
  },
  city: { 
    type: String, 
    required: true 
  },
  state: { 
    type: String, 
    required: true 
  },
  country: { 
    type: String, 
    required: false 
  },
  phone: { 
    type: String, 
    required: true 
  },
  phone2: { 
    type: String, 
    required: false 
  },
  
    pinCode: { 
    type: String, 
    required: true 
  },
  isPrimary: { 
    type: Boolean, 
    default: false // Flag for primary address (e.g., the default shipping address)
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now
  }
});

module.exports = mongoose.model('Address', addressSchema);
