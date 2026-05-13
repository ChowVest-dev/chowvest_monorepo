import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface DeliveryEmailParams {
  email: string;
  name: string;
  orderId: string;
  status: string;
  address: string;
  deliveryOption: string;
  itemName: string;
  totalAmount: number;
  deliveryFee: number;
  riderName?: string;
  riderPhone?: string;
  estimatedTime?: string;
}

const statusMessages: Record<string, { subject: string; heading: string; body: string; color: string }> = {
  CONFIRMED: {
    subject: "Order Confirmed! 🎉",
    heading: "Your delivery has been confirmed",
    body: "We're getting your order ready. You'll be notified when it's on the way.",
    color: "#1B7A3D",
  },
  PREPARING: {
    subject: "Your order is being prepared 📦",
    heading: "We're packing your items",
    body: "Your items are being carefully packed and will be dispatched shortly.",
    color: "#D4890A",
  },
  IN_TRANSIT: {
    subject: "Your order is on the way! 🛵",
    heading: "Your rider is on the way",
    body: "Your delivery is en route. Track it live in the app.",
    color: "#1B7A3D",
  },
  DELIVERED: {
    subject: "Order delivered! ✅",
    heading: "Your order has been delivered",
    body: "We hope you enjoy your items! Don't forget to rate your delivery experience.",
    color: "#1B7A3D",
  },
  CANCELLED: {
    subject: "Delivery cancelled",
    heading: "Your delivery has been cancelled",
    body: "Your delivery was cancelled. Any funds will be returned to your wallet.",
    color: "#E53935",
  },
};

export async function sendDeliveryStatusEmail(params: DeliveryEmailParams) {
  const statusInfo = statusMessages[params.status];
  if (!statusInfo) return;

  try {
    const riderSection =
      params.riderName && params.status === "IN_TRANSIT"
        ? `
          <div style="background: #f0faf0; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0 0 4px; font-weight: 600; color: #1A1D1F;">Your Rider</p>
            <p style="margin: 0; color: #6F767E; font-size: 14px;">${params.riderName}${params.riderPhone ? ` · ${params.riderPhone}` : ""}</p>
          </div>
        `
        : "";

    const data = await resend.emails.send({
      from: "Chowvest <noreply@verify.chowvest.com>",
      to: params.email,
      subject: `${statusInfo.subject} — Order #${params.orderId.slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
          <!-- Header -->
          <div style="background: #0D1F12; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 20px;">🍚 Chowvest Delivery</h1>
            <p style="color: rgba(255,255,255,0.6); margin: 4px 0 0; font-size: 13px;">Order #${params.orderId.slice(-6).toUpperCase()}</p>
          </div>

          <!-- Status Banner -->
          <div style="background: ${statusInfo.color}; padding: 20px; text-align: center;">
            <h2 style="color: #fff; margin: 0 0 6px; font-size: 18px;">${statusInfo.heading}</h2>
            <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">${statusInfo.body}</p>
          </div>

          <!-- Content -->
          <div style="padding: 24px;">
            <p style="color: #1A1D1F; margin: 0 0 16px;">Hi ${params.name},</p>

            <!-- Order Summary -->
            <div style="border: 1px solid #EFEFEF; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <p style="margin: 0 0 8px; font-weight: 600; color: #1A1D1F;">📦 ${params.itemName}</p>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: #6F767E; font-size: 13px;">Delivery (${params.deliveryOption})</span>
                <span style="color: #1A1D1F; font-size: 13px;">₦${params.deliveryFee.toLocaleString()}</span>
              </div>
              <div style="border-top: 1px dashed #EFEFEF; margin-top: 8px; padding-top: 8px; display: flex; justify-content: space-between;">
                <span style="font-weight: 700; color: #1A1D1F;">Total</span>
                <span style="font-weight: 700; color: #1B7A3D;">₦${params.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <!-- Delivery Address -->
            <div style="background: #F6F7F9; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;">
              <p style="margin: 0 0 4px; font-weight: 600; color: #1A1D1F; font-size: 13px;">📍 Deliver to</p>
              <p style="margin: 0; color: #6F767E; font-size: 13px;">${params.address}</p>
            </div>

            ${riderSection}

            ${params.estimatedTime ? `
              <div style="background: #0D1F12; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 16px;">
                <p style="color: rgba(255,255,255,0.6); margin: 0 0 4px; font-size: 12px;">Estimated Arrival</p>
                <p style="color: #fff; margin: 0; font-size: 20px; font-weight: 700;">${params.estimatedTime}</p>
              </div>
            ` : ""}

            <!-- CTA -->
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://chowvest.com"}/delivery" 
               style="display: block; background: #1B7A3D; color: #fff; text-align: center; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Track Your Delivery →
            </a>

            <div style="text-align: center; margin-top: 16px; padding: 12px; background: #E9F5EE; border-radius: 8px;">
              <p style="margin: 0; color: #1B7A3D; font-size: 12px; font-weight: 600;">💰 Paid from Chowvest Savings</p>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 16px 24px; border-top: 1px solid #EFEFEF; text-align: center;">
            <p style="color: #9A9FA5; font-size: 12px; margin: 0;">Chowvest — Small Savings, Big Meals</p>
          </div>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error("❌ Error sending delivery email:", error);
    return { success: false, error };
  }
}
