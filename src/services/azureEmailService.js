// src/services/azureEmailService.js
import { EmailClient } from '@azure/communication-email';
import logger from '../utils/logger.js';

class AzureEmailService {
  constructor() {
    // Initialize email client with connection string
    if (!process.env.AZURE_COMMUNICATION_CONNECTION_STRING) {
      throw new Error('Azure Communication Connection String is not defined');
    }
    this.emailClient = new EmailClient(process.env.AZURE_COMMUNICATION_CONNECTION_STRING);
    logger.info('Azure Email Client initialized successfully');
  }

  /**
   * Sends an email using Azure Communication Services
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} htmlContent - HTML content of the email
   * @returns {Promise} - Result of the email send operation
   */
  async sendEmail(to, subject, htmlContent) {
    try {
      // Validate required parameters
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
          to: [
            {
              address: to,
            },
          ],
        },
      };

      // Send email and wait for completion
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

  /**
   * Sends a signup confirmation email
   * @param {Object} user - User object containing email and name
   * @param {string} confirmationToken - Email confirmation token
   */
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

  /**
   * Sends a password reset email
   * @param {Object} user - User object containing email and name
   * @param {string} resetToken - Password reset token
   */
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

// Create and export a singleton instance
const emailService = new AzureEmailService();
export default emailService;
