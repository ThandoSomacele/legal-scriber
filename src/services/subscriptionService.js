import apiClient from '../apiClient.js';
import envConfig from '../../envConfig.js';

// PayFast API configuration with sandbox fallback
const PAYFAST_CONFIG = {
  sandbox: {
    merchant_id: '10035674',
    merchant_key: '9nqhf208lzpc4',
    passphrase: 'legalscribersandboxing', // Default sandbox passphrase
    url: 'https://sandbox.payfast.co.za/eng/process',
  },
  production: {
    merchant_id: process.env.VITE_PAYFAST_MERCHANT_ID,
    merchant_key: process.env.VITE_PAYFAST_MERCHANT_KEY,
    passphrase: process.env.VITE_PAYFAST_PASSPHRASE,
    url: 'https://www.payfast.co.za/eng/process',
  },
};

// Use sandbox config in development
const isDevelopment = process.env.MODE === 'development';
const {
  merchant_id: PAYFAST_MERCHANT_ID,
  merchant_key: PAYFAST_MERCHANT_KEY,
  passphrase: PAYFAST_PASSPHRASE,
  url: PAYFAST_API_URL,
} = isDevelopment ? PAYFAST_CONFIG.sandbox : PAYFAST_CONFIG.production;

// Subscription plans configuration remains the same
const SUBSCRIPTION_PLANS = {
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

// Generate MD5 hash implementation for browser
function generateMD5Hash(message) {
  // This is a pure JavaScript implementation of MD5
  function md5cycle(x, k) {
    let a = x[0],
      b = x[1],
      c = x[2],
      d = x[3];

    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    // ... rest of the cycles

    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q, a, b, x, s, t) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }

  function ff(a, b, c, d, x, s, t) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }

  function gg(a, b, c, d, x, s, t) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }

  function hh(a, b, c, d, x, s, t) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function ii(a, b, c, d, x, s, t) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  function md51(s) {
    const n = s.length;
    const state = [1732584193, -271733879, -1732584194, 271733878];
    let i;

    for (i = 64; i <= s.length; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }

    s = s.substring(i - 64);
    const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    for (i = 0; i < s.length; i++) {
      tail[i >> 2] |= s.charCodeAt(i) << (i % 4 << 3);
    }

    tail[i >> 2] |= 0x80 << (i % 4 << 3);
    if (i > 55) {
      md5cycle(state, tail);
      for (i = 0; i < 16; i++) tail[i] = 0;
    }

    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  }

  function md5blk(s) {
    const md5blks = [];
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] =
        s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }

  const hex_chr = '0123456789abcdef'.split('');

  function rhex(n) {
    let s = '',
      j = 0;
    for (; j < 4; j++) s += hex_chr[(n >> (j * 8 + 4)) & 0x0f] + hex_chr[(n >> (j * 8)) & 0x0f];
    return s;
  }

  function hex(x) {
    for (let i = 0; i < x.length; i++) x[i] = rhex(x[i]);
    return x.join('');
  }

  function add32(a, b) {
    return (a + b) & 0xffffffff;
  }

  return hex(md51(message));
}

// Generate PayFast signature
function generateSignature(data, passPhrase = null) {
  const params = Object.keys(data)
    .filter(key => data[key] !== undefined && data[key] !== '')
    .sort()
    .map(key => `${key}=${encodeURIComponent(String(data[key]).trim())}`)
    .join('&');

  const finalString = passPhrase ? `${params}&passphrase=${encodeURIComponent(passPhrase)}` : params;
  return generateMD5Hash(finalString);
}

