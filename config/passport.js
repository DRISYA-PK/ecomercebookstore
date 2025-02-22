const passport = require('passport');
//const GoogleStrategy = require("passport-google-oauth20").strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../models/userSchema")
const env = require("dotenv").config();


const callbackURL = "https://bstore.site/auth/google/callback" // Change port if needed


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Corrected
    
    callbackURL: callbackURL
},

    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id})
            if (user) {
                if(user.isBlocked)
                {
                    return done(null, false, { message: 'Blocked by admin' });
                  //  return done('blocked by admin', null)
                }
                else
                {
                    return done(null, user)
                }
            } else {
                user = new User({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id
                })
                await user.save();
                return done(null, user)
            }


        } catch (error) {
            return done(error, null)

        }
    }

))


//assign user details to session
passport.serializeUser((user, done) => {
    done(null, user.id)
});


//fetch data from session 
passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => {
            done(null, user)
        })
        .catch(err => {
            done(err, null)
        })
});



module.exports = passport;
