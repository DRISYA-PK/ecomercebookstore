const User = require("../../models/userSchema")



const customerInfo = async (req, res) => {
   // console.log("hai")
    try {
        let search = "";
        if (req.query.search) {
            search = req.query.search;
        }
        console.log(search);
        let page = 1;
        if (req.query.page) {
            page = req.query.page;
        }
        console.log("page is"+page);
        let limit = 6;
        const userData = await User.find({
            isAdmin: false,
            $or: [
                { name: { $regex: "." + search + "." } },
                { email: { $regex: "." + search + "." } }
            ]
        })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await User.find({
            isAdmin: false,
            $or: [
                { name: { $regex: "." + search + "." } },
                { email: { $regex: "." + search + "." } }
            ]
        }).countDocuments();
        res.render("customers", {
            data: userData,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        })

    } catch (error) {

    }
}
const customerBlocked=async(req,res)=>{
    try {
        let id=req.query.id;
        let currentPage=req.query.currentPage;
        await User.updateOne({_id:id},{$set:{isBlocked:true}})
        res.redirect(`/admin/users?page=${currentPage}`)
       
        
    } catch (error) {
        console.log("error is",error)
        res.redirect("/pageerror")
    }
}


const customerUnBlocked=async(req,res)=>{
    try {

        let id=req.query.id;
        let currentPage=req.query.currentPage;
      
        await User.updateOne({_id:id},{$set:{isBlocked:false}})
        res.redirect(`/admin/users?page=${currentPage}`)
        
    } catch (error) {
        res.redirect("/pageerror")
    }
}

module.exports = {
    customerInfo,
    customerBlocked,
    customerUnBlocked
}