// src/services/azureEmailService.js
import { EmailClient } from '@azure/communication-email';
import logger from '../utils/logger.js';

// Development mode email service for local testing
class DevEmailService {
  constructor() {
    logger.info('📧 Development Email Service initialized - emails will be logged to console');
  }

  async sendEmail(to, subject, htmlContent) {
    logger.info('📧 Development Mode - Email Details:', {
      to,
      subject,
      preview: htmlContent.substring(0, 200) + '...',
      timestamp: new Date().toISOString(),
    });
    return {
      id: `dev-${Date.now()}`,
      status: 'simulated',
      timestamp: new Date().toISOString(),
    };
  }

  // Implement the same interface as AzureEmailService
  async sendSignupConfirmation(user, confirmationToken) {
    const confirmationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/confirm-email/${confirmationToken}`;
    logger.info('📧 Development Mode - Signup Confirmation:', {
      user: user.email,
      confirmationUrl,
    });
    return this.sendEmail(
      user.email,
      'Welcome to Legal Scriber - Please Confirm Your Email',
      `Development Mode - Confirmation URL: ${confirmationUrl}`
    );
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    logger.info('📧 Development Mode - Password Reset:', {
      user: user.email,
      resetUrl,
    });
    return this.sendEmail(
      user.email,
      'Legal Scriber - Password Reset Request',
      `Development Mode - Reset URL: ${resetUrl}`
    );
  }
}

// Production Azure email service with your existing implementation
class AzureEmailService {
  constructor() {
    if (!process.env.AZURE_COMMUNICATION_CONNECTION_STRING) {
      throw new Error('Azure Communication Connection String is not defined');
    }
    this.emailClient = new EmailClient(process.env.AZURE_COMMUNICATION_CONNECTION_STRING);
    logger.info('Azure Email Client initialized successfully');
  }

  // Your existing email template and sending methods
  async sendEmail(to, subject, htmlContent) {
    try {
      if (!to || !subject || !htmlContent) {
        throw new Error('Missing required email parameters');
      }

      const message = {
        senderAddress: process.env.AZURE_SENDER_EMAIL,
        content: {
          subject,
          html: htmlContent,
        },
        recipients: {
          to: [{ address: to }],
        },
      };

      const poller = await this.emailClient.beginSend(message);
      const result = await poller.pollUntilDone();

      logger.info('Email sent successfully', {
        recipient: to,
        messageId: result.id,
        status: result.status,
      });

      return result;
    } catch (error) {
      logger.error('Error sending email:', {
        recipient: to,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  // Your existing template methods
  async sendSignupConfirmation(user, confirmationToken) {
    if (!user?.email) {
      throw new Error('User email is required');
    }

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
    if (!user?.email) {
      throw new Error('User email is required');
    }

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

// Create and export the appropriate service based on environment
let emailService;

try {
  emailService = process.env.NODE_ENV === 'development' ? new DevEmailService() : new AzureEmailService();
} catch (error) {
  logger.warn('Failed to initialize Azure Email Service, falling back to development mode:', error.message);
  emailService = new DevEmailService();
}

export default emailService;
