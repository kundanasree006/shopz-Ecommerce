# StockTrade — Full-Stack MERN Stock Trading Platform

A complete MERN (MongoDB, Express.js, React.js, Node.js) application that lets users
explore stocks, view a live-updating market dashboard, simulate buy/sell trades with
a virtual cash balance, track their portfolio's profit/loss, and gives admins a panel
to manage stock listings, users, and monitor all trading activity.

## Features

- **JWT-based authentication** — register/login, passwords hashed with bcrypt.js
- **Role-based access control** — `USER` and `ADMIN` roles with route-level protection
- **Live market dashboard** — a backend interval simulates real-time price ticks every
  5 seconds (±1% moves); the frontend polls every 5 seconds so prices feel live
- **Buy/Sell trade simulation** — trades update a virtual cash balance and portfolio
  holdings atomically
- **Portfolio tracking** — current holdings, average buy price, current value, and
  profit/loss (absolute and %)
- **Admin panel** — manage stock listings (add/deactivate), enable/disable users,
  and view all transactions with live volume stats
- **Stock detail page** — live price chart (Chart.js / react-chartjs-2) plus buy/sell
  form
- **Responsive UI** — React + Bootstrap 5

## Project Structure

```
stock-trading-app/
├── backend/
│   ├── config/db.js            # MongoDB connection
│   ├── models/                 # User, Stock, Transaction, Portfolio schemas
│   ├── middleware/auth.js      # JWT verification + role guard
│   ├── routes/                 # auth, stocks, trade, portfolio, admin
│   ├── utils/seed.js           # seeds admin/demo users + sample stocks
│   ├── server.js               # app entry point + simulated price engine
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── api/axios.js         # axios instance with JWT interceptor
    │   ├── context/AuthContext.js
    │   ├── components/          # Navbar, PrivateRoute
    │   ├── pages/                # Login, Register, Dashboard, Market,
    │   │                          # StockDetail, Portfolio, AdminDashboard
    │   ├── App.js
    │   └── index.js
    ├── package.json
    └── .env.example
```

## Getting Started

### Prerequisites
- Node.js v18+ and npm v8+
- MongoDB running locally (or a MongoDB Atlas connection string)

### 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI and a long random JWT_SECRET
npm run seed     # creates admin + demo user + sample stocks
npm run dev      # starts the API on http://localhost:5000 (nodemon)
```

Seeded accounts:
- **Admin:** admin@stocktrade.com / Admin@123
- **Demo user:** demo@stocktrade.com / Demo@123

### 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
# edit .env if your backend runs somewhere other than localhost:5000
npm start        # starts React dev server on http://localhost:3000
```

Open http://localhost:3000, log in with the demo or admin account, and start trading.

## API Overview

| Method | Endpoint                        | Access        | Description                         |
|--------|----------------------------------|---------------|--------------------------------------|
| POST   | /api/auth/register               | Public        | Create an account                    |
| POST   | /api/auth/login                  | Public        | Log in, returns JWT                  |
| GET    | /api/auth/me                     | Authenticated | Get current user profile             |
| GET    | /api/stocks                      | Public        | List/search stocks                   |
| GET    | /api/stocks/:symbol              | Public        | Stock detail + price history         |
| POST   | /api/stocks                      | Admin         | Create a stock                       |
| PUT    | /api/stocks/:id                  | Admin         | Update a stock                       |
| DELETE | /api/stocks/:id                  | Admin         | Deactivate a stock                   |
| POST   | /api/trade/buy                   | Authenticated | Buy shares                           |
| POST   | /api/trade/sell                  | Authenticated | Sell shares                          |
| GET    | /api/trade/history                | Authenticated | Your trade history                   |
| GET    | /api/portfolio                   | Authenticated | Your holdings + profit/loss          |
| GET    | /api/admin/users                 | Admin         | List all users                       |
| PUT    | /api/admin/users/:id/status      | Admin         | Enable/disable a user                |
| GET    | /api/admin/transactions          | Admin         | All trades platform-wide             |
| GET    | /api/admin/stats                 | Admin         | Dashboard summary counts             |

## Notes on "Live" Data

No paid market-data API key is wired in by default. Instead, `server.js` runs a
5-second interval that nudges each stock's price up/down by up to 1%, appends to its
price history, and updates day-high/day-low/volume — this is what "Live Market
Dashboard (real-time price updates via API polling)" refers to in the spec. If you
have a real market-data API key (e.g. Alpha Vantage, Finnhub, Polygon.io), replace the
interval logic in `backend/server.js` with a call to that provider and store the
`STOCK_API_KEY` in `.env`.

## Testing & Validation Checklist (per spec)

- [ ] CRUD on all entities (users, stocks, transactions, portfolio)
- [ ] Form validation on registration, login, and trade forms
- [ ] Balance updates and transaction history accuracy
- [ ] Admin moderation workflows and access control
- [ ] Responsive layout across devices/browsers

## Tech Stack

**Backend:** Express, Mongoose, jsonwebtoken, bcryptjs, cors, dotenv, axios
**Frontend:** React, react-router-dom, axios, chart.js + react-chartjs-2, Bootstrap 5
