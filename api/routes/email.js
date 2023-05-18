// Imports
const express   = require('express');
const router    = express.Router();
const passport  = require('../../src/app').passport;
const jwt       = require("jsonwebtoken");
const cors = require('cors');


const validator = require('../../lib/validation');
const {
    errorHandler
} = require('../../lib/error');
const authentication = require('../../lib/authentication');
const {getUserByEmail} = require("../../lib/persistence");

router.all('*', cors({origin: '*'}));

// Sign up route


// Email verification route
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    try {
        // Validate the token and check if it is still valid
        const user = await getUserByVerificationToken(token);
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        // Update the user's record to mark them as verified
        await markUserAsVerified(user.id);

        return res.status(200).json({ message: 'Email verification successful.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});


module.exports = router;
