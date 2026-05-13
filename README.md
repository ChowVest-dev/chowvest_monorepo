# 🥗 Chowvest - Save Small, Eat Well

Chowvest is a modern food security and savings platform designed to help users hedge against food inflation. By saving small amounts daily or weekly, users can lock in food prices and secure their future meals through progress-based "Chow Targets".

![Chowvest Dashboard Placeholder](https://img.shields.io/badge/Chowvest-Food%20Savings-green)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![Prisma](https://img.shields.io/badge/Prisma-ORM-blue)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS%204.0-38B2AC)

## 🚀 Core Features

### 1. Digital Wallet System

- **Instant Deposits**: Integrated with **Paystack** for secure card and bank transfer deposits.
- **Real-time Balance**: Instant updates across the dashboard and wallet pages.
- **Transaction Audit**: Detailed history of all deposits, transfers, and purchases with success/pending/failed status.

### 2. My Chow Targets (Food Baskets)

- **Goal-Oriented Savings**: Create personalized targets for specific food items (e.g., "50kg Bag of Rice").
- **Progress Tracking**: Visual progress bars showing how close you are to your goal.
- **Flexible Top-ups**: Transfer funds from your wallet to specific targets at any time.
- **Delivery Requests**: Once a goal reaches 100%, users can request instant delivery of their food items.

### 3. Smart Market

- Browse and purchase food commodities at competitive market prices.
- Integration between marketplace purchases and wallet balances.

### 4. Custom Authentication

- **JWT-Based**: Secure session management using JSON Web Tokens.
- **Secure Cookies**: HttpOnly, Secure, and SameSite cookie policies.
- **Profile Management**: Personalized user experience with customizable profiles and security settings.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15+ (App Router), React 19, Tailwind CSS 4.0
- **Backend**: Next.js API Routes (Edge-compatible where possible)
- **Database**: PostgreSQL with **Prisma ORM**
- **Payments**: Paystack API
- **State Management**: Zustand
- **UI Components**: Radix UI, Lucide React, Sonner (Toasts)
- **Type Safety**: TypeScript

## 📁 Project Structure

```text
├── app/                  # Next.js App Router (Pages & API)
│   ├── api/              # Backend API endpoints (Auth, Wallet, Baskets)
│   ├── wallet/           # Wallet management views
│   ├── basket-goals/     # Food savings management
│   ├── market/           # Food marketplace
│   └── dashboard/        # Main user overview
├── components/           # Reusable UI components
│   ├── wallet/           # Wallet-specific components (Deposit, Transfer)
│   ├── goals/            # Goal-specific components (Header, List, Card)
│   └── ui/               # Base shadcn/ui components
├── lib/                  # Shared utilities (DB, Auth, Payments, Audit)
├── prisma/               # Database schema and migrations
├── scripts/              # Maintenance and diagnostic scripts
└── public/               # Static assets
```

## ⚙️ Getting Started

### 1. Clone & Install

```bash
git clone <repository-url>
cd chowvest-prod
pnpm install
```

### 2. Environment Setup

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Auth
JWT_SECRET="your-secret"

# Payments - Use Test keys for development, Live keys for production
PAYSTACK_SECRET_KEY="sk_test_..."
# Note: NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is optional if payments are fully server-side initialized
```

### 3. Paystack Webhook Configuration
To ensure deposits are automatically verified:
1. Go to your **Paystack Dashboard** -> **Settings** -> **API Keys & Webhooks**.
2. Set your **Webhook URL**:
   - For **Test Mode** (local dev): Use a service like ngrok to expose your local server, then set the url to `https://<your-ngrok-url>/api/wallet/webhook`.
   - For **Live Mode** (production): Set to `https://<your-production-domain>/api/wallet/webhook`.
3. If you want to switch from Test to Live mode, simply update the `PAYSTACK_SECRET_KEY` in your `.env` file to your `sk_live_...` key and ensure your Live Webhook URL is set. No code changes are required!

### 4. Database Initialization

```bash
npx prisma generate
npx prisma db push
```

### 5. Start Development

```bash
pnpm dev
```

## 🔐 Security & Audit

All financial actions (deposits, transfers, goal creation) are logged in the `AuditLog` table for compliance and security monitoring. The system includes rate-limiting and session-refresh logic to protect user accounts.

## 🤝 Contributing

For updates or feature requests, please refer to the internal documentation or contact the development lead.

---

Built with ❤️ by the Chowvest Team.
