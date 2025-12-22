const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Validate SMTP credentials
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    throw new Error(
      'SMTP credentials not configured. Please add SMTP_EMAIL and SMTP_PASSWORD to your .env file. ' +
      'See PASSWORD_RESET_SETUP.md for instructions.'
    );
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Email message
  const message = {
    from: `${process.env.FROM_NAME || 'Restaurant Management'} <${process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // Send email
  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;

