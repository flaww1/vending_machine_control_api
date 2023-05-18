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
const {getUserByEmail, markEmailAsVerified} = require("../../lib/persistence");

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
        await markEmailAsVerified(user.id);

        return res.status(200).json({ message: 'Email verification successful.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

app.get('/verify-email/:verificationToken', async (req, res) => {
    const verificationToken = req.params.verificationToken;

    // Find the user with the given verification token
    const user = await findUserByVerificationToken(verificationToken);

    if (!user) {
        // If user is not found or token is invalid/expired, show an error message
        return res.status(400).json({ message: 'Invalid verification token.' });
    }

    if (user.isVerified) {
        // If the user's email is already verified, show a message indicating that
        return res.status(400).json({ message: 'Email already verified.' });
    }

    // Mark the user's email as verified in the database
    await markEmailAsVerified(user.id);

    // Redirect the user to a success page or show a success message
    res.status(200).json({ message: 'Email verified successfully. You can now login.' });
});


To implement email verification with the isVerified flag in your user table, you can modify the code as follows:

    User Registration:
    javascript
Copy code
// Assuming you have a route for user registration
app.post('/register', async (req, res) => {
    // Collect user registration data from request body

    // Generate a verification token
    const verificationToken = generateVerificationToken();

    // Store the user data and verification token in the user database
    const user = await createUser(email, password, verificationToken, false);

    // Send verification email
    sendVerificationEmail(user.email, user.verificationToken);

    // Return a response indicating successful registration
    res.status(200).json({ message: 'Registration successful. Please check your email for verification.' });
});
Verify Email Endpoint:
    javascript
Copy code
app.get('/verify-email/:verificationToken', async (req, res) => {
    const verificationToken = req.params.verificationToken;

    // Find the user with the given verification token
    const user = await findUserByVerificationToken(verificationToken);

    if (!user) {
        // If user is not found or token is invalid/expired, show an error message
        return res.status(400).json({ message: 'Invalid verification token.' });
    }

    if (user.isVerified) {
        // If the user's email is already verified, show a message indicating that
        return res.status(400).json({ message: 'Email already verified.' });
    }

    // Mark the user's email as verified in the database
    await markEmailAsVerified(user.id);

    // Redirect the user to a success page or show a success message
    res.status(200).json({ message: 'Email verified successfully. You can now login.' });
});

function sendVerificationEmail(email, verificationToken) {
    // Generate the verification link using the verification token
    const verificationLink = `https://your-app-domain.com/verify-email/${verificationToken}`;

    // Compose the email message with the verification link
    const emailMessage = `Click the following link to verify your email: ${verificationLink}`;

    // Use your preferred email sending method to send the email to the user
    // Example using nodemailer library
    transporter.sendMail({
        to: email,
        subject: 'Email Verification',
        text: emailMessage
    });
}



module.exports = router;
