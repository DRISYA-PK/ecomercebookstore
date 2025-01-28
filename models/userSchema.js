const mongoose=require('mongoose');
const {Schema}=mongoose;


const userSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true

    },
    profilePhoto:{
        type:String,
        required:false
    },
    resetToken:{
        type:String,
        required:false
    },
    resetTokenExpiration:{
        type:Date,
        default:Date.now
    },
    phone:{
        type:String,
        required:false,
        unique:false,
        sparse:true,
        default:null
    },
    googleId:{
        type:String,
        unique:true,
        sparse:true

    },
    password:{
        type:String,
        required:false
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    isAdmin:{
        type:Boolean,
        default:false

    },
    cart:{
        type:Schema.Types.ObjectId,
        ref:"Cart"
    },
    wallet:{
        type:Schema.Types.ObjectId,
        ref:"Wallet"
    },
    WishList:{
        type:Schema.Types.ObjectId,
        ref:"WishList"
    },
    OrderHistory:[{
         type:Schema.Types.ObjectId,
        ref:"Order"
    }],
    createdOn:{
        type:Date,
        default:Date.now
    },
    referalCode:{
        type:String,
        default:"No"
    },
    redeemed:{
        type:Boolean
    },
    redeemedUsers:[{
         type:Schema.Types.ObjectId,
        ref:"User"
    }],
    searchHistory:[{
        categor:{
            type:Schema.Types.ObjectId,
            ref:"Category"

        },
        author:{
            type:String
        },
        searchOn:{
            type:Date,
            default:Date.now
        }
    }]

})



const User=mongoose.model("User",userSchema)//create user model


module.exports=User;