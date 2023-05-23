const persistence = require('./persistence');
const nodemailer = require('nodemailer');


const {google} = require('googleapis');
const {updateReservationPaymentStatus} = require("./reservation");
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
/* Payment Handling */
const accessToken = oauth2Client.getAccessToken();
/* E-mail Handling */

async function emailVerifyHandler(userEmail, verificationToken) {
    try {
        // Create a transporter with your email service provider details
        const transporter = nodemailer.createTransport({
            service: 'gmail',

            auth: {
                type: "OAuth2",
                user: process.env.EMAIL_ADDRESS,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken,



            }
        });


        // Define the email content
        const mailOptions = {
            from: process.env.EMAIL_ADDRESS,
            to: userEmail,
            subject: 'Email Verification',
            text: `Your verification link:  http://localhost:5000/auth/verify/${verificationToken}\n\nThis link will redirect you to our website!\n\nThank you!`,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

async function passwordResetHandler(userEmail, resetToken) {
    try {
        // Create a transporter with your email service provider details
        const transporter = nodemailer.createTransport({
            service: 'gmail',

            auth: {
                type: "OAuth2",
                user: process.env.EMAIL_ADDRESS,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken,
            }
        });
            // Define the email content
            const mailOptions = {
                from: process.env.EMAIL_ADDRESS,
                to: userEmail,
                subject: 'Password Reset',
                text: `Your password reset link:  http://localhost:5000/auth/reset-password/${resetToken}\n\nThis link will redirect you to our website!\n\nThank you!`,
            };

            // Send the email
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info.messageId);
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }

async function emailReservationCodeHandler(userEmail, reservationCode) {

    try {
        // Create a transporter with your email service provider details
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Define the email content
        const mailOptions = {
            from: process.env.EMAIL_ADDRESS,
            to: userEmail,
            subject: 'Reservation Notification',
            text: `Your reservation code is: ${reservationCode}\n\nYou can use this code to access product in a vending machine.\n\nThank you!`,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

async function postPaymentHandler(reservationId) {
    let reservation = await persistence.getReservationById(reservationId)

    if (reservation) {
        // Alter order status
        await updateReservationPaymentStatus(reservation.reservationId, 'COMPLETED');

    }
}


module.exports = {
    emailVerifyHandler,
    emailReservationCodeHandler,
    passwordResetHandler,
    postPaymentHandler,

};
