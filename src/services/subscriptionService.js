// PayFast API configuration
const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID;
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY;
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE;
const PAYFAST_API_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://www.payfast.co.za/eng/process'
    : 'https://sandbox.payfast.co.za/eng/process';

// Import necessary dependencies
import crypto from 'crypto';
import apiClient from '../apiClient.js';

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    id: 'basic',
    name: 'Basic Plan',
    price: 499.0,
    frequency: 'monthly',
    features: [
      'Up to 10 hours of audio transcription',
      'Basic legal document summarisation',
      'Email support',
      '30-day data retention',
    ],
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional Plan',
    price: 999.0,
    frequency: 'monthly',
    features: [
      'Up to 30 hours of audio transcription',
      'Advanced legal document summarisation',
      'Priority email and chat support',
      '90-day data retention',
      'Custom vocabulary support',
    ],
  },
};

// Generate PayFast signature for secure transactions
const generateSignature = (data, passPhrase = null) => {
  // Create parameter string
  let pfOutput = '';
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      if (data[key] !== '') {
        pfOutput += `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, '+')}&`;
      }
    }
  }

  // Remove last &
  pfOutput = pfOutput.slice(0, -1);
  if (passPhrase !== null) {
    pfOutput += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, '+')}`;
  }

  return crypto.createHash('md5').update(pfOutput).digest('hex');
};

// Create PayFast payment data
const createPaymentData = (plan, user, returnUrl, cancelUrl) => {
  const data = {
    merchant_id: PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    return_url: returnUrl,
    cancel_url: cancelUrl,
    notify_url: `${envConfig.apiUrl}/api/subscription/notify`,
    name_first: user.name.split(' ')[0],
    name_last: user.name.split(' ').slice(1).join(' '),
    email_address: user.email,
    m_payment_id: `${user.id}_${plan.id}_${Date.now()}`,
    amount: plan.price.toFixed(2),
    item_name: `${plan.name} Subscription`,
    subscription_type: 1,
    billing_date: new Date().toISOString().split('T')[0],
    recurring_amount: plan.price.toFixed(2),
    frequency: 3, // Monthly
    cycles: 0, // Indefinite
  };

  data.signature = generateSignature(data, PAYFAST_PASSPHRASE);
  return data;
};

// Initiate subscription
export const initiateSubscription = async (planId, returnUrl, cancelUrl) => {
  try {
    const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()];
    if (!plan) throw new Error('Invalid plan selected');

    // Get user profile
    const userResponse = await apiClient.get('/api/user/profile');
    const user = userResponse.data;

    // Create payment data
    const paymentData = createPaymentData(plan, user, returnUrl, cancelUrl);

    // Create subscription record in our database
    await apiClient.post('/api/subscription/create', {
      planId,
      paymentData: { m_payment_id: paymentData.m_payment_id },
    });

    return {
      paymentUrl: PAYFAST_API_URL,
      paymentData,
    };
  } catch (error) {
    console.error('Error initiating subscription:', error);
    throw error;
  }
};

// Verify PayFast notification
export const verifyNotification = async (pfData, pfParamString) => {
  try {
    // Verify signature
    const signature = generateSignature(pfData, PAYFAST_PASSPHRASE);
    if (signature !== pfData.signature) {
      throw new Error('Invalid signature');
    }

    // Verify source IP
    const validHosts = ['www.payfast.co.za', 'sandbox.payfast.co.za'];
    const urlParts = new URL(pfData.notify_url);
    if (!validHosts.includes(urlParts.hostname)) {
      throw new Error('Invalid source IP');
    }

    // Verify data hasn't been tampered with
    const response = await fetch(`${PAYFAST_API_URL}/validate?${pfParamString}`, { method: 'GET' });
    const result = await response.text();
    if (result !== 'VALID') {
      throw new Error('Data validation failed');
    }

    return true;
  } catch (error) {
    console.error('PayFast verification error:', error);
    return false;
  }
};
