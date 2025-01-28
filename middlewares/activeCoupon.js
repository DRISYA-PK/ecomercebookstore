const Coupon = require("../models/couponSchema");


const activeCoupon = async (req, res) => {
    try {
        const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Start of tomorrow
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1); // Start of yesterday

    // Update today's coupons to `isActive: true`
    const todayUpdateResult = await Coupon.updateMany(
      { fromDate: { $gte: today, $lt: tomorrow } },
      { $set: { isActive: true } }
    );
    //console.log("Updated today's coupons:", todayUpdateResult);

    // Update yesterday's coupons to `isActive: false`
    const yesterdayUpdateResult = await Coupon.updateMany(
      { fromDate: { $gte: yesterday, $lt: today } },
      { $set: { isActive: false } }
    );

        

    } catch (error) {
        console.log("error while activing and inactiving coupon", error)
    }

}

module.exports = {
    activeCoupon
}
