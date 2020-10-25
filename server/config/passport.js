const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const User = require('../models/User');
require('dotenv').config();

/* GETS COOKIE FROM REQUEST */
const cookieExtractor = req => {
    let token = null;
    if (req && req.cookies){
        token = req.cookies["accessToken"];
    }
    return token;
}

/* JWT STRATEGY */
passport.use(new JWTStrategy({
    jwtFromRequest : cookieExtractor,
    secretOrKey : process.env.JWT_SECRET
}, (payload, done) => {
    User.findById({googleID : payload.sub}, (err, user)=>{
        if (err)
            return done(err, false);
        if (user)
            return done(null, user);
        else
            return done(null, false);
    });
}));

/* GOOGLE STRATEGY */
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOneAndUpdate({ googleID: profile.id }, { firstName: profile.givenName, lastName: profile.familyName, videos: [] }, {upsert:true} , (err, user) => {
        if (err)
            return done(err);
        if (user)
            return done(null, user);
        else 
            return done(null, false);
    });
  }
));