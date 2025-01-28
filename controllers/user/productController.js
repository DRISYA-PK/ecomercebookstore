const Product=require("../../models/productSchema");
const Category=require("../../models/categorySchema");
const User=require("../../models/userSchema")



const productDetails=async(req,res)=>{
    try {
     //   console.log("111111111111111111111111111111111111")
     if(req.session.user._id)
     {
        const userId=req.session.user._id;
        const UserData=await User.findById(userId);
        const productId=req.query.id;
        const product=await Product.findById(productId).populate("categoryId")
        const findCategory=product.categoryId;
        const categoryOffer=findCategory?.categoryOffer||0;
        const productOffer=product.productOffer||0;
        const totalOffer=categoryOffer+productOffer;

        const relatedProduct=await Product.find({categoryId:findCategory})
        const session1=UserData;
        res.render("product-details",{product:product,relatedProduct:relatedProduct,session1});
     }
     else
        res.redirect("/login");


    } catch (error) {
        console.log(error);
        res.redirect("/pageNotFound")
    }
}












module.exports={productDetails}