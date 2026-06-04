import { prisma } from "@chowvest/database";

interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
        metadata: params.metadata,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

/**
 * Send transaction notification
 */
export async function sendTransactionNotification(
  userId: string,
  transactionType: string,
  amount: number,
  status: string
) {
  const titles: Record<string, string> = {
    DEPOSIT: "Deposit Successful",
    TRANSFER_TO_BASKET: "Transfer Completed",
    TRANSFER_FROM_BASKET: "Funds Received",
    MARKET_PURCHASE: "Purchase Completed",
    REFUND: "Refund Processed",
  };

  const messages: Record<string, string> = {
    DEPOSIT: `Your wallet has been credited with ₦${amount.toLocaleString()}`,
    TRANSFER_TO_BASKET: `₦${amount.toLocaleString()} transferred to your savings goal`,
    TRANSFER_FROM_BASKET: `₦${amount.toLocaleString()} transferred to your wallet`,
    MARKET_PURCHASE: `Purchase of ₦${amount.toLocaleString()} completed successfully`,
    REFUND: `₦${amount.toLocaleString()} refunded to your wallet`,
  };

  await createNotification({
    userId,
    type: "transaction",
    title: titles[transactionType] || "Transaction Update",
    message:
      messages[transactionType] ||
      `Transaction of ₦${amount.toLocaleString()} ${status}`,
    link: "/wallet",
    metadata: { transactionType, amount, status },
  });
}

/**
 * Send milestone notification
 */
export async function sendMilestoneNotification(
  userId: string,
  basketName: string,
  progress: number,
  milestone: number
) {
  await createNotification({
    userId,
    type: "basket_milestone",
    title: "Goal Milestone Reached! 🎉",
    message: `Your "${basketName}" goal is now ${milestone}% complete!`,
    link: "/basket-goals",
    metadata: { basketName, progress, milestone },
  });
}

/**
 * Send goal completion notification
 */
export async function sendGoalCompletionNotification(
  userId: string,
  basketName: string,
  amount: number
) {
  await createNotification({
    userId,
    type: "basket_milestone",
    title: "Goal Completed! 🎊",
    message: `Congratulations! You've reached your "${basketName}" goal of ₦${amount.toLocaleString()}!`,
    link: "/basket-goals",
    metadata: { basketName, amount, completed: true },
  });
}

/**
 * Send security alert
 */
export async function sendSecurityAlert(
  userId: string,
  alertType: string,
  description: string
) {
  await createNotification({
    userId,
    type: "security_alert",
    title: "Security Alert",
    message: description,
    link: "/profile",
    metadata: { alertType },
  });
}

/**
 * Send auto-save notification
 */
export async function sendAutoSaveNotification(
  userId: string,
  basketName: string,
  amount: number
) {
  await createNotification({
    userId,
    type: "auto_save",
    title: "Auto-Save Completed",
    message: `₦${amount.toLocaleString()} automatically saved to "${basketName}"`,
    link: "/basket-goals",
    metadata: { basketName, amount },
  });
}

/**
 * Send goal deadline reminder notification (30/15/7/4/1 days out)
 */
export async function sendGoalReminderNotification(
  userId: string,
  basketName: string,
  daysLeft: number
) {
  const urgency = daysLeft <= 4 ? "urgent" : "reminder";
  const title = daysLeft === 1
    ? `Final Warning — "${basketName}" expires tomorrow`
    : `${daysLeft} days left on "${basketName}"`;
  const message = daysLeft === 1
    ? `Your "${basketName}" savings goal expires tomorrow. Top up now to avoid missing your target.`
    : `You have ${daysLeft} days left to reach your "${basketName}" savings goal. Keep saving!`;

  await createNotification({
    userId,
    type: "goal_reminder",
    title,
    message,
    link: "/basket-goals",
    metadata: { basketName, daysLeft, urgency },
  });
}

/**
 * Send goal paused notification — fires when target date passes without completion
 */
export async function sendGoalPausedNotification(
  userId: string,
  basketName: string
) {
  await createNotification({
    userId,
    type: "goal_paused",
    title: `Your "${basketName}" goal has been paused`,
    message: `Your target date has passed. Visit your goals to decide whether to continue saving or get a full refund.`,
    link: "/basket-goals",
    metadata: { basketName },
  });
}

/**
 * Send price change notification — fires when admin updates commodity price while goal is ACTIVE
 */
export async function sendGoalPriceChangeNotification(
  userId: string,
  basketName: string,
  lockedPrice: number,
  newPrice: number
) {
  const direction = newPrice > lockedPrice ? "increased" : "decreased";
  const message = newPrice > lockedPrice
    ? `The market price for "${basketName}" has ${direction} to ₦${newPrice.toLocaleString()}. Your locked price of ₦${lockedPrice.toLocaleString()} still applies — keep saving.`
    : `The market price for "${basketName}" has ${direction} to ₦${newPrice.toLocaleString()}. You still save toward your locked price of ₦${lockedPrice.toLocaleString()}. Any excess will be refunded on completion.`;

  await createNotification({
    userId,
    type: "goal_price_change",
    title: `Market price changed for "${basketName}"`,
    message,
    link: "/basket-goals",
    metadata: { basketName, lockedPrice, newPrice, direction },
  });
}
