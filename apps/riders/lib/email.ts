import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendLogisticsWelcomeEmail = async (email: string, companyName: string) => {
  const portalUrl = process.env.NEXT_PUBLIC_RIDERS_URL || 'https://riders.chowvest.com';
  try {
    await resend.emails.send({
      from: 'Chowvest <hello@chowvest.com>',
      to: email,
      subject: 'Welcome to Chowvest Logistics!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #18181b;">
          <h2 style="color: #166534;">Welcome aboard, ${companyName}!</h2>
          <p>We're excited to have you as a logistics partner in the Chowvest ecosystem.</p>
          <p>With your new portal, you can now:</p>
          <ul>
            <li>Add and manage your fleet of riders</li>
            <li>Track deliveries in real-time</li>
            <li>Manage logistics assignments efficiently</li>
          </ul>
          <div style="background-color: #f4f4f5; padding: 24px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Your login email:</strong> ${email}</p>
            <p style="margin: 0;"><strong>Portal:</strong> <a href="${portalUrl}/logistics/login" style="color: #166534;">${portalUrl}/logistics/login</a></p>
          </div>
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e4e4e7;">
            <p style="font-size: 14px; color: #71717a;">The Chowvest Logistics Team</p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error };
  }
};

export const sendAdminLogisticsNotification = async (companyInfo: {
  name: string;
  email: string;
  phoneNumber: string;
}) => {
  try {
    await resend.emails.send({
      from: 'Chowvest System <hello@chowvest.com>',
      to: 'hello@chowvest.com',
      subject: 'New Logistics Partner Registered',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #18181b;">
          <h2 style="color: #166534;">New Logistics Registration</h2>
          <p>A new logistics company has just joined the platform:</p>
          <div style="background-color: #f4f4f5; padding: 24px; border-radius: 8px; margin: 24px 0;">
            <p><strong>Company Name:</strong> ${companyInfo.name}</p>
            <p><strong>Email:</strong> ${companyInfo.email}</p>
            <p><strong>Phone:</strong> ${companyInfo.phoneNumber}</p>
          </div>
          <p style="font-size: 14px; color: #71717a;">This is an automated notification from the Chowvest System.</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
    return { success: false, error };
  }
};
