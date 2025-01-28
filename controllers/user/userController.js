const User = require("../../models/userSchema")
const Category = require("../../models/categorySchema");
const Product = require("../../models/productSchema")
const bcrypt = require('bcrypt');
const session = require("express-session")
const nodemailer = require("nodemailer");
const env = require("dotenv").config();
const crypto = require('crypto');
const Wallet=require('../../models/wallet');



const pageNotFound = async (req, res) => {
    try {
        return res.render("page-404");

    } catch (error) {
        res.redirect("/pageNotFound");
    }
}




const loadMoreNewArrival = async (req, res) => {
    try {
        const categories = await Category.find({ isDeleted: "false" })
        let productData = await Product.find({
            isDeleted: "false",
            categoryId: { $in: categories.map(category => category._id) }
        }).
            sort({ createdAt: -1 });
        productData.sort((a, b) => new Date(b.createdAt) - new Date(b.createdAt)) //new arrival
        productData = productData.slice(12)

        res.json({ products: productData });
    } catch (error) {
        res.status(500).send("Error fetching more products.");
    }
}



const loadHomepage = async (req, res) => {
    try {
        const user = req.session.user;
        const categories = await Category.find({ isDeleted: "false" })
        let productData = await Product.find({
            isDeleted: "false",
            categoryId: { $in: categories.map(category => category._id) }
        }).populate('categoryId', 'name').
            sort({ createdAt: -1 })
            .exec();
        productData.sort((a, b) => new Date(b.createdAt) - new Date(b.createdAt))//new arrival
        productData = productData.slice(0, 12)

        const novelData = productData.filter((value) => value.categoryId.name === "NoveL")
        if (user) {
            const userData = await User.findById(user._id)
            return res.render("home", { products: productData, novelData: novelData });
        }
        else {
            console.log("without data")
            res.render("home", { products: productData, novelData: novelData });
        }

    } catch (error) {
        console.log("Home page not found");
        res.status(500).send("server error");
    }
}


const loadSignUppage = async (req, res) => {
    try {
        return res.render("signup", { message: null });
    } catch (error) {
        console.log("Home page not found");
        res.status(500).send("server error");
    }
}




function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();

}



function generateOtp() {//shut gqbm pgbn agac
    return Math.floor(100000 + Math.random() * 900000).toString();
}


async function sentVerificationMail(email, otp) {
    try {
        console.log("sender to email" + email);
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587, //process.env.EMAIL_PORT,
            secure: false,
            requireTLS: true, // True for 465, false for other ports
            auth: {
                user: process.env.NODEMAILER_EMAIL, // Your email
                pass: process.env.NODEMAILER_PASSWORD, // Your email password
            },
        });


        const mailOptions = {
            from: `"BStore Team" <${process.env.NODEMAILER_EMAIL}>`, // Sender address
            to: email, // Recipient email
            subject: 'Your OTP for Verification',
            html: `
                <h2>Hi there,</h2>
                <p>Your One-Time Password (OTP) for verification is:</p>
                <h1 style="color: #007bff;">${otp}</h1>
                <p>Please do not share this OTP with anyone. It will expire in 10 minutes.</p>
                <p>Thank you for using BStore!</p>
            `,
        };



        try {
            // Send the email
            const info = await transporter.sendMail(mailOptions);
            console.log("otp is" + otp);
            console.log(`OTP sent: ${info.messageId}`);
            return true; // Return the OTP to use later for verification
        } catch (error) {
            console.error('Error sending OTP:', error);
            return false;
            // throw error;
        }



    } catch (error) {
        console.error('Error sending OTP:', error);
        throw false;

    }
}

//post user data

const signUp = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const Referalcode = req.body.Referalcode || "No"
        console.log(Referalcode);
        const findUser = await User.findOne({ email })
        if (findUser) {
            return res.render("signUp", { message: "Email already exist" });
        }
       let referalUserId="No";
        if (Referalcode != "No") {
             referalUserId = await User.findOne({ referalCode: Referalcode })
            if (!referalUserId) {
                return res.render("signUp", { message: "Invalid ReferalCode" });
            }
        }
      
        const otp = generateOtp();
        const sendMail = await sentVerificationMail(email, otp);

        if (!sendMail) {
            return res.json("email-error")
        }
        req.session.userOtp = otp;
        req.session.userData = { name, email, phone, password, referalUserId };
        res.render("otpVerification")
    } catch (error) {
        console.error("signUp errore", error);
        res.redirect("/pagenotfound");

    }
}

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;

    } catch (error) {
        console.log("error while password Hashing");

    }
}

