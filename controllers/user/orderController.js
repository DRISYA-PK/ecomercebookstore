const Product = require("../../models/productSchema");
const Cart = require("../../models/cartSchema");
const User = require("../../models/userSchema");
const Address = require("../../models/addressSchema");
const Order = require("../../models/orderSchema")
const Coupon = require("../../models/couponSchema")
const Return=require("../../models/returnSchema")
const Wallet=require("../../models/wallet")
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();


var razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_YOUR_KEY_ID,
  key_secret: process.env.RAZORPAY_YOUR_KEY_SECRET,
});
const { render } = require("ejs");



const confirmAddress = async (req, res) => {
  try {
    //  
    const userId = req.session.user._id;
    const PriceDetail = req.body;
    const totalPayable = PriceDetail.TotalAmount;

    if (userId) {

      const getAddress = await Address.find({ userId: userId })
      const couponDetails = await Coupon.find({
        isActive: true,
        minimumPurchase: { $lte: totalPayable },
        UserId: { $nin: [userId] },
      });



      couponDetails.forEach((coupon) => {
        if (coupon.offerType.trim() === "Percentage") {
          // Do something with the coupon
          coupon.offerValue = totalPayable * (coupon.offerValue / 100);
          console.log(coupon.code, coupon.offerValue)
        }
      });



      res.render("confirmAddress", { address: getAddress, priceDetails: PriceDetail, coupon: couponDetails });

    }
    else {
      res.render("/pageNotFound");
    }

  } catch (error) {
    console.log("error while confirm address", error);
  }
}
//request for online payment----------------------------------
const requestOnline = async (req, res) => {
  try {

    let paymentId = `${req.session.user._id}${Date.now()}`;
    let amount = req.query.amount;
    console.log(amount)
    const options = {
      amount: amount * 100, // Convert to smallest currency unit (paise for INR)
      currency: "INR",
      receipt: paymentId,
    };

    const order = await razorpay.orders.create(options);
    //console.log("haiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
    res.status(200).json(order);

    // res.status(200).json({message:"success",paymentId:paymentId,amount:amount})



  } catch (error) {
    console.log("error while requesting online payment", error)
  }
}



//-----------------------------------confirm payment method------------------------------------------------------
const confirmPayment = async (req, res) => {
  try {
    //     
    const userId = req.session.user._id;

    const givenDetails = req.body;
    const paymentType = req.body.paymentType;
    if (userId) {

      const getAddress = await Address.find({ userId: userId, _id: givenDetails.addressId });
      //const cartDetails=await  Cart.find({userId:userId});


      const cartDetails = await Cart.findOne({ userId: userId }).populate('items.product').exec();

      if (!cartDetails || !Array.isArray(cartDetails.items)) {
        throw new Error('Cart items are undefined or not an array');
      }

      const order = new Order({
        userId: userId,
        items: cartDetails.items.map(item => ({
          product: item.product, // Ensure this is populated
          quantity: item.quantity,
          discount:item.discount, // Ensure this is a valid number
          price: item.price, // Ensure this is a valid number
        })),
        totalPrice: givenDetails.totalPrice,
        shippingAddress: givenDetails.addressId,
        discount: givenDetails.totalDiscount,
        couponDiscount: givenDetails.couponDiscount,
        deliveryCharge: givenDetails.deliveryCharge,
        totalAmount: givenDetails.totalAmount,
        FinalPrice: givenDetails.finalAmount,
        paymentSuccess:givenDetails.isPaymentSuccess,
        paymentType: givenDetails.paymentType,
      });

      // Save the order
      //  await order.save();

      if (getAddress) {


        // let paymentId=100,Amount=100;
        const savedOrder = await order.save();
        const paymentId = savedOrder._id;
        const amount = givenDetails.finalAmount;



        cartDetails.items.forEach(item => {
          let id = item.product;
          let stck = item.quantity;
          updateStock(id, stck);
        });
       // console.log(givenDetails.couponselectedId, "mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm")

        if (givenDetails.couponselectedId != "no") {
          updatecoupon(givenDetails.couponselectedId, userId)
        }

        deleteItemFromCart(cartDetails._id);

        if (paymentType === "cod") {
          res.status(200).json({ message: "success", paymentId: null, amount: amount,type:"cod" })
        }
        else if (paymentType === "online"){
          res.status(200).json({ message: "success", paymentId: paymentId, amount: amount,type:"online" })

        }else{
          walletPayment(req.session.user._id,amount);
          res.status(200).json({ message: "success", paymentId: null, amount: amount ,type:"wallets"})
        }

      }
      else {
        res.render("/pageNotFound");
      }
    }
    else {
      res.render("/pageNotFound");
    }

  } catch (error) {
    console.log("error while confirm address", error);
  }
}


