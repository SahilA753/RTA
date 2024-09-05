import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configure your SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Or any other email service provider you use
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password
  },
});

// Function to generate a verification token
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export default async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: 'kladbase@gmail.com', // Sender address
    to: email, // Recipient address
    subject: 'Email Verification', // Subject line
    text: `Please verify your email by clicking on the following link: ${verificationLink}`,
    html: `<p>Please verify your email by clicking on the following link:</p><a href="${verificationLink}">Verify Email</a>`,
  };

  try {
    // Send the email
    console.log("Sending in process!")
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email.');
  }
}