const otpVerification = async (req, res) => {
    try {
        const otp = req.body.otp;

        console.log("sent otp is " + otp);

        console.log("session otp is" + req.session.userOtp);
        if (!req.session.userOtp || !req.session.userData) {
            return res.status(400).json({ success: false, message: "Session expired,please try again later" });

        }
        if (otp === req.session.userOtp) {

           // console.log("sent otp is vvvvvvvvvvvvvvvv" + otp);
            const user = req.session.userData;
            const p = user.password
            const passwordHash = await securePassword(p)

            const saveUserData = new User({
                name: user.name,
                email: user.email,
                phone: user.phone,
                password: passwordHash

            })
            await saveUserData.save();
            addReferralBonus(user.referalUserId,100);
            res.json({ success: true, message: "success" });
        } else {
            res.status(400).json({ success: false, message: "Invalid OTP ,Please try again" })
        }



    } catch (error) {
        console.error("Error Verifying OTP", error);
        res.status(500).json({ success: false, message: "An error Occured " })

    }
}


async function addReferralBonus(referrerUserId, rewardAmount) {
    try {
        // Find the referrer's wallet
        let wallet = await Wallet.findOne({ userId: referrerUserId });

        if (!wallet) {
            // If no wallet exists, create a new one
            console.log("No wallet found. Creating a new wallet...");
            wallet = new Wallet({
                userId: referrerUserId,
                balance: rewardAmount, // Start with the reward amount
                transactions: [
                    {
                        transactionId: `txn_${Date.now()}`, // Unique transaction ID
                        type: "Credit",
                        amount: rewardAmount,
                        description: "Referral bonus",
                    },
                ],
            });

            // Save the new wallet
            await wallet.save();

            console.log("New wallet created and referral bonus added");
            return { success: true, message: "Referral bonus added to new wallet", wallet };
        }

        // If wallet exists, add the reward amount
        wallet.balance += rewardAmount;

        // Add a transaction record for the referral bonus
        wallet.transactions.push({
            transactionId: `txn_${Date.now()}`,
            type: "Credit",
            amount: rewardAmount,
            description: "Referral bonus",
        });

        // Save the updated wallet
        await wallet.save();

        console.log("Referral bonus added successfully");
        return { success: true, message: "Referral bonus added", wallet };
    } catch (error) {
        console.error("Error adding referral bonus:", error);
        return { success: false, message: "Error adding referral bonus" };
    }
}


//resent otp

const resendOtp = async (req, res) => {
    try {
        const { email } = req.session.userData;
        console.log(email)
        if (!email) {
            return res.status(400).json({ success: false, message: "Email not found in session" })
        }
        const otp = generateOtp();
        // req.session.userData = otp;
        req.session.userOtp = otp;
        const emailSent = await sentVerificationMail(email, otp)
        if (emailSent) {
            console.log("resent otp", otp);
            res.status(200).json({ success: true, message: "OTP Resend Successfully" })
        } else {
            res.status(500).json({ success: false, message: "failed to resent otp" }

            )
        }
    }
    catch (error) {
        console.error("Error resending OTP", error)
        res.status(500).json({ success: false, message: "internal server error" })
    }
}


//LOGIN PAGE view

const loadLoginPage = async (req, res) => {
    //  console.log(req.body)
    try {
        if (!req.session.user) {
            const message = req.session.messages ? req.session.messages[0] : null;
            req.session.messages = [];
            console.log(message)
            if (message) {
                return res.render("login", { message: "User is blocked by admin" })
            }
            return res.render("login", { message: "" });
        }
        else {

            return res.redirect("/");
        }

    } catch (error) {
        console.log(error)
        res.redirect("/pagenotfound")
    }

}
///post login
const login = async (req, res) => {
    try {

        const { email, password } = req.body;
        const findUser = await User.findOne({ isAdmin: 0, email: email });

        if (!findUser) {
            return res.render("login", { message: "user not found", session: true })
        }
        else if (findUser.isBlocked) {
            return res.render("login", { message: "User is blocked by admin" })

        }
        else {

            const passwordMatch = await bcrypt.compare(password, findUser.password);

            if (!passwordMatch) {
                //  return res.status(400).json({ message: "Invalid Password" });
                return res.render("login", { message: "Invalid Password" })
            }
            else {

                req.session.user = { _id: findUser._id, name: findUser.name, profilePhoto: findUser.profilePhoto };// = {_id:findUser._id};
                // res.status(200).json({ message: "Login successful." });
                console.log("session id is............" + req.session.user._id)
                res.redirect("/");
            }


        }


    } catch (error) {
        console.error("login error", error)
        return res.status(401).json({ message: "login fail ,try again later" });
        // res.redirect("/login",{message:"login fail ,try again later"})
    }

}


