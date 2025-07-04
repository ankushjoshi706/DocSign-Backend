// utils/mailer.js
const nodemailer = require("nodemailer");

async function sendSignatureRequestEmail(sender, recipient, link) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"SignFlow" <${process.env.EMAIL_SENDER}>`,
    to: recipient,
    subject: `📩 Signature Request from ${sender}`,
    html: `
      <p><strong>${sender}</strong> has requested your signature on a document.</p>
      <p>Click below to sign:</p>
      <a href="${link}">${link}</a>
    `,
    replyTo: sender,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendSignatureRequestEmail };
