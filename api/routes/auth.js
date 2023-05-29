// Imports
const express = require('express');
const router = express.Router();

const passport = require('../../src/app').passport;
const jwt = require("jsonwebtoken");
const cors = require('cors');
const bcrypt = require('bcrypt');

const authorization = require('../../lib/authorization');


const {
    loginValidator,
    createUserValidator,
    verifyEmailValidator,
    passwordResetValidator
} = require('../../lib/validation');
const {errorHandler, defaultErr} = require('../../lib/error');
const authentication = require('../../lib/authentication');

const {limiter, bruteForceProtection} = require('../../lib/rateLimiter');
const {getUserByEmail, createUser, markEmailAsVerified, updateUserPassword} = require("../../lib/persistence");
const {emailVerifyHandler, passwordResetHandler} = require("../../lib/handler");

router.all('*', cors({origin: '*'}));

/* Returns JWT token to use if everything goes well, returns error messages otherwise. */
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {session: false}, (err, user, info) => {
        if (err) {
            // Handle error during authentication
            return next(err);
        }

        if (!user) {
            // User authentication failed
            console.log('Authentication failed.');
            return res.status(401).json({message: info.message});
        }
        const token = jwt.sign({userId: user.userId}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRATION});
        // User authentication succeeded
        req.login(user, (err) => {
            if (err) {
                // Handle error during login
                console.log('User logged in');
                return next(err);
            }
            // Redirect or send response indicating successful login

            return res.status(200).json({message: 'Login successful', userId: user.userId, token: token});
        });
    })(req, res, next);
});

router.post('/logout', authentication.check, async (req, res) => {
    if (req.user) {
        req.logout((err) => {
            if (err) {
                // Handle any errors that occurred during logout
                return res.status(500).json({message: 'An error occurred during logout.'});
            }

            // Clear the session and log out the user
            req.session.destroy(() => {
                res.status(200).json({message: 'Logged out successfully.'});
            });
        });
    } else {
        res.status(401).send({
            message: "Not logged in."
        })
    }
});


router.get('/status', authentication.check, async (req, res) => {
    if (req.user) {
        res.status(200).send({
            message: "Valid token. User logged in.",
            userId: req.user.userId
        })
    }
})

router.get('/protected-route', authentication.check, (req, res) => {
    res.send('You have accessed the protected route.');
});


router.post('/register', createUserValidator(), async (req, res, next) => {
    const {email, password} = req.body;

    try {
        // Check if the email already exists in the database
        const existingUser = await getUserByEmail(email, false);
        if (existingUser) {
            return res.status(400).json({message: 'Email already exists.'});
        }

        // Generate a salt for password hashing
        const saltRounds = 10;


        // Hash the password
        const hashedPassword = bcrypt.hashSync(password, saltRounds);

        // Create the user
        const newUser = await createUser({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            password: hashedPassword,
            email: req.body.email,
            type: req.body.type,


        });
        const secretKey = process.env.JWT_SECRET;
        // Generate a new JWT token for the registered user
        const verificationToken = jwt.sign(email, secretKey);

        // add email verification after registration
        // emailVerifyHandler(email, verificationToken); // not working

        return res.json({
            verificationToken: verificationToken,
            userId: newUser.userId,
        });


    } catch (error) {
        return next(error);
    }
});

// Email verification route

// Route to handle email verification if the user doesnt verify it when registering
// Only a logged in user can access this route, email verification is only for users to be able to make transactions
router.post('/verify-email' ,authentication.check, verifyEmailValidator(), (req, res) => {
    // Generate a verification token
    const secretKey = process.env.JWT_SECRET; // Replace with your actual secret key
    const payload = {
        email: req.body.email,
        isVerified: false,
    };
    const verificationToken = jwt.sign(payload, secretKey);

    emailVerifyHandler(payload.email, verificationToken);


});

// Route to handle email verification
// Only a logged in user can access this route, email verification is only for users to be able to make transactions
router.get('/verify/:verificationToken' ,authentication.check, (req, res) => {
    const verificationToken = req.params.verificationToken;

    try {
        const secretKey = process.env.JWT_SECRET;
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
        res.status(200).json({message: 'Email verified successfully. You can now make transactions.'});
    } catch (err) {
        // If verification token is invalid, show an error message
        res.status(400).json({message: 'Invalid verification token.'});
    }
});

router.post('/password-reset' ,authentication.check, passwordResetValidator(), async (req, res) => {
    const secretKey = process.env.JWT_SECRET;
    const payload = {
        email: req.body.email,

    };

    const resetToken = jwt.sign(payload, secretKey);

    passwordResetHandler(payload.email, resetToken);

});

// Password reset form route
router.post('/reset-password/:resetToken', async (req, res) => {
    const resetToken = req.params.resetToken;
    const password = req.body.password;

    try {
        const secretKey = process.env.JWT_SECRET;
        const decodedToken = jwt.verify(resetToken, secretKey);


        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password in the database
        updateUserPassword(decodedToken.email, hashedPassword);


        // Redirect the user to a success page or show a success message
        res.status(200).json({ message: 'Password reset successful.' });
    } catch (err) {
        // If verification token is invalid, show an error message
        res.status(400).json({ message: 'Invalid or expired token.' });
    }
});
// Update password route


module.exports = router;
