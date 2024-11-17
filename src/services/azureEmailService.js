// src/services/azureEmailService.js
import logger from '../utils/logger.js';

class DevEmailService {
  constructor() {
    logger.info('📧 Development Email Service initialized - emails will be logged to console');
  }

  async sendEmail(to, subject, content) {
    logger.info('📧 Development Mode - Email Details:', {
      to,
      subject,
      content: content.substring(0, 200) + '...',
      timestamp: new Date().toISOString(),
    });
    return {
      id: `dev-${Date.now()}`,
      status: 'simulated',
      timestamp: new Date().toISOString(),
    };
  }

  async sendSignupConfirmation(user, confirmationToken) {
    const confirmationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/confirm-email/${confirmationToken}`;
    return this.sendEmail(
      user.email,
      'Welcome to Legal Scriber - Please Confirm Your Email',
      `Confirmation URL: ${confirmationUrl}`
    );
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    return this.sendEmail(user.email, 'Legal Scriber - Password Reset Request', `Reset URL: ${resetUrl}`);
  }
}

let emailService;

// Only create the appropriate service based on environment
if (process.env.NODE_ENV === 'development') {
  emailService = new DevEmailService();
} else {
  // Dynamically import Azure modules only in production
  try {
    const { EmailClient } = require('@azure/communication-email');

    class ProductionEmailService {
      constructor() {
        if (!process.env.AZURE_COMMUNICATION_CONNECTION_STRING) {
          throw new Error('Azure Communication Connection String is not defined');
        }
        this.emailClient = new EmailClient(process.env.AZURE_COMMUNICATION_CONNECTION_STRING);
        logger.info('Azure Email Client initialized successfully');
      }

      async sendEmail(to, subject, htmlContent) {
        const message = {
          senderAddress: process.env.AZURE_SENDER_EMAIL || 'noreply@legalscriber.co.za',
          content: {
            subject,
            html: htmlContent,
          },
          recipients: {
            to: [{ email: to }],
          },
        };

        const poller = await this.emailClient.beginSend(message);
        const result = await poller.pollUntilDone();

        logger.info('Email sent successfully', {
          messageId: result.id,
          recipient: to,
          status: result.status,
        });

        return result;
      }

      async sendSignupConfirmation(user, confirmationToken) {
        const confirmationUrl = `${process.env.FRONTEND_URL}/confirm-email/${confirmationToken}`;
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Welcome to Legal Scriber!</h2>
            <p>Hello ${user.name},</p>
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
        `;
        return this.sendEmail(user.email, 'Welcome to Legal Scriber - Please Confirm Your Email', htmlContent);
      }

      async sendPasswordResetEmail(user, resetToken) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Password Reset Request</h2>
            <p>Hello ${user.name},</p>
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
        `;
        return this.sendEmail(user.email, 'Legal Scriber - Password Reset Request', htmlContent);
      }
    }

    emailService = new ProductionEmailService();
  } catch (error) {
    logger.error('Failed to initialize production email service:', error);
    // Fallback to development service if production initialization fails
    emailService = new DevEmailService();
  }
}

export default emailService;
