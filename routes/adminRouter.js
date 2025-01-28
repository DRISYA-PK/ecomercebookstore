const express=require("express");
const router=express.Router();

const adminController=require("../controllers/admin/adminController")
const {userAuth,adminAuth}=require("../middlewares/auth");
const customerController=require("../controllers/admin/customerController")
const categoryController=require("../controllers/admin/categoryController")
const productController=require("../controllers/admin/productController");
const couponController=require("../controllers/admin/couponController");
const orderController=require("../controllers/admin/orderController");
const saleReportController=require("../controllers/admin/saleReportController");
const bannerController=require("../controllers/admin/bannerController");
const multer = require("multer");
const uploads = require("../helpers/multer");
//const uploads=multer({storage:storage});



router.get("/pageerror",adminController.pageerror)
router.get("/adminlogin",adminController.adminLoadLogin)
router.post("/adminlogin",adminController.adminPostLogin)
router.get("/",adminAuth,adminController.loadDashbord)
router.get("/adminlogout",adminController.adminLogout)
router.get("/users",adminAuth,customerController.customerInfo)

router.get("/blockCustomer",adminAuth,customerController.customerBlocked)
router.get("/unblockCustomer",adminAuth,customerController.customerUnBlocked)


//categorymanagement
router.get("/category",adminAuth,categoryController.categoryInfo)
router.post("/addCategory",adminAuth,categoryController.addCategory)
router.get("/editCategory",adminAuth,categoryController.getEditCategory)

router.post("/editCategory/:id",adminAuth,categoryController.editCategory)
router.post("/deleteCategory/:id",adminAuth,categoryController.deleteCategory)




//product management
router.get("/addProducts",adminAuth,productController.getProductAddPage)
router.post("/addProducts",adminAuth,uploads.array("images",4),productController.addProducts)
router.get("/products",adminAuth,productController.getAllProducts)
router.get("/editProduct",adminAuth,productController.getEditProduct);
router.post("/editProduct/:id",adminAuth,uploads.array("images",4),productController.editProduct);
router.post("/deleteImage",adminAuth,productController.deleteSingleImage);
//router.post("/deleteProduct/:id",adminAuth,productController.deleteProduct);

router.post("/deleteProduct/:id",adminAuth,productController.deleteProduct);





//---coupon controller
router.get("/coupon",adminAuth,couponController.showCoupon);
router.post("/addcoupon",adminAuth,couponController.addCoupon);
router.post("/deletecoupon",adminAuth,couponController.deleteCoupon);


//order 

router.get("/vieworder",adminAuth,orderController.viewOrder);
router.post("/updatestatus",adminAuth,orderController.updateStatus);

//return
router.get("/returnmanagement",adminAuth,orderController.returnView);
router.post("/returnrejected",adminAuth,orderController.returnRejected);

router.post("/returnapproved",adminAuth,orderController.returnApproved);


router.get("/viewreport",adminAuth,orderController.viewReport);
router.get("/sales-report",adminAuth,saleReportController.generateSalesReport)

//dashboard     admin/api/dashboard-data
router.get("/dashboard",adminAuth,adminController.dashBoard);
router.get("/api/dashboard-data",adminAuth,adminController.updateDashBoard)

//bestselling
router.get("/bestselling",adminAuth,adminController.bestSelling);


//banner
router.get("/banner",adminAuth,bannerController.renderAddBannerPage);
module.exports=router;