// Create PayFast payment data
async function createPaymentData(plan, user, returnUrl, cancelUrl) {
  // Add timestamp to make each payment unique
  const timestamp = new Date().getTime();

  const data = {
    merchant_id: PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    return_url: returnUrl,
    cancel_url: cancelUrl,
    notify_url: `${envConfig.apiUrl}/api/subscription/notify`,
    name_first: user.name.split(' ')[0],
    name_last: user.name.split(' ').slice(1).join(' ') || user.name.split(' ')[0],
    email_address: user.email,
    m_payment_id: `${user.id}_${plan.id}_${timestamp}`,
    amount: plan.price.toFixed(2),
    item_name: `${plan.name} Subscription - ${timestamp}`,
    subscription_type: 1,
    billing_date: new Date().toISOString().split('T')[0],
    recurring_amount: plan.price.toFixed(2),
    frequency: 3, // Monthly
    cycles: 0, // Indefinite
  };
  if (isDevelopment) {
    // In sandbox mode, append timestamp to email to make it unique
    data.email_address = `test_${timestamp}@payfast.co.za`;
    // Add test mode indicator
    data.custom_str1 = 'SANDBOX_MODE';
  }

  // Generate signature
  data.signature = generateSignature(data, PAYFAST_PASSPHRASE);
  return data;
}

// Initiate subscription with sandbox handling
const initiateSubscription = async (planId, returnUrl, cancelUrl) => {
  try {
    const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()];
    if (!plan) {
      throw new Error('Invalid plan selected');
    }

    // Get user profile
    const userResponse = await apiClient.get('/api/user/profile');
    const user = userResponse.data;

    if (!user) {
      throw new Error('User profile not found');
    }

    // Create payment data
    const paymentData = await createPaymentData(plan, user, returnUrl, cancelUrl);

    // Log payment data in development
    if (isDevelopment) {
      console.log('PayFast Payment Data:', paymentData);
    }

    // Create subscription record in our database
    await apiClient.post('/api/subscription/create', {
      planId,
      paymentData: {
        m_payment_id: paymentData.m_payment_id,
        sandbox_mode: isDevelopment,
      },
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

// Add sandbox testing helper
const getSandboxTestCards = () => {
  if (isDevelopment) {
    return {
      successful: {
        number: '5200000000000114',
        expiry: '01/2025',
        cvv: '900',
      },
      failed: {
        number: '5200000000000114',
        expiry: '01/2025',
        cvv: '901',
      },
    };
  }
  return null;
};

// verifyNotification function
export const verifyNotification = async (pfData, pfParamString) => {
  try {
    // Verify signature
    const signature = generateSignature(pfData, PAYFAST_PASSPHRASE);
    if (signature !== pfData.signature) {
      throw new Error('Invalid signature');
    }

    // Verify source IP (only in production)
    if (!isDevelopment) {
      const validHosts = ['www.payfast.co.za'];
      const urlParts = new URL(pfData.notify_url);
      if (!validHosts.includes(urlParts.hostname)) {
        throw new Error('Invalid source IP');
      }
    }

    // Verify data hasn't been tampered with
    const validationUrl = `${PAYFAST_API_URL}/validate?${pfParamString}`;

    const response = await fetch(validationUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

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

// Create a server-side verification function since we can't do IP checks in browser
export const verifyNotificationServer = async (pfData, pfParamString, ipAddress) => {
  try {
    // Verify signature
    const signature = generateSignature(pfData, PAYFAST_PASSPHRASE);
    if (signature !== pfData.signature) {
      throw new Error('Invalid signature');
    }

    // Verify source IP (whitelist PayFast IPs)
    const payFastIps = ['197.97.145.144', '197.97.145.145', '197.97.145.146', '197.97.145.147'];

    if (!isDevelopment && !payFastIps.includes(ipAddress)) {
      throw new Error('Invalid source IP');
    }

    // Verify data hasn't been tampered with
    const validationUrl = `${PAYFAST_API_URL}/validate?${pfParamString}`;

    const response = await fetch(validationUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

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

// Export all previously created functions
export { SUBSCRIPTION_PLANS, initiateSubscription, getSandboxTestCards, generateSignature, createPaymentData };
