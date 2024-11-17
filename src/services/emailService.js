// src/services/emailService.js
import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

// Configure email transport
let transporter;

// Initialize the email transport based on environment
const initializeTransport = () => {
  // For development, use Ethereal (fake SMTP service)
  if (process.env.NODE_ENV === 'development') {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_EMAIL,
        pass: process.env.ETHEREAL_PASSWORD,
      },
    });
  }

  // For production, use your actual SMTP service (e.g., SendGrid, AWS SES)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Email templates
const emailTemplates = {
  signupConfirmation: (name, confirmationUrl) => ({
    subject: 'Welcome to Legal Scriber - Please Confirm Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to Legal Scriber!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for signing up with Legal Scriber. To complete your registration and access our services, please confirm your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmationUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Confirm Email Address
          </a>
        </div>
        <p>This confirmation link will expire in 24 hours.</p>
        <p>If you did not create an account with Legal Scriber, please ignore this email.</p>
        <p>Best regards,<br>The Legal Scriber Team</p>
      </div>
    `,
  }),
  passwordReset: (name, resetUrl) => ({
    subject: 'Legal Scriber - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>This reset link will expire in 2 hours.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you're concerned.</p>
        <p>Best regards,<br>The Legal Scriber Team</p>
      </div>
    `,
  }),
};

// Email service class
class EmailService {
  constructor() {
    if (!transporter) {
      transporter = initializeTransport();
    }
  }

  // Send email method
  async sendEmail(to, template, data) {
    try {
      // Get email content from template
      const emailContent = emailTemplates[template](data.name, data.confirmationUrl);

      // Send email
      const info = await transporter.sendMail({
        from: `"Legal Scriber" <${process.env.SMTP_FROM_EMAIL}>`,
        to,
        subject: emailContent.subject,
        html: emailContent.html,
      });

      logger.info('Email sent successfully', {
        messageId: info.messageId,
        template,
        recipient: to,
      });

      // For development, log the preview URL
      if (process.env.NODE_ENV === 'development') {
        logger.info('Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return info;
    } catch (error) {
      logger.error('Error sending email:', {
        error: error.message,
        template,
        recipient: to,
      });
      throw error;
    }
  }

  // Send signup confirmation email
  async sendSignupConfirmation(user, confirmationToken) {
    const confirmationUrl = `${process.env.FRONTEND_URL}/confirm-email/${confirmationToken}`;

    return this.sendEmail(user.email, 'signupConfirmation', {
      name: user.name,
      confirmationUrl,
    });
  }

  // Add password reset email method
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    return this.sendEmail(user.email, 'passwordReset', {
      name: user.name,
      resetUrl,
    });
  }
}

export default new EmailService();
