const Razorpay = require('razorpay');

var razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_YOUR_KEY_ID,
  key_secret:process.env.RAZORPAY_YOUR_KEY_SECRET,
});

module.exports={razorpay}