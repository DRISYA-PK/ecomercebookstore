const express=require("express");
const app=express();
const path=require("path");
const env=require('dotenv').config()
const db=require("./config/db")
const userRouter=require("./routes/userRouter")
const passport=require("./config/passport")  
const adminRouter=require("./routes/adminRouter")
const { activeCoupon } = require('./middlewares/activeCoupon');

const session=require("express-session")
db()

app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.use((req, res, next) => {
    res.set("cache-control", "no-store");
    next();
  });

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveuninitialized: true,
    cookie:{
        secure:false,
        httpOnly:true,
        maxAge:72*60*60*1000
    }
}))
//local initializing
app.use((req, res, next) => {
    res.locals.user = req.session.user;// Example user object
    next();
});

//initialize passport for direct google login
app.use(passport.initialize());
app.use(passport.session());



app.set("view engine","ejs")

app.set("views", [
    path.join(__dirname, 'views/user'),
    path.join(__dirname, 'views/admin')
]);

app.use(express.static(path.join(__dirname, "public")));

app.use("/",userRouter)
app.use("/admin",adminRouter)




//activating coupon
app.use(async (req, res, next) => {
    try {
        // Call the activeCoupon function before handling other requests
        await activeCoupon(req, res);
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.log("Error while updating coupon status:", error);
        next(); // Proceed with the request even if there's an error (optional)
    }
});


//app.use("/signUp",userRouter)
app.listen(process.env.PORT,()=>{
    console.log("server running")
})

module.exports=app;