const User = require("../../models/userSchema")
//const {userAuth,adminAuth}=require("../middlewares/auth");


const Category=require("../../models/categorySchema");
const Product=require("../../models/productSchema");
const Wishlist=require("../../models/wishListSchema")

//-----------------------------------------shope view----------------------------------------------------------------------------------
const shopePageView=async (req,res) => {
    try {
         const user = req.session.user
                ;
                let   userId;
                if(user)
                {
                  userId =req.session.user._id;
                }
         const isRender=req.query.isRender||true;
         const name=req.query.name||"";
         const page=req.query.page ||1;
         const limit=12;
       
       

 // Find all product IDs in the user's wishlist
 const wishlist = await Wishlist.findOne({ userId }, 'items.product');
 const wishlistProductIds = wishlist ? wishlist.items.map(item => item.product.toString()) : [];





         const categories=await Category.find({isDeleted:"false"})
               let productData = await Product.find({
                   isDeleted: "false", name: { $regex: `^${name}`, $options: "i" },
                   categoryId: { $in: categories.map(category => category._id) }
               }).sort({updatedAt:-1}) . limit(limit*1).skip((page-1)*limit)
               .populate('categoryId', 'name') 
                .lean(); 

               if(user)
                {
 
                productData = productData.map(product => ({
                 ...product,
                 isInWishlist: wishlistProductIds.includes(product._id.toString()), // Check if product exists in wishlist
             }));
           }


         



    const count=await Product.find({
      isDeleted: "false", name: { $regex: `^${name}`, $options: "i" },
      categoryId: { $in: categories.map(category => category._id) }
  }).countDocuments();


               if(isRender==='false')
               {
              
              
               res.status(200).json({message:"success",products:productData})
               return;
               }
       
               console.log(productData)
                    
                    if (user) {
                         const userData = await User.findById(user._id)
                          return res.render("shopePage",{products:productData,category:categories, 
                            currentPage:page,
                            totalPages:Math.ceil(count/limit)});
                      }
                      else {
                      
                          res.render("shopePage",{products:productData,category:categories,
                            currentPage:page,
                            totalPages:Math.ceil(count/limit),
                          });
                      }
      
    } catch (error) {
        console.log("error while load shopeepage",error)
    }
    
}

//----------------------------------------------shope page filter---------------------------------------------------------------------------------------------
const filterShopePageView=async (req,res) => {
    try {

//console.log("oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo");
const user = req.session.user;
const categories = await Category.find({ isDeleted: "false" });
let query = {};

// Initial query to ensure products are not deleted
query.isDeleted = "false";

// Extract query parameters from the request
const { categorySelected, sortSelected, languageSelected, ratingSelected } = req.query;

// Category filter
if (categorySelected && categorySelected !== 'all') {
  // If category is selected and not "all", apply both the categoryId filter and the selected category
  query.categoryId = { 
    $in: categories.map(category => category._id), // Products must belong to one of the categories
    $eq: categorySelected // And the product's categoryId should match the selected category
  };
} else {
  // If no category is selected, just filter products belonging to available categories
  query.categoryId = { $in: categories.map(category => category._id) };
}

// Language filter
if (languageSelected && languageSelected !== 'all') {
  query.language = languageSelected; // Filter by language
}

// Rating filter
if (ratingSelected && ratingSelected !== 'all') {
  query.rating = { $gte: parseInt(ratingSelected) }; // Filter by rating greater than or equal to the selected rating
}

// Fetch the filtered products
let productData = await Product.find(query)
  .populate('categoryId', 'name')  // Populate categoryId with category names
  .exec();

// Optionally apply sorting here if needed
if (sortSelected) {
  switch (sortSelected) {
    case 'priceLowHigh':
      productData = productData.sort((a, b) => a.salePrice - b.salePrice); // Sort by price (Low to High)
      break;
    case 'priceHighLow':
      productData = productData.sort((a, b) => b.salePrice - a.salePrice); // Sort by price (High to Low)
      break;
    case 'ratings':
      productData = productData.sort((a, b) => b.rating - a.rating); // Sort by ratings (Highest first)
      break;
    case 'newArrivals':
      productData = productData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by newest products
      break;
    case 'aToZ':
      productData = productData.sort((a, b) => a.name.localeCompare(b.name)); // Sort by A-Z
      break;
    case 'zToA':
      productData = productData.sort((a, b) => b.name.localeCompare(a.name)); // Sort by Z-A
      break;
    default:
      // If no sorting option is selected, leave the order unchanged
      break;
  }
}
console.log(productData)

// Return the filtered and sorted products as a response
res.status(200).json({
  message: "success",
  products: productData
});





                
    } catch (error) {
        console.log("error while load shopeepage",error)
    }
    
}
module.exports={shopePageView,filterShopePageView}