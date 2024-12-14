// src/services/azureEmailService.js
import { EmailClient } from '@azure/communication-email';
import logger from '../utils/logger.js';

// Development email service for local testing environment
class DevEmailService {
  constructor() {
    // Determine the frontend URL based on environment
    this.frontendUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:5173'
        : process.env.FRONTEND_URL || 'https://legalscriber.co.za';

    logger.info('📧 Development Email Service initialized', {
      frontendUrl: this.frontendUrl,
      environment: process.env.NODE_ENV,
    });
  }

  // Generic email sending method for development
  async sendEmail(to, subject, htmlContent) {
    // Enhanced console output for better visibility during development
    console.log('\n📧 Development Mode - Email Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Content Preview:', htmlContent.substring(0, 150) + '...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Log to winston logger for consistency
    logger.info('📧 Development Mode - Email Details:', {
      to,
      subject,
      preview: htmlContent.substring(0, 200) + '...',
      timestamp: new Date().toISOString(),
    });

    // Simulate network delay for realistic testing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return simulated response
    return {
      id: `dev-${Date.now()}`,
      status: 'simulated',
      timestamp: new Date().toISOString(),
    };
  }

  // Send signup confirmation email
  async sendSignupConfirmation(user, confirmationToken) {
    if (!user?.email) {
      throw new Error('User email is required for confirmation email');
    }

    // Construct confirmation URL
    const confirmationUrl = `${this.frontendUrl}/confirm-email/${confirmationToken}`;

    // Enhanced logging for development testing
    console.log('\n🔗 Email Confirmation Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Confirmation URL:', confirmationUrl);
    console.log('User Email:', user.email);
    console.log('Token:', confirmationToken);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Create email HTML content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to Legal Scriber!</h2>
        <p>Hello ${user.name},</p>
        <p>Thank you for signing up with Legal Scriber. Please confirm your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmationUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Confirm Email Address
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #4F46E5;">${confirmationUrl}</p>
        <p>This confirmation link will expire in 24 hours.</p>
        <p>If you did not create an account with Legal Scriber, please ignore this email.</p>
        <p>Best regards,<br>The Legal Scriber Team</p>
      </div>
    `;

    return this.sendEmail(user.email, 'Welcome to Legal Scriber - Please Confirm Your Email', htmlContent);
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    if (!user?.email) {
      throw new Error('User email is required for password reset');
    }

    const resetUrl = `${this.frontendUrl}/reset-password/${resetToken}`;

    // Enhanced logging for password reset
    console.log('\n🔑 Password Reset Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Reset URL:', resetUrl);
    console.log('User Email:', user.email);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
        <p>This reset link will expire in 2 hours.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you're concerned.</p>
        <p>Best regards,<br>The Legal Scriber Team</p>
      </div>
    `;

    return this.sendEmail(user.email, 'Legal Scriber - Password Reset Request', htmlContent);
  }
}

// Production Azure email service implementation
class AzureEmailService {
  constructor() {
    if (!process.env.AZURE_COMMUNICATION_CONNECTION_STRING) {
      throw new Error('Azure Communication Connection String is not defined');
    }
    this.emailClient = new EmailClient(process.env.AZURE_COMMUNICATION_CONNECTION_STRING);
    logger.info('Azure Email Client initialized successfully');
  }

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

  // Use the same interface methods for production
  async sendSignupConfirmation(user, confirmationToken) {
    const frontendUrl = process.env.FRONTEND_URL || 'https://legalscriber.co.za';
    const confirmationUrl = `${frontendUrl}/confirm-email/${confirmationToken}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to Legal Scriber!</h2>
        <p>Hello ${user.name},</p>
        <p>Thank you for signing up with Legal Scriber. Please confirm your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmationUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Confirm Email Address
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #4F46E5;">${confirmationUrl}</p>
        <p>This confirmation link will expire in 24 hours.</p>
        <p>If you did not create an account with Legal Scriber, please ignore this email.</p>
        <p>Best regards,<br>The Legal Scriber Team</p>
      </div>
    `;

    return this.sendEmail(user.email, 'Welcome to Legal Scriber - Please Confirm Your Email', htmlContent);
  }

  async sendPasswordResetEmail(user, resetToken) {
    const frontendUrl = process.env.FRONTEND_URL || 'https://legalscriber.co.za';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

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
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
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
