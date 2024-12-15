import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();  // Load environment variables from .env file

const transporter = nodemailer.createTransport({
  service: 'gmail',  // Gmail SMTP server
  auth: {
    user: process.env.EMAIL_USER,  // Your email
    pass: process.env.EMAIL_PASSWORD,  // Your email password (or app password)
  },
  logger: true,
  debug: true,
});

const sendInvitationEmail = async (recipientEmail, groupName, invitationLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `Invitation to join the group "${groupName}"`,
    html: `
      <p>You have been invited to join the group "${groupName}".</p>
      <p>Click the link below to join:</p>
      <a href="${invitationLink}">Join Group</a>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Invitation email sent to ${recipientEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export default sendInvitationEmail;