const logout = async (req, res) => {
    try {
        //   console.log("session destroy");
        req.session.destroy((err) => {
            if (err) {
                console.log("session destruction error");
                return res.redirect("pageNotFound");
            }
            else {
                return res.redirect("/");
            }
        })
    } catch (error) {
        console.log("logout error")
        return res.redirect("pageNotFound");


    }
}

const forgotPasswordView = async (req, res) => {
    try {


        res.render("forgotpassword");

    } catch (error) {

    }
}



const forgotPasswordSubmit = async (req, res) => {

    const { email } = req.body;


    try {
        // Check if the email exists in the database
        const user = await User.findOne({ email });
        if (!user) {
            console.log("haiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
            return res.status(404).json({ message: 'No user with this email found.', success: false });
        }

        // Generate a reset token
        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587, //process.env.EMAIL_PORT,
            secure: false,
            requireTLS: true, // True for 465, false for other ports
            auth: {
                user: process.env.NODEMAILER_EMAIL, // Your email
                pass: process.env.NODEMAILER_PASSWORD, // Your email password
            },
        });

        // Create Reset Password Email
        const resetLink = `http://localhost:3000/forgotPasswordlinkSubmit/${token}`; // Replace with your frontend reset URL
        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL, // Sender's email
            to: user.email,              // Receiver's email
            subject: 'Password Reset Request',
            html: `
                <h3>Password Reset Request</h3>
                <p>You requested to reset your password.</p>
                <p>Click the link below to reset your password:</p>
                <a href="${resetLink}" target="_blank">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
            `,
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Link sent', success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Try Again Later', success: false });
    }
}

const forgotPasswordlinkSubmit = async (req, res) => {
    const { token } = req.params;

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }, // Check if token is valid
        });

        if (!user) {
            return res.status(400).send('Invalid or expired token.');
        }

        res.render('passwordReset', { userId: user._id.toString(), token }); // Render reset form
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred.');
    }
}
const resetPassword = async (req, res) => {
    try {
        const userId = req.body.userId;
        const userEnterPassword = req.body.newPassword;
        console.log(userEnterPassword, "fddddddddddddddddddddddddddddddd")
        const password = await securePassword(userEnterPassword);
        console.log(password)
        await User.findByIdAndUpdate(userId, { password: password })
        res.status(200).json({ success: true })
        //res.redirect("/");
    }
    catch (err) {
        console.error(err);
        res.status(404).json({ success: false })
    }
}





const getReferalCode=  async (req, res) => {
    try {
        const  userId  =req.session.user._id;
      console.log(userId,"lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll")
        // Find the user by ID
        const user = await User.findById(userId);
       console.log(user.referalCode)
        // Check if user already has a referral code
        if (user.referalCode==="No") {

            console.log(user,"dsjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj")


        // Generate a unique referral code
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        const referralCode = `${user._id.toString().slice(-6)}-${randomString}`;

        // Update the user's referral code in the database
        user.referalCode = referralCode;
        await user.save();
        }
    res.render("getReferalCode",{data:user});

        //res.status(200).json({ message: "Referral code generated successfully", referralCode });
    } catch (error) {
        console.error("Error generating referral code:", error);
       // res.status(500).json({ message: "Internal server error" });
    }
}

const wallet =  async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 5; // Default to 5 transactions per page
        const skip = (page - 1) * limit;
        const userId=req.session.user._id;
        const user=await User.findById(userId)
        const wallet = await Wallet.findOne({ userId: userId }); // Replace req.user._id with your user ID logic
        if (!wallet) return res.status(404).send("Wallet not found");

        const totalTransactions = wallet.transactions.length; // Total number of transactions
        const totalPages = Math.ceil(totalTransactions / limit);

        const transactions = wallet.transactions
            .sort((a, b) => b.date - a.date) // Sort by most recent
            .slice(skip, skip + limit); // Paginate transactions

        res.render("walletView", {
            balance: wallet.balance.toFixed(2),
            transactions,
            currentPage: page,
            totalPages,
            data:user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
}


module.exports = {
    loadHomepage, pageNotFound, loadSignUppage, signUp, otpVerification, resendOtp, loadLoginPage, login,
    logout, loadMoreNewArrival, forgotPasswordView, forgotPasswordSubmit, forgotPasswordlinkSubmit, resetPassword,
    getReferalCode,wallet
}
