<h1 align="center">WhiteBit TypeScript SDK</h1>

<p align="center">
  <strong>Official TypeScript SDK for the WhiteBit API — trade, query, and manage your crypto portfolio programmatically.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-Node.js ≥ 18-3178C6?style=flat-square&logo=typescript" alt="TypeScript Node.js ≥ 18" />
  <img src="https://img.shields.io/badge/license-Apache_2.0-green?style=flat-square" alt="Apache 2.0 license" />
</p>

---

## Prerequisites

| Requirement | Details |
|-------------|---------|
| **TypeScript Node.js ≥ 18** | Required runtime |
| **WhiteBit account** | Sign up at [whitebit.com](https://whitebit.com) |
| **WhiteBit API key** | Profile → API keys → Create key (Read and/or Trade permissions) |

---

## Installation

```bash
npm install whitebit-typescript-sdk
```

---

## Quick Start

### 1. Get your API credentials

1. Log in to [whitebit.com](https://whitebit.com) → **Profile → API keys**
2. Create a new key — choose **Read** and/or **Trade** permissions as needed
3. Copy your **API Key** and **Token**

> Public endpoints (market data, tickers, order book) work without credentials. Private endpoints (account, trading) require both.

### 2. Initialize the client

**Public endpoints only** (market data, tickers, order book):

```ts
import { WhitebitApiClient } from "whitebit-typescript-sdk";

const client = new WhitebitApiClient({ txcApikey: "" });
```

**Private endpoints** (account, trading — requires HMAC signing):

```ts
import { WhitebitApiClient } from "whitebit-typescript-sdk";
import { createHmacFetch } from "whitebit-typescript-sdk/auth";

const client = new WhitebitApiClient({
  txcApikey: "YOUR_API_KEY",
  fetch: createHmacFetch("YOUR_API_SECRET"),
});
```

> **Note:** WhiteBit private endpoints use HMAC-SHA512 signing (`X-TXC-PAYLOAD` + `X-TXC-SIGNATURE`).
> `createHmacFetch` handles this automatically — no manual signing needed.
```

---

## Usage Examples

```ts
// Market data (no credentials required)
const tickers = await client.publicApiV4.getMarketActivity();
const depth   = await client.publicApiV4.getOrderbook({ market: "BTC_USDT" });

// Account
const balance = await client.accountEndpoints.getTradingBalance();

// Spot trading
const order   = await client.spotTrading.createLimitOrder({
  market: "BTC_USDT",
  side: "buy",
  amount: "0.01",
  price: "95000",
});
await client.spotTrading.cancelOrder({ market: "BTC_USDT", orderId: order.orderId });

// Main account — transfer & withdraw
await client.transfer.transfer({ from: "main", to: "spot", ticker: "USDT", amount: "100" });
await client.withdraw.createWithdraw({ ticker: "USDT", amount: "500", address: "0x..." });
```

---

## Available Modules

| Module | Description |
|--------|-------------|
| `publicApiV4` | Tickers, order book, trade history, klines, assets |
| `spotTrading` | Limit, market, stop-limit, stop-market, bulk orders |
| `collateralTrading` | Collateral orders, OCO, positions |
| `accountEndpoints` | Trading balance, open orders, order history |
| `mainAccount` | Main balances, deposit addresses, fee info |
| `transfer` | Transfer between main and trade accounts |
| `withdraw` | Withdrawal requests |
| `codes` | WhiteBit codes — create, apply, history |
| `fees` | Trading fees |
| `subAccount` | Sub-account management |

---

## Resources

| | |
|---|---|
| [WhiteBIT API Documentation](https://docs.whitebit.com) | Official API reference |
| [API Platform Overview](https://docs.whitebit.com/private/http-trade-v4/) | REST, WebSocket, authentication, rate limits |
| [Use with AI](https://github.com/whitebit-exchange/whitebit-mcp) | Use API docs with Claude, Cursor, VS Code via MCP |
| [GitHub Repository](https://github.com/whitebit-exchange/typescript-sdk) | Source code |
| [Releases](https://github.com/whitebit-exchange/typescript-sdk/releases) | Binaries and changelog |
| [Contributing](CONTRIBUTING.md) | Development setup and contribution guide |
| [Report an Issue](https://github.com/whitebit-exchange/typescript-sdk/issues) | Bug reports and feature requests |
| [WhiteBIT Exchange](https://whitebit.com) | The exchange |

---

## License

[Apache 2.0](LICENSE.md)
