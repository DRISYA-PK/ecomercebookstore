const WishList = require("../../models/wishListSchema");
const User = require("../../models/userSchema");



//-----added to WishList----------

const addedeToWishList = async (req, res) => {
    try {
        console.log("Adding to Wishlist...");

        if (req.session.user) {
            const userId = req.session.user._id;
            const productId = req.params.productId;

            // Fetch the user's wishlist
            let wishlist = await WishList.findOne({ userId: userId }); // Use findOne instead of find


            if (!wishlist) {
                // If no wishlist exists, create a new one
                wishlist = new WishList({
                    userId: userId,
                    items: [
                        {
                            product: productId,
                        },
                    ],
                });

                await wishlist.save(); // Save the new wishlist
                return res.status(200).json({
                    message: "Wishlist created and product added successfully!",
                });
            } else {
                // Check if the product already exists in the wishlist
                const existingItemIndex = wishlist.items.findIndex(
                    (item) => item.product.toString() === productId.toString()
                );

                if (existingItemIndex === -1) {
                    // Add the product to the wishlist if it doesn't exist
                    wishlist.items.push({
                        product: productId,
                    });

                    await wishlist.save(); // Save the updated wishlist
                    return res.status(200).json({
                        message: "Product added to the wishlist successfully!",
                    });
                } else {


                    await WishList.updateOne(
                        { userId }, // Match the wishlist by the user's ID
                        { $pull: { items: { product: productId } } } // Remove the product from the items array
                    );



                    return res.status(200).json({
                        message: "Product removed from wishlist.",
                    });
                }
            }
        } else {
            res.status(401).json({
                message: "Unauthorized. Please log in to access your wishlist.",
            });
        }
    } catch (error) {
        console.error("Error while adding to Wishlist:", error);
        res.status(400).json({
            message: "An error occurred while adding to the wishlist. Please try again!",
        });
    }

}




//-------view viweWishList--------------
const viewWishList = async (req, res) => {

    try {
        const userId = req.session.user._id;
        const isUserExist = await User.findById(userId)


        if (isUserExist) 
            {

            const haveUserData = await WishList.findOne({ userId: userId });
            if (haveUserData) 
                {
                const wishlist = await WishList.findOne({ userId: userId })
                    .populate({
                        path: 'items.product', // Populate the product in the items array
                        model: 'Product',
                        select: '_id coverImage name author language regularPrice salePrice stock categoryId rating',
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
                const wishlistDetails = wishlist.items.filter(item => item.product !== null && item.product !== undefined)
                    .filter(item => item.product.categoryId != null && item.product.categoryId != undefined)
                    .map(item => {
                        const product = item.product;
                        const category = product.categoryId ? product.categoryId : { name: 'Unknown' };
                        const discount = product.regularPrice - product.salePrice;

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
                            discount: discount,
                            rating: product.rating,
                        };
                    });


                res.render("wishlist", { data: isUserExist, product: wishlistDetails })
            }
            else {
                res.render("wishlist", { data: isUserExist, product: null })
            }
        }
        else {
            res.redirect("/pageNotFound");
        }
    } catch (error) {
        console.log("error while loading wishlist view page");
        console.log(error);
    }

}



//--------delete from Wish List----------------------
const deleteFromWishList = async (req, res) => {
    try {
        if (req.session.user) {
            const userId = req.session.user._id;
            const isValidUser = await User.findById(userId);
            const productId = req.params.productId;
            if (isValidUser && productId) {
                if (await WishList.updateOne({ userId: userId }, { $pull: { items: { product: productId } } })) {
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
        console.log("error while delete item from WishList");
        console.log(error);
    }

}

module.exports = {
    addedeToWishList,
    viewWishList,
    deleteFromWishList
}