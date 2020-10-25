const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', passport.authenticate('google', { scope: ['profile'] }));

router.get('/callback', passport.authenticate('google', { failureRedirect: '/failed' }), (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/success');
});

router.get('/failed', (req, res) => {
    res.send("You failed to login!")
});

router.get('/success', (req, res) => {
    res.send(`Welcome, ${req.user.firstName}`)
});


module.exports = router;