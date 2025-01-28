const express=require("express");
const router=express.Router();
const passport=require("passport");
const userController=require("../controllers/user/userController")
const productController=require("../controllers/user/productController");
const profileController=require("../controllers/user/profileController");
const cartController=require("../controllers/user/cartManagementController");
const shopeController=require("../controllers/user/shopController");
const orderController=require("../controllers/user/orderController");
const wishController=require("../controllers/user/wishList");
const invoiceController=require("../controllers/user/invoice");
const multer = require("multer");
const uploads = require("../helpers/multer");

const {userAuth,adminAuth}=require("../middlewares/auth");
const { route } = require("./adminRouter");


router.get("/pageNotFound",userController.pageNotFound);

router.get("/",userController.loadHomepage);
router.get("/signUp",userController.loadSignUppage);

router.post("/signUp",userController.signUp);
router.post("/otpVerification",userController.otpVerification);
router.post("/resendOtp",userController.resendOtp);

//passport for google login
router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}))
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/login', failureMessage: true}),(req,res)=>{
     req.session.user = {
        _id: req.user.id,
        name: req.user.name,// Email of the authenticated user
        profilePhoto:req.user.profilePhoto
    };
    res.redirect('/');
})
//change passsword

router.get("/forgotpassword",userController.forgotPasswordView);
router.post("/forgotpassword",userController.forgotPasswordSubmit);
router.get("/forgotPasswordlinkSubmit/:token",userController.forgotPasswordlinkSubmit);
router.post("/resetpassword",userController.resetPassword);

///login page GET

router.get("/login",userController.loadLoginPage);

router.post("/login",userController.login);

router.get("/logout",userController.logout);


//product management

router.get("/loadMoreNewArrival",userController.loadMoreNewArrival);
router.get("/productDetails",userAuth,productController.productDetails);



//profile management
router.get("/userprofile",userAuth ,profileController.getProfile);
router.post("/uploadprofilephoto",userAuth ,uploads.array("profilePhoto",1),profileController.updateUserPhoto);
router.post("/updateuserprofiledetails",userAuth ,profileController.updateUserProfileDetails);
router.get("/viewadddresdetails",userAuth ,profileController.viewAddressDetails);
router.post("/add-update-delete-addressdetails/:action/:addressId",userAuth ,profileController.addUpdateDeletAddressDetails);




//------------------cart management----------------------------------------------------------------------------------------------------------------------------
router.get("/cartmanagement",userAuth ,cartController.cartView);
router.post("/addedetocart/:productId",cartController.addedeToCart);
router.post("/updateQtyInCart",cartController.updateQtyInCart);
router.post("/deleteitemfromcart/:productId",userAuth,cartController.deleteFromCart);
router.post("/checkingstock/:productId",userAuth,cartController.checkingStock);
//router.post("/updateQtyInOrder/:productId",userAuth,cartController.updateQtyInOrder);


//-----------------checkout------------------------------------------------------------------------------------------------------------
router.post("/confirmaddress",userAuth,orderController.confirmAddress);
router.post("/requestonlinepayment",userAuth,orderController.requestOnline);
router.post("/confirmPayment",userAuth,orderController.confirmPayment);
router.post("/verifyPayment",userAuth,orderController.verifyPayment);
router.get("/checkingwallet",userAuth,orderController.checkingWallet)
router.post("/updatePaymentSuccess",userAuth,orderController.updatePaymentSuccess)


router.get("/paymentSuccessPage/:paymentId/:amount", userAuth, orderController.paymentSuccessPage);

router.get("/showhistory",userAuth,orderController.showHistory);
router.post("/cancelorder/:orderId", userAuth, orderController.cancelOrder);

router.get("/returnView",userAuth,orderController.returnView);

router.post("/returnsubmit", userAuth, orderController.returnSubmit);
//invoice generation-------------------------------------------------------------------

router.get("/api/orders/:orderId/invoice",userAuth,invoiceController.downloadInvoice);



//------------------------referal code--------------------------------

router.get("/getreferalcode",userAuth ,userController.getReferalCode);

//-------------------shop page -------------------------------------------------------------------------------------------------------------------------------

router.get("/shopePageView" ,shopeController.shopePageView);
router.get("/filterInShopePage" ,shopeController.filterShopePageView);


//----------------wishLIst-------
router.post("/addedetowishlist/:productId",wishController.addedeToWishList);
router.get("/wishlist",userAuth,wishController.viewWishList);
router.post("/deleteitemfromwishlist/:productId",userAuth,wishController.deleteFromWishList);

//----wallet view-----------------------
router.get("/wallet",userAuth,userController.wallet);



module.exports=router;