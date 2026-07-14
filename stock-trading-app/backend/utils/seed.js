// Seeds the database with an admin user, a demo user, and a starter set of stocks.
// Run with: npm run seed  (make sure your .env is configured first)
require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const Stock = require("../models/Stock");
const Portfolio = require("../models/Portfolio");

const seedStocks = [
  { symbol: "AAPL", name: "Apple Inc.", price: 195.5, sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 152.3, sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 415.2, sector: "Technology" },
  { symbol: "TSLA", name: "Tesla Inc.", price: 248.4, sector: "Automotive" },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 178.9, sector: "E-Commerce" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", price: 198.7, sector: "Finance" },
  { symbol: "NFLX", name: "Netflix Inc.", price: 632.1, sector: "Media" },
  { symbol: "RELI", name: "Reliance Industries", price: 2890.0, sector: "Conglomerate" },
];

const run = async () => {
  await connectDB();

  // Admin user
  const adminEmail = "admin@stocktrade.com";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const hashed = await bcrypt.hash("Admin@123", 10);
    admin = await User.create({ name: "Admin", email: adminEmail, password: hashed, role: "ADMIN" });
    await Portfolio.create({ user: admin._id, holdings: [] });
    console.log("Created admin user:", adminEmail, "/ password: Admin@123");
  }

  // Demo user
  const demoEmail = "demo@stocktrade.com";
  let demo = await User.findOne({ email: demoEmail });
  if (!demo) {
    const hashed = await bcrypt.hash("Demo@123", 10);
    demo = await User.create({ name: "Demo User", email: demoEmail, password: hashed, role: "USER" });
    await Portfolio.create({ user: demo._id, holdings: [] });
    console.log("Created demo user:", demoEmail, "/ password: Demo@123");
  }

  // Stocks
  for (const s of seedStocks) {
    const exists = await Stock.findOne({ symbol: s.symbol });
    if (!exists) {
      await Stock.create({
        ...s,
        previousClose: s.price,
        dayHigh: s.price,
        dayLow: s.price,
        history: [{ price: s.price }],
      });
      console.log("Created stock:", s.symbol);
    }
  }

  console.log("Seeding complete.");
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