async function walletPayment(referrerUserId, rewardAmount) {
    try {
        // Find the referrer's wallet
        rewardAmount=parseFloat(rewardAmount);
        let wallet = await Wallet.findOne({ userId: referrerUserId });

        if (!wallet) {
            // If no wallet exists, create a new one
            console.log("No wallet found. Creating a new wallet...");
            wallet = new Wallet({
                userId: referrerUserId,
                balance: -rewardAmount, // Start with the reward amount
                transactions: [
                    {
                        transactionId: `txn_${Date.now()}`, // Unique transaction ID
                        type: "Debit",
                        amount: rewardAmount,
                        description: "wallet payment",
                    },
                ],
            });

            // Save the new wallet
            await wallet.save();

           // console.log("New wallet created and referral bonus added");
            return { success: true, message: "Referral bonus added to new wallet", wallet };
        }

        // If wallet exists, add the reward amount
        wallet.balance -= rewardAmount;

        // Add a transaction record for the referral bonus
        wallet.transactions.push({
            transactionId: `txn_${Date.now()}`,
            type: "Debit",
            amount: rewardAmount,
            description: `wallet payment of ${rewardAmount}`,
        });

        // Save the updated wallet
        await wallet.save();

        console.log("Referral bonus added successfully");
        return { success: true, message: "Referral bonus added", wallet };
    } catch (error) {
        console.error("Error adding referral bonus:", error);
        return { success: false, message: "Error adding referral bonus" };
    }
}





async function ReturnPayment(referrerUserId, rewardAmount) {
  try {
      // Find the referrer's wallet
      rewardAmount=parseFloat(rewardAmount);
      let wallet = await Wallet.findOne({ userId: referrerUserId });

      if (!wallet) {
          // If no wallet exists, create a new one
          console.log("No wallet found. Creating a new wallet...");
          wallet = new Wallet({
              userId: referrerUserId,
              balance: rewardAmount, // Start with the reward amount
              transactions: [
                  {
                      transactionId: `txn_${Date.now()}`, // Unique transaction ID
                      type: "Credit",
                      amount: rewardAmount,
                      description: "ReturnPayment",
                  },
              ],
          });

          // Save the new wallet
          await wallet.save();

         // console.log("New wallet created and referral bonus added");
          return { success: true, message: "Referral bonus added to new wallet", wallet };
      }

      // If wallet exists, add the reward amount
      wallet.balance += rewardAmount;

      // Add a transaction record for the referral bonus
      wallet.transactions.push({
          transactionId: `txn_${Date.now()}`,
          type: "Credit",
          amount: rewardAmount,
          description: `ReturnPayment of ${rewardAmount}`,
      });

      // Save the updated wallet
      await wallet.save();

      console.log("Referral bonus added successfully");
      return { success: true, message: "Referral bonus added", wallet };
  } catch (error) {
      console.error("Error adding referral bonus:", error);
      return { success: false, message: "Error adding referral bonus" };
  }
}










//-delete item from 
const deleteItemFromCart = async (cartId) => {
  try {
    if (cartId) {
      await Cart.findByIdAndDelete(cartId);
    }

  } catch (error) {
    console.log("error while delete item from cart", error);
  }

}
async function updatecoupon(id, userid) {
  try {
    const couponObjectId = id;// mongoose.Types.ObjectId(couponId);
    //const userObjectId = mongoose.Types.ObjectId(userId);

    // Use updateOne to add the UserId to the array
    const result = await Coupon.updateOne(
      { _id: couponObjectId },  // Find the coupon by its ID
      { $addToSet: { UserId: userid } }  // Add the user ID to the UserId array
    );

  } catch (error) {
    console.log("error while update coupon", error);
  }
}


async function updateStock(id, newstock, isreturn = false) {
  try {
    if (id) {
      const itemDetails = await Product.findById(id); // Fetch the product details
      if (!itemDetails) {
        // console.log("Product not found for ID:", id);
        return;
      }
      let updatedStock = 0;
      if (isreturn) {
        updatedStock = itemDetails.stock + newstock;
      }
      else {
        updatedStock = itemDetails.stock - newstock;
      }


      // Use await to ensure the update operation completes
      await Product.findOneAndUpdate(
        { _id: id },
        { stock: updatedStock },
        { new: true } // Return the updated document
      );
      // console.log("Stock updated successfully for product:", id);
    }
  } catch (error) {
    console.log("Error while updating stock", error);
  }
}



const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_YOUR_KEY_SECRET) // Use your Razorpay Key Secret
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    res.status(200).json({ status: "success", paymentId: razorpay_payment_id });
  } else {
    res.status(400).json({ status: "failure", message: "Payment verification failed. Please try again." });
  }
}





//------------------render success payment page------------------------
const paymentSuccessPage = async (req, res) => {
  try {
    const paymentDetails = req.params;

    //console.log(paymentDetails);
    if (paymentDetails) {
      res.render("paymentSuccess", { details: paymentDetails });
    }
    else {
      res.render("/pageNotFound");
    }
  } catch (error) {
    console.log("error while showing suuceess page")
  }
}

