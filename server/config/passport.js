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

/* REQUIRED BUT USELESS SINCE WE AREN'T USING SESSIONS */
passport.serializeUser( (user, done) => done(null, user));
passport.deserializeUser( (user, done) => done(null, user));

/* JWT STRATEGY */
passport.use(new JWTStrategy({
    jwtFromRequest : cookieExtractor,
    secretOrKey : process.env.JWT_SECRET
}, (payload, done) => {
    User.findOne({googleID : payload.sub}, (err, user)=>{
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
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOneAndUpdate({ googleID: profile.id }, { name: profile.displayName }, { upsert: true } , (err, user) => {
        if (err)
            return done(err, false);
        if (user)
            return done(null, user);
        else 
            return done(null, false);
    });
  }
));