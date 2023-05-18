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

router.all('*', cors({origin: '*'}));
router.post('/password-reset', async (req, res) => {
    const { email } = req.body;

    try {
        // Check if user exists
        const user = await getUserByEmail(email, true);
        if (!user) {
            return res.status(404).json({ message: 'User with specified email not found.' });
        }

        // Generate a unique password reset token and store it in the user's record
        const resetToken = generateResetToken();
        await storeResetToken(user.id, resetToken);

        // Send password reset email to the user with the reset link
        const resetLink = `https://example.com/reset-password?token=${resetToken}`;
        sendPasswordResetEmail(user.email, resetLink);

        return res.status(200).json({ message: 'Password reset link sent to your email.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Password reset form route
router.get('/reset-password', async (req, res) => {
    const { token } = req.query;

    try {
        // Validate the token and check if it is still valid
        const user = await getUserByResetToken(token);
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        // Render the password reset form
        return res.render('reset-password', { token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Update password route
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    try {
        // Validate the token and check if it is still valid
        const user = await getUserByResetToken(token);
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        // Update the user's password in the database
        const hashedPassword = await bcrypt.hash(password, 10);
        await updateUserPassword(user.id, hashedPassword);

        // Invalidate the reset token by removing it from the user's record
        await removeResetToken(user.id);

        return res.status(200).json({ message: 'Password reset successful.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
