const Product=require("../../models/productSchema");
const Order=require("../../models/orderSchema");
const Return=require("../../models/returnSchema");


const Wallet=require("../../models/wallet");



const viewOrder=async (req,res) => {
    try {
        const order = await Order.find()
        .populate("shippingAddress") // Populate the shippingAddress field
        .populate("items.product")
        .populate("userId")
        .sort({ createdAt: -1 });  // Populate the product field inside item
     //   console.log("haiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii",order)
    
        res.render("orderupdates",{order:order})
    } catch (error) {
        console.log("error while view order",error)
    }
}


const updateStatus=async (req,res) => {
    try {
        
     const oredrId=req.body.orderId;
     const status=req.body.status;
     await Order.findOneAndUpdate(
        { _id: oredrId },
        { statuss: status },
         // Return the updated document
        
      );
      res.status(200).json({ success: true });
        //res.render("orderupdates",{order:order})
    } catch (error) {
        console.log("error while view order",error)
        res.status(404).json({ success: false });
    }
}


const viewReport=async (req,res) => {
    try {
   //  console.log("haiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
         // Populate the product field inside item

        res.render("report")
    } catch (error) {
        console.log("error while view order",error)
    }
}

const returnView=async (req, res) => {
    try {
      const returns = await Return.find().populate('orderId customerId returnedProducts.productId');
      res.render('returnManagement', { returns });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving returns');
    }
  }

  const returnRejected=async (req, res) => {
    try {
        const returnId=req.query.id;
        const orderId=req.query.orderId;
      const returnItem = await Return.findByIdAndUpdate(
        returnId,
        { isReturnStatus: 'rejected' }

              
      );


      await Order.findByIdAndUpdate(
        orderId,
        { isReturnStatus: 'rejected' }

              
      );

      res.status(200).json({
        success: true, // Indicates the operation was successful
        message: 'Operation Rejected', // Describes what happened
        data: returnItem, // Optionally include the data relevant to the operation
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error rejecting return');
    }
  }

  const returnApproved=async (req, res) => {
    try {
        const returnId=req.query.id;
        const orderId=req.query.orderId;
        const UserId=req.query.userId;
        const amt=req.query.amt;


      const returnItem = await Return.findByIdAndUpdate(
        returnId,
        { isReturnStatus: 'aproved' }

              
      );


      await Order.findByIdAndUpdate(
        orderId,
        { isReturnStatus: 'aproved' }

              
      );

      refund(UserId,amt);

      res.status(200).json({
        success: true, // Indicates the operation was successful
        message: 'Operation aproved', // Describes what happened
        data: returnItem, // Optionally include the data relevant to the operation
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error rejecting return');
    }
  }


async function refund(referrerUserId, rewardAmount) {
    try {
        // Find the referrer's 
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
                        description: "Amount throug Return",
                    },
                ],
            });

            // Save the new wallet
            await wallet.save();

            console.log("New wallet created and referral bonus added");
            return { success: true, message: "Referral bonus added to new wallet", wallet };
        }

        // If wallet exists, add the reward amount
        wallet.balance += rewardAmount;

        // Add a transaction record for the referral bonus
        wallet.transactions.push({
            transactionId: `txn_${Date.now()}`,
            type: "Credit",
            amount: rewardAmount,
            description: "Amount Credited by return",
        });

        // Save the updated wallet
        await wallet.save();

       // console.log("Referral bonus added successfully");
        return { success: true, message: "Referral bonus added", wallet };
    } catch (error) {
//console.error("Error adding referral bonus:", error);
        return { success: false, message: "Error adding referral bonus" };
    }
}


module.exports={viewOrder,
    updateStatus,
    viewReport,
    returnView,
    returnRejected,
    returnApproved

}