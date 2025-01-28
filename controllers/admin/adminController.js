const User = require("../../models/userSchema")
const Order=require("../../models/orderSchema")
const Product=require("../../models/productSchema")
const bcrypt = require('bcrypt');
const session = require("express-session");
const { request } = require("express");


const env = require("dotenv").config()
const pageerror=async(req,res)=>{
   return await res.render("pageerror")
}

const adminLoadLogin = async (req, res) => {
   // console.log(4);

    if (req.session.admin) {
        try {
            return res.render("admindashboard"); // Ensure the correct path for your view
        } catch (error) {
            console.log("Error while rendering dashboard:", error);
            return res.redirect("pageerror");
        }
    } else {
        // Redirect to another page if session.admin is undefined
       // console.log("No admin session found. Redirecting...ccccccccccccccc");
       console.log(2);
        return res.render("adminlogin",{message:null}); // Change "/login" to the appropriate path
    }
};





const adminPostLogin=async(req,res)=>{
    try {
    
        const {email,password}=req.body;
        const findAdmin=await User.findOne({isAdmin:true,email:email})
        if(findAdmin)
        {
            const passwordMatch = await bcrypt.compare(password, findAdmin.password);
       //    const passwordMatch=bcrypt.compare(password,findAdmin.password)

           if(passwordMatch)
           { 
            
            req.session.admin=true;
            console.log(3);
             return res.render("admindashboard");
           }
           else
           {
           // console.log(2 +findAdmin)
            return res.render("adminlogin",{message:"Invalid Password"})
           }
           
        }
        else
        {
            
          return  res.render("adminlogin",{message:"Invalid EmailId"});
        }
        
    } catch (error) {
        console.log("adminLoginError")
        res.redirect("/pageError")

    }
   

}

const loadDashbord = async (req, res) => {
  

    if (req.session.admin) {
        try {
            return res.render("admindashboard"); // Ensure the correct path for your view
        } catch (error) {
            console.log("Error while rendering dashboard:", error);
            return res.redirect("/pageerror");
        }
    } else {
        // Redirect to another page if session.admin is undefined
        //console.log("No admin session found. Redirecting..cccc.");
        console.log(1)
        return res.redirect("adminlogin"); // Change "/login" to the appropriate path
    }
};
const adminLogout=async(req,res)=>{
    try {
        req.session.destroy(err=>{
            if(err){
                console.log("error while admin session",err);
                return res.redirect("/pageerror")
            }
            res.redirect("/admin/adminlogin")
        })
        
    } catch (error) {
        console.log("unexpected error during logout",error);
        res.redirect("/pageerror")
    }
   
}

