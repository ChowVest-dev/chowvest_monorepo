import { createNotification } from "@/lib/notifications/create";

/**
 * Send delivery status notification
 */
export async function sendDeliveryStatusNotification(
  userId: string,
  deliveryId: string,
  status: string,
  itemName: string,
  riderName?: string
) {
  const notifications: Record<string, { title: string; message: string }> = {
    CONFIRMED: {
      title: "Delivery Confirmed! 🎉",
      message: `Your "${itemName}" delivery has been confirmed and is being processed.`,
    },
    PREPARING: {
      title: "Order Being Prepared 📦",
      message: `Your "${itemName}" is being packed and will be dispatched soon.`,
    },
    IN_TRANSIT: {
      title: "Rider On The Way! 🛵",
      message: `${riderName || "Your rider"} is on the way with your "${itemName}". Track live in the app.`,
    },
    DELIVERED: {
      title: "Delivered Successfully! ✅",
      message: `Your "${itemName}" has been delivered. Rate your experience!`,
    },
    CANCELLED: {
      title: "Delivery Cancelled",
      message: `Your "${itemName}" delivery has been cancelled. Funds returned to wallet.`,
    },
  };

  const notif = notifications[status];
  if (!notif) return;

  await createNotification({
    userId,
    type: "delivery",
    title: notif.title,
    message: notif.message,
    link: `/delivery?id=${deliveryId}`,
    metadata: { deliveryId, status, itemName },
  });
}

/**
 * Send delivery request notification
 */
export async function sendDeliveryRequestNotification(
  userId: string,
  itemName: string,
  address: string
) {
  await createNotification({
    userId,
    type: "delivery",
    title: "Delivery Requested 📋",
    message: `Your "${itemName}" delivery to ${address} has been submitted. We'll confirm shortly.`,
    link: "/delivery",
    metadata: { itemName, address },
  });
}
