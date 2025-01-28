const { session } = require("passport")
const User = require("../models/userSchema")


//user authentication
const userAuth = (req, res, next) => {
  if (req.session.user) {
    
    const id = req.session.user._id;
    User.findById(id).then(data => {
      if (data && !data.isBlocked) {
        next();
      }
      else {
        req.session.destroy();
        res.redirect("/login");
      }

    })
      .catch(error => {
        console.log("error in User authentication", error);
        res.status(500).send("Internal Server Error");
      })
  }
  else {
    res.redirect("/login");
  }
}



const adminAuth = (req, res, next) => {
  // if(req.session.admin)
  // {

  User.findOne({ isAdmin: req.session.admin }).then(data => {
    if (data) {
      // console.log("auth")
      next();
    } else {
      res.redirect("/admin/adminlogin")
    }
  })
    .catch(error => {
      console.log("error in admin auth", error);
      res.status(500).send("internal server error");

    })

}

// const checkAdminAuth=(req,res,next)=>{

//}
//else
//{
//  res.redirect("/admin/adminlogin")
//}






module.exports = {
  userAuth,
  adminAuth
}