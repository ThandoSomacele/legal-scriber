// src/services/azureEmailService.js
import { EmailClient } from '@azure/communication-email';
import logger from '../utils/logger.js';

/**
 * Azure Communication Services Email Service
 * Handles all email communications using Azure Communication Services
 */
class AzureEmailService {
  constructor() {
    this.emailClient = null;
    this.initialize();
  }

  /**
   * Initialises the Azure Email client with connection string
   */
  initialize() {
    try {
      const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
      if (!connectionString) {
        throw new Error('Azure Communication Connection String is not defined');
      }
      this.emailClient = new EmailClient(connectionString);
      logger.info('Azure Email Client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Azure Email client:', error);
      throw error;
    }
  }

  /**
   * Sends email using Azure Communication Services
   * @param {Object} emailDetails - Contains email sending details
   * @returns {Promise} - Returns the email send operation result
   */
  async sendEmail(emailDetails) {
    try {
      const { to, subject, htmlContent, plainText } = emailDetails;

      const message = {
        senderAddress: process.env.AZURE_EMAIL_SENDER_ADDRESS,
        content: {
          subject,
          html: htmlContent,
          plainText: plainText || htmlContent.replace(/<[^>]+>/g, ''), // Strip HTML if plainText not provided
        },
        recipients: {
          to: [
            {
              address: to,
              displayName: emailDetails.displayName,
            },
          ],
        },
      };

      // Handle attachments if present
      if (emailDetails.attachments) {
        message.attachments = emailDetails.attachments.map(attachment => ({
          name: attachment.name,
          contentType: attachment.contentType,
          contentInBase64: attachment.content,
        }));
      }

      // Start the send operation
      const poller = await this.emailClient.beginSend(message);

      // Implement custom polling with timeout
      const POLLER_WAIT_TIME = 10; // seconds
      let timeElapsed = 0;

      while (!poller.isDone()) {
        await poller.poll();
        console.log('Email send polling in progress');
        await new Promise(resolve => setTimeout(resolve, POLLER_WAIT_TIME * 1000));
        timeElapsed += POLLER_WAIT_TIME;

        if (timeElapsed > 180) {
          // 3 minutes timeout
          throw new Error('Email sending operation timed out');
        }
      }

      // Check the result
      const result = poller.getResult();
      if (result.status === 'Succeeded') {
        logger.info(`Email sent successfully. Operation ID: ${poller.getOperationId()}`);
        return result;
      } else {
        throw new Error(`Email sending failed with status: ${result.status}`);
      }
    } catch (error) {
      logger.error('Email sending error:', error);
      throw error;
    }
  }

  /**
   * Sends signup confirmation email
   * @param {Object} user - User object containing email and name
   * @param {string} confirmationToken - Email confirmation token
   */
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

    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to Legal Scriber - Please Confirm Your Email',
      htmlContent,
      displayName: user.name,
    });
  }

  /**
   * Sends password reset email
   * @param {Object} user - User object containing email and name
   * @param {string} resetToken - Password reset token
   */
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

    return this.sendEmail({
      to: user.email,
      subject: 'Legal Scriber - Password Reset Request',
      htmlContent,
      displayName: user.name,
    });
  }
}

// Create a singleton instance
const emailService = new AzureEmailService();
export default emailService;
