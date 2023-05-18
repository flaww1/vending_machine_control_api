// Imports
const express = require('express');
const router = express.Router();
const logger = require('../lib/logger');
const passport = require('../../src/app').passport;
const jwt = require("jsonwebtoken");
const cors = require('cors');
const bcrypt = require('bcryptjs');

const authorization = require('../../lib/authorization');



const {loginValidator, createUserValidator} = require('../../lib/validation');
const {
    errorHandler
} = require('../../lib/error');
const authentication = require('../../lib/authentication');

const {limiter, bruteForceProtection} = require('../../lib/rate-limiting');
const {getUserByEmail, createUser} = require("../../lib/persistence");

router.all('*', cors({origin: '*'}));

/* Returns JWT token to use if everything goes well, returns error messages otherwise. */
router.post('/login', limiter, bruteForceProtection, authentication.check, loginValidator(), async (req, res, next) => {

    logger.info('User login attempt: ' + req.body.email);
    passport.authenticate('basic-login', async (err, user, info) => {
        try {
            if (err) {
                // Handling any possible errors
                return res.status(500).send(errorHandler())
            }
            if (!user) {
                logger.error('Failed login attempt for user: ' + req.body.email);
                // If the authentication goes wrong
                return res.status(401).send(info)
            }
            req.login(user, {
                session: false
            }, async (error) => {
                if (error) {
                    // Handling any possible errors
                    return res.status(500).send(errorHandler())
                }
                // If everything goes well, generate the new JWT token and send it.
                const body = {
                    userId: user.userId,
                    email: user.email
                };
                const token = jwt.sign({
                        user: body
                    }, process.env.JWT_SECRET,
                    // Signing options
                    {
                        expiresIn: process.env.JWT_EXPIRATION
                    });

                return res.json({
                    token: token,
                    userId: user.userId
                });
            });
        } catch (error) {
            logger.error('An error occurred during login: ' + error);
            return next(error);
        }
    })(req, res, next);
});

router.post('/logout', async (req, res) => {
    if (req.user) {
        req.logout();
        res.status(200).send({
            message: "Logged out."
        })
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


router.post('/register', authorization.check, createUserValidator() ,async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // Check if the email already exists in the database
        const existingUser = await getUserByEmail(email, false);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists.' });
        }

        // Hash the password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Create the user
        const newUser = await createUser(email, hashedPassword);

        // Generate a new JWT token for the registered user
        const token = jwt.sign(
            { user: { userId: newUser.userId, email: newUser.email } },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        return res.json({
            token: token,
            userId: newUser.userId
        });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
