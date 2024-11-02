// src/utils/emailTemplates.js

export const usageWarningEmail = (userName, usagePercent, planName) => ({
  subject: 'Usage Warning - Approaching Plan Limit',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Usage Warning</h2>
      <p>Hi ${userName},</p>
      <p>You have used ${usagePercent}% of your monthly transcription hours on your ${planName} plan.</p>
      <p>To ensure uninterrupted service, consider:</p>
      <ul>
        <li>Upgrading to a higher plan</li>
        <li>Reviewing your usage patterns</li>
        <li>Archiving old transcriptions</li>
      </ul>
      <a href="${process.env.FRONTEND_URL}/subscription/upgrade" 
         style="display: inline-block; background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Upgrade Plan
      </a>
    </div>
  `
});

export const limitReachedEmail = (userName, planName) => ({
  subject: 'Usage Limit Reached',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #DC2626;">Usage Limit Reached</h2>
      <p>Hi ${userName},</p>
      <p>You have reached your monthly transcription limit on your ${planName} plan.</p>
      <p>To continue using our services:</p>
      <ul>
        <li>Upgrade to a higher plan for more hours</li>
        <li>Wait for your usage to reset next billing cycle</li>
      </ul>
      <a href="${process.env.FRONTEND_URL}/subscription/upgrade" 
         style="display: inline-block; background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Upgrade Now
      </a>
    </div>
  `
});