const dashBoard=async (req, res) => {
    try {
        const timeFilter = req.query.timeFilter || 'monthly';
        const year = parseInt(req.query.year) || new Date().getFullYear();

        // Get basic stats
        const allOrders = await Order.find({
            createdAt: {
                $gte: new Date(year, 0, 1),
                $lt: new Date(year + 1, 0, 1)
            }
        });

        const totalOrders = allOrders.length;
        const totalRevenue = allOrders.reduce((sum, order) => sum + order.FinalPrice, 0);
        const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
        const returnRate = totalOrders ? 
            (allOrders.filter(order => order.isReturn).length / totalOrders) * 100 : 0;

        // Process chart data based on time filter
        let revenueTrend = {
            labels: [],
            data: []
        };

        if (timeFilter === 'monthly') {
            const monthlyData = new Array(12).fill(0);
            const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            allOrders.forEach(order => {
                const month = order.createdAt.getMonth();
                monthlyData[month] += order.FinalPrice;
            });

            revenueTrend.labels = monthLabels;
            revenueTrend.data = monthlyData;
        }

        // Get payment method distribution
        const paymentMethods = [
            allOrders.filter(order => order.paymentType === 'cod').length,
            allOrders.filter(order => order.paymentType === 'online').length,
            allOrders.filter(order => order.paymentType === 'wallets').length
        ];

        // Render the dashboard with initial data
        res.render('dashboard', {
            totalOrders,
            totalRevenue,
            avgOrderValue,
            returnRate,
            chartData: {
                revenueTrend,
                paymentMethods
            }
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).send('Error loading dashboard');
    }
}

const updateDashBoard= async (req, res) => {
    try {
        const timeFilter = req.query.timeFilter || 'monthly';
        const year = parseInt(req.query.year) || new Date().getFullYear();
        
        // Create date range for filtering
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year + 1, 0, 1);

        // Get orders within the date range
        const allOrders = await Order.find({
            createdAt: {
                $gte: startDate,
                $lt: endDate
            }
        });

        // Calculate basic stats
        const totalOrders = allOrders.length;
        const totalRevenue = allOrders.reduce((sum, order) => sum + order.FinalPrice, 0);
        const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
        const returnRate = totalOrders ? 
            (allOrders.filter(order => order.isReturn).length / totalOrders) * 100 : 0;

        let revenueTrend = {
            labels: [],
            data: []
        };

        // Process data based on time filter
        switch(timeFilter) {
            case 'yearly':
                // Aggregate by year
                revenueTrend.labels = [year.toString()];
                revenueTrend.data = [totalRevenue];
                break;

            case 'monthly':
                // Initialize arrays for all months
                const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthlyData = new Array(12).fill(0);

                // Aggregate data by month
                allOrders.forEach(order => {
                    const month = order.createdAt.getMonth();
                    monthlyData[month] += order.FinalPrice;
                });

                revenueTrend.labels = monthLabels;
                revenueTrend.data = monthlyData;
                break;

            case 'daily':
                // Create a map to store daily totals
                const dailyTotals = new Map();
                
                // Get the range of days in the selected month
                const month = new Date().getMonth(); // You might want to make this configurable
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                
                // Initialize all days with zero
                for(let i = 1; i <= daysInMonth; i++) {
                    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
                    dailyTotals.set(dateStr, 0);
                }

                // Aggregate data by day
                allOrders.forEach(order => {
                    if (order.createdAt.getMonth() === month) {
                        const dateStr = order.createdAt.toISOString().split('T')[0];
                        dailyTotals.set(dateStr, (dailyTotals.get(dateStr) || 0) + order.FinalPrice);
                    }
                });

                revenueTrend.labels = Array.from(dailyTotals.keys());
                revenueTrend.data = Array.from(dailyTotals.values());
                break;
        }

        // Calculate payment method distribution
        const paymentMethods = [
            allOrders.filter(order => order.paymentType === 'cod').length,
            allOrders.filter(order => order.paymentType === 'online').length,
            allOrders.filter(order => order.paymentType === 'wallets').length
        ];

        // Calculate status distribution
        const statusDistribution = {
            pending: allOrders.filter(order => order.statuss === 'pending').length,
            shipped: allOrders.filter(order => order.statuss === 'shipped').length,
            delivered: allOrders.filter(order => order.statuss === 'delivered').length,
            cancelled: allOrders.filter(order => order.statuss === 'cancelled').length,
            processing: allOrders.filter(order => order.statuss === 'processing').length
        };

        // Calculate return statistics
        const returnStats = {
            total: allOrders.filter(order => order.isReturn).length,
            pending: allOrders.filter(order => order.isReturn && order.isReturnStatus === 'pending').length,
            approved: allOrders.filter(order => order.isReturn && order.isReturnStatus === 'aproved').length,
            rejected: allOrders.filter(order => order.isReturn && order.isReturnStatus === 'rejected').length
        };

        // Send the processed data
        res.json({
            totalOrders,
            totalRevenue,
            avgOrderValue,
            returnRate,
            revenueTrend,
            paymentMethods,
            statusDistribution,
            returnStats,
            timeRange: {
                start: startDate,
                end: endDate,
                timeFilter
            }
        });

    } catch (error) {
        console.error('Dashboard API error:', error);
        res.status(500).json({ 
            error: 'Error fetching dashboard data',
            message: error.message 
        });
    }
}
const bestSelling=  async (req, res) => {
    try {

               // Get top 10 best-selling products
               const topProducts = await Order.aggregate([
                { $unwind: '$items' }, // Break down the items array
                {
                    $group: {
                        _id: '$items.product', // Group by product
                        totalQuantity: { $sum: '$items.quantity' } // Sum quantities
                    }
                },
                { $sort: { totalQuantity: -1 } }, // Sort by quantity sold
                { $limit: 10 } // Top 10 products
            ]);
    
            const productDetails = await Product.find({
                _id: { $in: topProducts.map(p => p._id) }
            });
    
            const productsWithQuantity = topProducts.map(tp => {
                const product = productDetails.find(p => p._id.equals(tp._id));
                return { ...product.toObject(), totalQuantity: tp.totalQuantity };
            });
    
            // Get top 10 best-selling categories
            const topCategories = await Order.aggregate([
                { $unwind: '$items' },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'items.product',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                { $unwind: '$productDetails' },
                {
                    $group: {
                        _id: '$productDetails.categoryId', // Group by categoryId
                        totalQuantity: { $sum: '$items.quantity' } // Calculate total quantity
                    }
                },
                {
                    $lookup: {
                        from: 'categories', // Join with the categories collection
                        localField: '_id', // Match _id (categoryId) from the previous stage
                        foreignField: '_id', // Match _id in the categories collection
                        as: 'categoryDetails'
                    }
                },
                { $unwind: '$categoryDetails' }, // Unwind the category details array
                { $sort: { totalQuantity: -1 } }, // Sort by total quantity
                { $limit: 10 }, // Limit to top 10 categories
                {
                    $project: {
                        _id: 0, // Exclude _id if not needed
                        categoryName: '$categoryDetails.name', // Include category name
                        totalQuantity: 1 // Include total quantity
                    }
                }
            ]);
            
    
            // Get top 10 best-selling authors
            const topAuthors = await Order.aggregate([
                { $unwind: '$items' },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'items.product',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                { $unwind: '$productDetails' },
                {
                    $group: {
                        _id: '$productDetails.author', // Group by author
                        totalQuantity: { $sum: '$items.quantity' }
                    }
                },
                { $sort: { totalQuantity: -1 } },
                { $limit: 10 }
            ]);
    
            res.render('bestSelling', {
                products: productsWithQuantity,
                categories: topCategories,
                authors: topAuthors
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
    
    }


module.exports={
    adminLoadLogin,
    adminPostLogin,
    loadDashbord,
    pageerror,
    adminLogout,
    dashBoard,
    updateDashBoard,
    bestSelling}