const Product = require("../../models/productSchema");
const Cart = require("../../models/cartSchema");
const User = require("../../models/userSchema");
const { CommandFailedEvent } = require("mongodb");





//------------cart view--------------------------------------------------------------------------------------------------------------------------

const cartView = async (req, res) => {
   
    try {
        const userId = req.session.user._id;
        const isUserExist = await User.findById(userId)


        if (isUserExist) {

            const haveData = await Cart.findOne({ userId: userId });
            if (haveData) {
                const cart = await Cart.findOne({ userId: userId })
                    .populate({
                        path: 'items.product', // Populate the product in the items array
                        model: 'Product',
                        select: '_id coverImage name author language regularPrice salePrice stock categoryId',
                        match: { isDeleted: false }, // Select the fields we need
                        populate: {
                            path: 'categoryId', // Populate categoryId field in the product
                            model: 'Category',
                            select: 'name',
                            match: { isDeleted: false },
                            // Select only the category name
                        }
                    })
                    .exec();
                //   console.log(cart,"ffffffffffffffffffff");
                const cartDetails = cart.items.filter(item => item.product !== null && item.product !== undefined)
                    .filter(item => item.product.categoryId != null && item.product.categoryId != undefined)
                    .map(item => {
                        const product = item.product;
                        const category = product.categoryId ? product.categoryId : { name: 'Unknown' };
                       // const discount =// product.regularPrice - product.salePrice;
                       const qty=item.quantity;

                        return {
                            productId: product._id,
                            productImage: product.coverImage[0],
                            productName: product.name,
                            language: product.language,
                            author: product.author,
                            categoryId: product.categoryId,
                            categoryName: category.name,
                            salePrice: product.salePrice,
                            regularPrice: product.regularPrice,
                            stock: product.stock,
                            discount: product.discount,
                            qty:qty,
                        };
                    });



                res.render("cartView", { cart: cartDetails })
            }
            else {
                res.render("cartView", { cart: null })
            }
        }
        else {
            res.redirect("/pageNotFound");
        }
    } catch (error) {
        console.log("error while loading cart view page");
        console.log(error);
    }

}


//--------------------------------------------delete Item from cart-----------------------------------------------------------------------------------------------------

const deleteFromCart = async (req, res) => {
    try {
        if (req.session.user) {
            const userId = req.session.user._id;
            const isValidUser = await User.findById(userId);
            const productId = req.params.productId;
            console.log(productId)
            if (isValidUser && productId) {
                if (await Cart.updateOne({ userId: userId }, { $pull: { items: { product: productId } } })) {
                    res.status(200).json({ message: "success" })
                }
            }
            else {
                res.status(400).json({ message: "no user session", redirect: '/login' })
            }
        }
        else {
            res.status(400).json({ message: "no user session", redirect: '/login' })
        }
    } catch (error) {
        console.log("error while delete item from cart");
        console.log(error);
    }

}
//-----------------------------checking stock------------------------------------
const checkingStock = async (req, res) => {
    try {
        const productId = req.params.productId;
        const haveProduct = await Product.find({ _id: productId, isDeleted: false });

        if (haveProduct.length > 0) {
            const stock = haveProduct[0].stock;
            res.status(200).json({ inStock: stock, message: "Stock Available" });
        } else {
            res.status(400).json({ inStock: 0, message: "No product found. Try another." });
        }
    } catch (error) {
        console.error("Error while checking product quantity:", error);
        res.status(500).json({ inStock: 0, message: "Internal server error" });
    }
};

//-------update qty in card-------------------------------------------------------------------
const updateQtyInOrder = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const productId = req.params.productId;
        const productQty = req.params.productQty;
        const haveProduct = await Cart.find({ userId: userId });

        if (haveProduct.length > 0) {
            // const stock = haveProduct[0].stock;
            res.status(200).json({ inStock: stock, message: "Stock Available" });
        } else {
            res.status(400).json({ inStock: 0, message: "No product found. Try another." });
        }
    } catch (error) {
        console.error("Error while checking product quantity:", error);
        res.status(500).json({ inStock: 0, message: "Internal server error" });
    }
};











//-------------Addedded to cart--------------------------------------------------------
const addedeToCart = async (req, res) => {
    try {
        if (req.session.user) {
            const userId = req.session.user._id;
            const isUserExist = await User.findById(userId)
            const productId = req.params.productId;
            if (isUserExist) {
                let cart = await Cart.findOne({ userId })
                console.log(cart)
                if (!cart)//no user found in cart
                {

                    cart = new Cart({
                        userId: userId,
                        items: [{
                            product: productId,
                            quantity: 1

                        }]
                    });

                    await cart.save() // Save the new cart

                    res.status(200).json({
                        message: ' saved successfully!'
                    });


                }

                else//user already exist in cart
                {
                    const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId.toString());
                  
                    if (existingItemIndex > -1) {
                        cart.items[existingItemIndex].quantity += 1; // Increment quantity

                    } else {
                        // Item doesn't exist, add a new item to the cart
                        cart.items.push({
                            product: productId,
                            quantity: 1
                        });
                    }

                    // Update the 'updatedAt' field

                    await cart.save(); // Save the updated cart
                    res.status(200).json({
                        message: ' saved successfully!'
                    });
                }

            }
            else {
                res.status(400).json({
                    messgae: failed,
                    // redirect_url:"/login"
                })
            }
        }
        else {
            res.status(400).json({
                messgae: failed,
                // redirect_url:"/login"
            })
        }
    } catch (error) {
        console.log("error while adding to cart",error)
        res.status(400).json({
            message: ' try again!'
        });

    }

}

//--------------------------------------------------------------------------------------



const updateQtyInCart=async (req,res) => {
    try { //console.log("qtyAndProduct")
        const qtyAndProduct=req.body.itemsInCart;
       
        if(qtyAndProduct)
        {
            for (const item of qtyAndProduct) {
                const { itemId, quantity } = item;
                
                const productIdToUpdate =itemId;// new ObjectId(itemId); // Product ID to update
                const userId = req.session.user._id; // Assuming user ID from session
                const newQuantity = quantity; // New quantity value
                const price=await Product.findById(productIdToUpdate);
                const result = await Cart.updateOne(
                  { userId: userId, "items.product": productIdToUpdate }, // Match the user and product
                  { $set: { "items.$.quantity": newQuantity ,"items.$.price": price.salePrice,"items.$.discount":price.discount} } // Use the $ positional operator
                );




                      console.log(itemId,"        kosdkskd",quantity,req.session.user._id, itemId,result)
            }
            res.json({message:"success"})
    
        }
        else
        {
            res.status(404).json({message:"fail"});
        }
        
    } catch (error) {
        console.log("error while update qty in cart",error)
    }
}




module.exports = { cartView, addedeToCart, deleteFromCart, checkingStock ,updateQtyInCart}