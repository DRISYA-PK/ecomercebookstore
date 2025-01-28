const Coupon=require("../../models/couponSchema");




const showCoupon=async (req,res) => {
    try {
        const getCouponDetails=await Coupon.find().sort({ startDate: 1 });
        

        res.render("coupon",{couponDetails:getCouponDetails});
        
    } catch (error) {
        console.log("error while showing coupon",error)
    }
    
}



//-------------add coupon
const addCoupon=async (req,res) => {
    try {
        let  { couponName,startDate,endDate,offerType,offerPrice,minimumPrice}=req.body;
        
         let coupon = await Coupon.findOne({ code:couponName })
         if(coupon)
         {
            res.status(404).json({message:"coupon name alreay exist"})
         }
         else
         {
      
         

            let isActive = true;

            // Normalize startDate to ignore time
            let normalizedStartDate = new Date(startDate);
            normalizedStartDate.setHours(0, 0, 0, 0);
            
            // Normalize current date to ignore time
            let normalizedCurrentDate = new Date();
            normalizedCurrentDate.setHours(0, 0, 0, 0);
            
            if (normalizedStartDate > normalizedCurrentDate) {
                isActive = false;
            }


            
          

            coupon=new Coupon({
                code:couponName,
                offerType:offerType,
                offerValue:offerPrice,
                minimumPurchase:minimumPrice,
                fromDate:startDate,
                toDate:endDate,
                isActive:isActive
            });
            await coupon.save();
            res.json({message:"added"})
         }
        
    } catch (error) {
        console.log("error while adding coupon",error)
    }
}


//----delete coupon
const deleteCoupon=async(req,res)=>{
  //  console.log("haiiii")
    const id=req.query.id;
    const result = await Coupon.findByIdAndDelete(id);
    if (result) {
        console.log("success")
      res.json({message:"coupon deleted successfuly"})
    } else {
      res.status(404).json({message:"coupon not found"});
    }
}

module.exports={
    showCoupon,
    addCoupon,
    deleteCoupon
}