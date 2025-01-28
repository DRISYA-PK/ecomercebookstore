const { session } = require("passport");
const User = require("../../models/userSchema")
const Address = require("../../models/addressSchema")









const getProfile = async (req, res) => {

    try {
        const userId = req.session.user._id;
        const IsValidUser = await User.findById(userId);

        if (IsValidUser) {

            res.render("userProfile", { data: IsValidUser });
        }
        else {
            res.redirect("/login");
        }
    } catch (error) {
        console.log("error while loading user profile", error);
        res.redirect("/pageNotFound");
    }
}







//updaet user photo
const updateUserPhoto = async (req, res) => {
    try {
        //    console.log("kkkkkkkkkkkk");console.log(req.files[0].filename)
        const userId = req.session.user._id;
        //console.log(req.file[0].filename)
        const UserData = await User.findById(userId);
        //  console.log("hai,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,",UserData)
        if (UserData) {
            //  const images = '';
            // console.log(req.files,"ffffffffffffffffffffffilea")
            if (req.files && req.files.length > 0) {
                // console.log("hai,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,")
                //  console.log(req.files[0].filename)
                const images = req.files[0].filename;
                const updateFields = {
                    profilePhoto: images
                }
                // console.log(req.files[0].filename)
                //   console.log(updateFields,"kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk")
                await User.findByIdAndUpdate(userId, updateFields, { new: true })
                res.status(200).json({
                    message: 'Image saved successfully!',
                    filePath: `/uploads/re-image/${req.files[0].filename}` // Send the saved file path back to the frontend
                });



            }
            else {

                res.status(400).json({ message: 'No image received' });

            }

        }
        else {
            console.log('error while upload photo',)
            res.redirect("/pageNotFound")
        }


    } catch (error) {

    }

}


//userprofile information update
const updateUserProfileDetails = async (req, res) => {
    try {
        console.log(req.body);
        const userId = req.session.user._id;
        const isValidUser = await User.findById(userId);
        const { name, email, phone } = req.body;
        //  console.log(files)
        if (isValidUser) {
            const updateDetails = {
                name: name,
                email: email,
                phone: phone
            }
            console.log(updateDetails)
            if (await User.findByIdAndUpdate(userId, updateDetails, { new: true })) {
                res.status(200).json({
                    message: ' saved successfully!'
                });
            }
            else {
                res.status(400).json({ message: 'try again' });
            }

            // res.redirect("/userprofile");



        }
        else {
            res.status(400).json({ message: 'try again' });
        }
    } catch (error) {
        console.log("error while saving personal information", error);
        res.status(400).json({ message: 'try again' });
    }
}



const viewAddressDetails = async (req, res) => {
    try {
        const userId = req.session.user._id

        const isValidUser = await User.findById(userId);

        const haveAddress = await Address.find({ userId: userId })
        console.log(haveAddress, "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk")
        if (isValidUser) {
            res.render("userAddress", { data: isValidUser, address: haveAddress });
        }

    } catch (error) {

    }
}

//update or add address

const addUpdateDeletAddressDetails = async (req, res) => {
    try {
        // console.log( "0000000000000000000000000000000000000000000");
        const userId = req.session.user._id;
        const action = req.params.action;
        const addressId = req.params.addressId;
        const isValidUser = await User.findById(userId);
        const { name, phone, address, pincode, post, city, state, } = req.body;
        //  console.log(files)
        if (isValidUser) {
            const updateDetails = {
                userId: userId,
                name: name,
                phone: phone,
                address: address,
                pinCode: pincode,
                post: post,
                city: city,
                state: state

            }
            console.log(updateDetails, "cVVVVVVVvvvvvvvvvvvvv", addressId)
            if (action === "update") {
                if (await Address.findByIdAndUpdate(addressId, updateDetails, { new: true })) {
                    res.status(200).json({
                        message: ' saved successfully!'
                    });
                }
                else {
                    res.status(400).json({ message: 'try again' });
                }
            }
            else if (action === "add") {//add new address

                const newAddress = new Address(updateDetails);

                // Save the new address to the database
                const savedAddress = await newAddress.save();
                res.status(200).json({

                    message: ' saved successfully!'
                });

            }
            else if (action === "delete") {
                if (await Address.findByIdAndDelete(addressId)) {
                    res.status(200).json({

                        message: ' saved successfully!'
                    });
                }
                else {
                    res.status(400).json({ message: 'try again' });
                }
            }


            // res.redirect("/userprofile");



        }
        else {
            res.status(400).json({ message: 'try again' });
        }
    } catch (error) {
        console.log("error while saving personal information", error);
        res.status(400).json({ message: 'try again' });
    }
}













module.exports = { getProfile, updateUserPhoto, updateUserProfileDetails, viewAddressDetails, addUpdateDeletAddressDetails }




