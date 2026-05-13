/**
 * Chowvest Stress Test — k6
 *
 * Tests the key user flows under concurrent load:
 *   1. Public pages (landing, commodities API)
 *   2. Authenticated flows (login, wallet, baskets)
 *   3. Database-heavy operations (basket creation)
 *
 * Usage:
 *   k6 run scripts/stress-test.js                          # against localhost
 *   k6 run scripts/stress-test.js -e BASE_URL=https://chowvest.com  # against production
 *
 * Profiles:
 *   k6 run scripts/stress-test.js                          # default (ramp to 50 users)
 *   k6 run scripts/stress-test.js -e PROFILE=spike         # spike test (200 users)
 *   k6 run scripts/stress-test.js -e PROFILE=soak          # soak test (30 users, 5 min)
 */

import http from "k6/http";
import { sleep, check, group } from "k6";
import { Rate, Trend } from "k6/metrics";

// ─── Configuration ──────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const TEST_EMAIL = __ENV.TEST_EMAIL || "zehelias207@gmail.com";
const TEST_PASSWORD = __ENV.TEST_PASSWORD || "Test12345";
const PROFILE = __ENV.PROFILE || "default";

// ─── Custom Metrics ─────────────────────────────────────────────────
const loginSuccess = new Rate("login_success");
const apiErrors = new Rate("api_errors");
const walletLatency = new Trend("wallet_latency", true);
const commoditiesLatency = new Trend("commodities_latency", true);

// ─── Load Profiles ──────────────────────────────────────────────────
const profiles = {
  default: {
    stages: [
      { duration: "15s", target: 10 },  // warm up
      { duration: "30s", target: 30 },  // ramp to 30 users
      { duration: "1m", target: 50 },   // hold at 50
      { duration: "15s", target: 0 },   // ramp down
    ],
  },
  spike: {
    stages: [
      { duration: "10s", target: 20 },  // warm up
      { duration: "15s", target: 100 }, // ramp fast
      { duration: "30s", target: 200 }, // spike!
      { duration: "30s", target: 50 },  // recover
      { duration: "15s", target: 0 },   // down
    ],
  },
  soak: {
    stages: [
      { duration: "30s", target: 30 },  // ramp up
      { duration: "5m", target: 30 },   // steady state for 5 min
      { duration: "15s", target: 0 },   // down
    ],
  },
};

export const options = {
  ...profiles[PROFILE] || profiles.default,
  thresholds: {
    http_req_duration: ["p(95)<3000"],     // 95% of requests under 3s
    http_req_failed: ["rate<0.05"],         // less than 5% errors
    login_success: ["rate>0.95"],           // 95%+ logins succeed
    api_errors: ["rate<0.1"],              // less than 10% API errors
  },
};

// ─── Helpers ────────────────────────────────────────────────────────
function getAuthCookies() {
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    { headers: { "Content-Type": "application/json" } }
  );

  const success = loginRes.status === 200;
  loginSuccess.add(success);

  if (!success) {
    console.warn(`Login failed: ${loginRes.status} — ${loginRes.body}`);
    return null;
  }

  // Extract cookies from Set-Cookie headers
  const cookies = loginRes.cookies;
  const jar = http.cookieJar();

  // k6 automatically handles cookies from Set-Cookie headers
  // when using the same base URL, so we just return the jar info
  return true;
}

// ─── Test Scenarios ─────────────────────────────────────────────────
export default function () {
  // ── 1. Public Endpoints (no auth needed) ──
  group("Public Pages", () => {
    // Landing page
    const landing = http.get(`${BASE_URL}/`);
    check(landing, {
      "landing: status 200": (r) => r.status === 200,
      "landing: loads under 2s": (r) => r.timings.duration < 2000,
    });

    // Commodities API
    const commodities = http.get(`${BASE_URL}/api/commodities`);
    commoditiesLatency.add(commodities.timings.duration);
    check(commodities, {
      "commodities: status 200": (r) => r.status === 200,
      "commodities: returns array": (r) => {
        try { return Array.isArray(JSON.parse(r.body)); } catch { return false; }
      },
    });

    // Maintenance status API
    const status = http.get(`${BASE_URL}/api/maintenance/status`);
    check(status, {
      "maintenance status: 200": (r) => r.status === 200,
    });
  });

  sleep(1);

  // ── 2. Authentication ──
  group("Authentication", () => {
    const loggedIn = getAuthCookies();
    if (!loggedIn) {
      apiErrors.add(true);
      return;
    }
    apiErrors.add(false);
  });

  sleep(0.5);

  // ── 3. Authenticated API Calls ──
  group("Authenticated APIs", () => {
    // Wallet data
    const wallet = http.get(`${BASE_URL}/api/wallet`);
    walletLatency.add(wallet.timings.duration);
    const walletOk = check(wallet, {
      "wallet: status 200": (r) => r.status === 200,
      "wallet: has balance": (r) => {
        try {
          const data = JSON.parse(r.body);
          return data.wallet && data.wallet.balance !== undefined;
        } catch { return false; }
      },
    });
    if (!walletOk) apiErrors.add(true);

    // Baskets list
    const baskets = http.get(`${BASE_URL}/api/baskets`);
    check(baskets, {
      "baskets: status 200": (r) => r.status === 200,
    });

    // User session
    const session = http.get(`${BASE_URL}/api/auth/current`);
    check(session, {
      "session: status 200": (r) => r.status === 200,
    });
  });

  sleep(1);

  // ── 4. Database-Heavy: Read paths ──
  group("Database Reads", () => {
    // Multiple rapid commodity fetches (simulates browsing the market)
    for (let i = 0; i < 3; i++) {
      const res = http.get(`${BASE_URL}/api/commodities?type=SAVINGS`);
      check(res, {
        "rapid commodity fetch: 200": (r) => r.status === 200,
      });
    }
  });

  sleep(0.5);
}

// ─── Summary ────────────────────────────────────────────────────────
export function handleSummary(data) {
  const summary = {
    "Total requests": data.metrics.http_reqs.values.count,
    "Failed requests": data.metrics.http_req_failed.values.passes,
    "Avg response time": `${Math.round(data.metrics.http_req_duration.values.avg)}ms`,
    "p95 response time": `${Math.round(data.metrics.http_req_duration.values["p(95)"]) }ms`,
    "Max response time": `${Math.round(data.metrics.http_req_duration.values.max)}ms`,
    "Login success rate": `${(data.metrics.login_success?.values?.rate * 100 || 0).toFixed(1)}%`,
  };

  console.log("\n╔══════════════════════════════════════╗");
  console.log("║    CHOWVEST STRESS TEST RESULTS      ║");
  console.log("╠══════════════════════════════════════╣");
  for (const [key, value] of Object.entries(summary)) {
    console.log(`║  ${key.padEnd(22)} ${String(value).padStart(10)}  ║`);
  }
  console.log("╚══════════════════════════════════════╝\n");

  return {
    stdout: JSON.stringify(summary, null, 2),
  };
}