//-showHistory-----------------
const showHistory = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const isUserExist = await User.findById(userId)

    const orders = await Order.find({ userId })
      .populate('items.product') // Populate product details
      .populate('shippingAddress') // Populate address details
      .sort({ createdAt: -1 });

    console.log(orders);
    res.render("orderHistory", { data: isUserExist, orders: orders });
  } catch (error) {
    console.log("error while loading history", error);
  }
}
//-cancelOrder-----------------
const cancelOrder = async (req, res) => {
  try {
console.log("dsjhjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj")
    const userId = req.session.user._id;
    const isUserExist = await User.findById(userId)
    if (isUserExist) {
      const orderId = req.params.orderId;
     
      await Order.findByIdAndUpdate({ _id: orderId }, { statuss: "cancelled" })


      orderDetails = await Order.findOne({ _id: orderId }).populate('items.product').exec();

      orderDetails.items.forEach(item => {
        let id = item.product;
        let stck = item.quantity;
        console.log(id, stck)
        updateStock(id, stck, true);
      });

      console.log(orderDetails.paymentType,"kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
if(orderDetails.paymentType==="online"||orderDetails.paymentType==="wallets")
{
 ReturnPayment(req.session.user._id, orderDetails.FinalPrice) ;

}

      res.status(200).json({ message: "success", success: true })

    }
    else {
      res.status(404).json({ message: "no user found", success: false })
    }
  } catch (error) {

    console.log("error while cancel order", error);
    res.status(404).json({ message: "no user found", success: false })
  }
}


//return
const returnView = async (req, res) => {

  try {
    const orderId = req.query.orderId;
    const order = await Order.findById(orderId).populate("items.product");
    console.log(order)
    res.render("fullReturn", { order });
  } catch (error) {
    res.status(500).send("Error fetching order details: " + error.message);
  }
}


const returnSubmit = async (req, res) => {

  try {


     const { orderId, reason,productId,refundamount,coupondiscount ,customerId} = req.body;
  

    // Fetch order details
    const order = await Order.findById(orderId).populate('items.product');
    if (!order) return res.status(404).send('Order not found');
   // console.log("haiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
    // Filter products selected for return
    const selectedProducts = order.items.filter(item => productId.includes(item.product._id.toString()));
//console.log("haiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
    if (selectedProducts.length === 0) {
      return res.status(400).send('No valid products selected for return');
    }
    const newReturn = new Return({
      orderId,
      customerId,
      returnedProducts: selectedProducts.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
        price: item.product.salePrice,
      })),
      reason,
      totalRefundAmount: refundamount,
      couponDiscount:coupondiscount,
    });
    //console.log("haiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
    // Save the return
    await newReturn.save();
    await Order.findByIdAndUpdate(orderId,{isReturn:true})

    // Send response back to the client
    res.status(201).json({ message: 'Return request submitted successfully', return: newReturn ,success:true});
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }

}
///checking wallet-------------------------------
const checkingWallet=async (req,res) => {
  try {
    const wallet=await Wallet.find({userId:req.session.user._id});
    console.log(wallet,"ddddddddddddddddddddddddddddddd");
    const paymentAmt=parseFloat(req.query.amount)
    const walletAmt=wallet[0].balance||0;
    const walletBalance=parseFloat(walletAmt);
    if(walletBalance>=paymentAmt)
    {
      res.status(200).json({success:true,walletamt:walletBalance})
    }
    else
    {
      res.status(200).json({success:false,walletamt:walletBalance})
    }
    
  } catch (error) {
    console.log(error);
  }
}


const invoice=async (req, res) => {
  try {
      const { orderId } = req.params;

      // Fetch the order details
      const order = await Order.findOne({ orderId })
          .populate('items.product', 'name regularPrice') // Populate product details
          .populate('shippingAddress') // Populate address
          .exec();

      if (!order) {
          return res.status(404).send('Order not found');
      }

      // Calculate GST (Assuming 18%)
      //const gstRate = 18;
     // const gstAmount = (order.totalAmount * gstRate) / 100;
        
      res.render('invoice', {
          order,
       
      });
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
}


const updatePaymentSuccess=async (req,res) => {
  try {

   // console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
    const orderId=req.query.orderId;
   await Order.findByIdAndUpdate(orderId,{paymentSuccess:"success"})
    res.status(200).json({status:"success"})
  } catch (error) {
    res.status(404).json({status:"fail"})
    console.log(error);
  }
}

module.exports = {
  confirmAddress, confirmPayment, paymentSuccessPage, verifyPayment,
  requestOnline, showHistory, cancelOrder, returnView, returnSubmit,checkingWallet,updatePaymentSuccess
}