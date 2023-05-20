// Imports
const express = require('express');
const router = express.Router();
const passport = require('../../src/app').passport;
const jwt = require("jsonwebtoken");
const cors = require('cors');
const nodemailer = require('nodemailer');
const {emailVerifyHandler} = require("../../lib/handler");
const {verifyEmailValidator} = require('../../lib/validation');
const {errorHandler} = require('../../lib/error');
const authentication = require('../../lib/authentication');
const {getUserByEmail, markEmailAsVerified} = require("../../lib/persistence");

router.all('*', cors({origin: '*'}));


// Email verification route

// Route to handle email verification if the user doesnt verify it when registering
// Only a logged in user can access this route, email verification is only for users to be able to make transactions
router.post('/verify-email', authentication.check, verifyEmailValidator(),(req, res) => {
    // Generate a verification token
    const secretKey = 'JWT_SECRET'; // Replace with your actual secret key
    const payload = {
        email: req.body.email,
        isVerified: false,
    };
    const verificationToken = jwt.sign(payload, secretKey);

    emailVerifyHandler(payload.email, verificationToken);


});

// Route to handle email verification
// Only a logged in user can access this route, email verification is only for users to be able to make transactions
router.get('/verify', authentication.check, (req, res) => {
    const verificationToken = req.query.verificationToken;

    try {
        const secretKey = 'JWT_SECRET';
        const decodedToken = jwt.verify(verificationToken, secretKey);

        // Update user's email verification status in the database

        const user = getUserByEmail(decodedToken.email);


        if (user.isVerified) {
            // If the user's email is already verified, show a message indicating that
            return res.status(400).json({message: 'Email already verified.'});
        }

        // Mark the user's email as verified in the database
        markEmailAsVerified(decodedToken.email);

        // Redirect the user to a success page or show a success message
        res.status(200).json({message: 'Email verified successfully. You can now login.'});
    } catch (err) {
        // If verification token is invalid, show an error message
        res.status(400).json({message: 'Invalid verification token.'});
    }
});

module.exports = router;
