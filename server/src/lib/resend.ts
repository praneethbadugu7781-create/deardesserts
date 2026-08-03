import { Resend } from 'resend';

// Initialize Resend with API key from environment variable
const resendApiKey = process.env.RESEND_API_KEY || '';
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || 'Dear Desserts <orders@deardesserts.in>';

/**
 * Send order receipt email to customer or store manager
 */
export async function sendOrderReceiptEmail(order: {
  billNumber: string;
  tokenNumber: string;
  customerName?: string;
  customerEmail?: string;
  netAmount: number;
  items: { name: string; quantity: number; totalPrice: number }[];
}) {
  if (!resend) {
    console.warn('[Resend] RESEND_API_KEY not set. Skipping email.');
    return null;
  }

  const recipientEmail = order.customerEmail || 'deardesserts.in@gmail.com';

  const itemsListHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #EEE;">${item.quantity}x ${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #EEE; text-align: right;">₹${item.totalPrice}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E5C158; border-radius: 16px; padding: 24px; background-color: #FBF7F0;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #1E100A; margin: 0; font-size: 28px;">DEAR DESSERTS</h1>
        <p style="color: #C9A227; margin: 4px 0; font-weight: bold; letter-spacing: 2px;">LOVE AT FIRST BITE</p>
        <p style="color: #666; font-size: 12px;">Swathi Theatre Road, Opp. Sri Balaji Sweets, Bhavanipuram, Vijayawada - 520012</p>
      </div>

      <div style="background-color: #1E100A; color: #E5C158; text-align: center; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 14px; text-transform: uppercase;">YOUR ORDER TOKEN</p>
        <h2 style="margin: 4px 0; font-size: 36px; font-weight: 900;">TOKEN: ${order.tokenNumber}</h2>
        <p style="margin: 0; font-size: 12px; color: #FFF;">Bill No: ${order.billNumber}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #E8DCB8; color: #1E100A;">
            <th style="padding: 8px; text-align: left;">Item</th>
            <th style="padding: 8px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsListHtml}
        </tbody>
      </table>

      <div style="text-align: right; border-top: 2px solid #1E100A; padding-top: 12px; font-size: 18px; font-weight: bold; color: #1E100A;">
        Total Amount Paid: <span style="color: #C9A227;">₹${order.netAmount}</span>
      </div>

      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #888;">
        <p>Thank you for dining with Dear Desserts! 🍰</p>
      </div>
    </div>
  `;

  return resend.emails.send({
    from: DEFAULT_FROM,
    to: [recipientEmail],
    subject: `Order Receipt #${order.billNumber} - Token ${order.tokenNumber} | Dear Desserts`,
    html,
  });
}

/**
 * Send Password Reset OTP Email via Resend
 */
export async function sendPasswordResetOtpEmail(params: { email: string; otpCode: string }) {
  if (!resend) {
    console.warn('[Resend] RESEND_API_KEY not set. Skipping OTP email.');
    return null;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #E5C158; border-radius: 16px; padding: 24px; background-color: #FBF7F0;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #1E100A; margin: 0; font-size: 26px;">DEAR DESSERTS</h1>
        <p style="color: #C9A227; margin: 4px 0; font-weight: bold;">SECURITY AUTHENTICATION</p>
      </div>

      <div style="background-color: #FFFFFF; border: 1px solid #E2D7C5; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
        <p style="color: #4A3A2F; margin-top: 0;">Use the 6-digit verification code below to reset your login password:</p>
        <div style="font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #C9A227; background-color: #1E100A; padding: 12px; border-radius: 8px; display: inline-block;">
          ${params.otpCode}
        </div>
        <p style="color: #888; font-size: 12px; margin-bottom: 0; margin-top: 12px;">This verification code expires in 10 minutes.</p>
      </div>

      <p style="color: #666; font-size: 12px; text-align: center;">If you did not request a password reset, please ignore this message.</p>
    </div>
  `;

  return resend.emails.send({
    from: DEFAULT_FROM,
    to: [params.email],
    subject: `🔑 Password Reset Verification Code [${params.otpCode}] | Dear Desserts`,
    html,
  });
}

/**
 * Send Staff Credentials Update Notification Email via Resend
 */
export async function sendStaffCredentialsUpdatedEmail(params: {
  name: string;
  email: string;
  role: string;
  password?: string;
}) {
  if (!resend) return null;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #E5C158; border-radius: 16px; padding: 24px; background-color: #FBF7F0;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #1E100A; margin: 0; font-size: 26px;">DEAR DESSERTS</h1>
        <p style="color: #C9A227; margin: 4px 0; font-weight: bold;">STAFF CREDENTIALS UPDATED</p>
      </div>

      <div style="background-color: #FFFFFF; border: 1px solid #E2D7C5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #1E100A; margin-top: 0;">Hello ${params.name},</h3>
        <p style="color: #4A3A2F;">Your staff portal credentials have been updated by Store Management.</p>
        
        <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-top: 12px;">
          <tr>
            <td style="padding: 6px 0; color: #666;">Login Email:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #1E100A;">${params.email}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">Assigned Role:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #C9A227;">${params.role}</td>
          </tr>
          ${
            params.password
              ? `
          <tr>
            <td style="padding: 6px 0; color: #666;">New Password:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #1E100A;">${params.password}</td>
          </tr>
          `
              : ''
          }
        </table>
      </div>

      <p style="color: #666; font-size: 12px; text-align: center;">Dear Desserts Smart Outlet Portal</p>
    </div>
  `;

  return resend.emails.send({
    from: DEFAULT_FROM,
    to: [params.email, 'deardesserts.in@gmail.com'],
    subject: `🔐 Staff Login Credentials Updated for ${params.name} | Dear Desserts`,
    html,
  });
}
