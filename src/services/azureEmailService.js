// src/services/azureEmailService.js
import { EmailClient } from '@azure/communication-email';
import logger from '../utils/logger.js';

class EmailService {
  constructor() {
    if (!process.env.AZURE_COMMUNICATION_CONNECTION_STRING) {
      throw new Error('Azure Communication Connection String is required');
    }
    this.emailClient = new EmailClient(process.env.AZURE_COMMUNICATION_CONNECTION_STRING);
    this.frontendUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : process.env.FRONTEND_URL;

    logger.info(`Email Service initialized with frontend URL: ${this.frontendUrl}`);
  }

  async sendEmail(to, subject, htmlContent) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('\n📧 Development Email Details:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('Content:', htmlContent);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return { id: `dev-${Date.now()}`, status: 'sent' };
      }

      const message = {
        senderAddress: process.env.AZURE_SENDER_EMAIL,
        content: { subject, html: htmlContent },
        recipients: { to: [{ address: to }] },
      };

      const poller = await this.emailClient.beginSend(message);
      return await poller.pollUntilDone();
    } catch (error) {
      logger.error('Email send error:', error);
      throw error;
    }
  }

  async sendSignupConfirmation(user, confirmationToken) {
    const confirmationUrl = `${this.frontendUrl}/confirm-email/${confirmationToken}`;

    if (process.env.NODE_ENV === 'development') {
      console.log('\n🔗 Email Verification Details:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('User:', user.name);
      console.log('Email:', user.email);
      console.log('Verification URL:', confirmationUrl);
      console.log('Token:', confirmationToken);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to Legal Scriber!</h2>
        <p>Hello ${user.name},</p>
        <p>Please confirm your email by clicking below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmationUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Confirm Email
          </a>
        </div>
        <p>Or copy and paste this link:</p>
        <p style="word-break: break-all; color: #4F46E5;">${confirmationUrl}</p>
        <p>This confirmation link will expire in 24 hours.</p>
        <p>Best regards,<br>The Legal Scriber Team</p>
      </div>
    `;

    return this.sendEmail(user.email, 'Confirm Your Legal Scriber Account', htmlContent);
  }
}

export default new EmailService();
