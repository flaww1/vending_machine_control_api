const persistence = require('./persistence');
const nodemailer = require('nodemailer');

/* Payment Handling */

/* E-mail Handling */

async function emailHandler(notification) {

  // Building email HTML

  let userInfo = await persistence.getUserByuserId(notification.user);

  let emailHTML =
    `INSERT HERE EMAIL HTML TEMPLATE`;

  let transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: userInfo.email,
    subject: `Vending Machines Control | ${notification.title}`,
    html: emailHTML,
    text: emailHTML,

  };

  transport.sendMail(mailOptions, function (err, info) {
    if (err) {
      persistence.report(err);
    }
  });

}

module.exports = {
  emailHandler,
};
