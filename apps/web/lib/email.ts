import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, otp: string) => {
  try {
    const data = await resend.emails.send({
      from: 'Chowvest <noreply@verify.chowvest.com>', // Replace with your verified domain
      to: email,
      subject: 'Verify your Chowvest Account',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Chowvest!</h2>
          <p>Please use the following 6-character code to verify your email address. This code will expire in 30 minutes.</p>
          <div style="background-color: #f4f4f5; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <h1 style="letter-spacing: 4px; color: #18181b; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #71717a; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
        </div>
      `,
    });

   // console.log('✅ Email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error };
  }
};

export const sendPasswordResetEmail = async (email: string, name: string, otp: string) => {
  try {
    const data = await resend.emails.send({
      from: 'Chowvest <noreply@verify.chowvest.com>',
      to: email,
      subject: 'Reset your Chowvest Password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hi ${name},</h2>
          <p>We received a request to reset your password. Use the code below to proceed. This code will expire in 30 minutes.</p>
          <div style="background-color: #f4f4f5; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <h1 style="letter-spacing: 4px; color: #18181b; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #71717a; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return { success: false, error };
  }
};
