require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const Stock = require("./models/Stock");

const authRoutes = require("./routes/auth");
const stockRoutes = require("./routes/stocks");
const tradeRoutes = require("./routes/trade");
const portfolioRoutes = require("./routes/portfolio");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/trade", tradeRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Unexpected server error" });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  // Simulated live market feed: nudges each stock price randomly every 5s.
  // Swap this out for a real market-data API call if/when one is available.
  setInterval(async () => {
    try {
      const stocks = await Stock.find({ isActive: true });
      for (const stock of stocks) {
        const changePercent = (Math.random() - 0.5) * 0.02; // +/-1% max move per tick
        const newPrice = Math.max(1, +(stock.price * (1 + changePercent)).toFixed(2));

        stock.dayHigh = Math.max(stock.dayHigh, newPrice);
        stock.dayLow = stock.dayLow ? Math.min(stock.dayLow, newPrice) : newPrice;
        stock.price = newPrice;
        stock.volume += Math.floor(Math.random() * 500);

        stock.history.push({ price: newPrice });
        if (stock.history.length > 100) stock.history.shift(); // keep history bounded

        await stock.save();
      }
    } catch (err) {
      console.error("Price tick error:", err.message);
    }
  }, 5000);
};

start();
