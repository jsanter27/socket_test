const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
require('dotenv').config();
require('../config/passport');

const authenticate = passport.authenticate('jwt', {session: false});

/* HELPER TO SIGN THE JWT TOKEN */
const signToken = googleID => {
    return jwt.sign({
        iss: process.env.JWT_ISS,
        sub: googleID
    }, process.env.JWT_SECRET, {expiresIn: "7d"});
}

/* THIS INITIATES THE LOGIN ATTEMPT */
router.get('/google', passport.authenticate('google', { scope: ['profile'], session: false }));

/* THIS IS WHERE GOOGLE SENDS YOU BACK AND SIGNS THE TOKEN */
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/auth' }), (req, res) => {
    // Successful authentication, sign JWT and redirect to success.
    const { googleID } = req.user;
    const token = signToken(googleID);
    res.cookie('accessToken', token, { httpOnly: true, sameSite: true});
    res.redirect('/auth/success');
});

/* SUCCESSFUL AUTHENTICATION */
router.get('/success', authenticate, (req, res) => {
    const { name } = req.user;
    res.send(`Welcome, ${name}`)
});

/* TEMP LOGIN PAGE */
router.get('/', (req, res) => {
    res.send("Login Page (route to /google to sign in)");
});

/* LOGOUT ROUTE */
router.get('/logout', authenticate, (req, res) => {
    res.clearCookie('accessToken');
    res.send("Logged Out!");
});

/* PERSISTENCE AUTHENTICATION */
router.get('/authenticated', authenticate, (req, res) => {
    res.send(req.user);
});


module.exports = router;