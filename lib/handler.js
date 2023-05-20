const persistence = require('./persistence');
const nodemailer = require('nodemailer');

/* Payment Handling */

/* E-mail Handling */

async function emailReservationCodeHandler(userEmail, reservationCode) {
  try {
    // Create a transporter with your email service provider details
    const transporter = nodemailer.createTransport({
      service: 'Vending Machines Control System',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
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

async function emailVerifyHandler(userEmail, verificationToken) {
  try {
    // Create a transporter with your email service provider details
    const transporter = nodemailer.createTransport({
      service: 'Vending Machines Control System',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Define the email content
    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: userEmail,
      subject: 'Email Verification',
      text: `Your verification link:  exemplo.com/${verificationToken}\n\nThis link will redirect you to our website!\n\nThank you!`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}



  // Building email HTML



module.exports = {
  emailVerifyHandler,
    emailReservationCodeHandler,

};
