const express = require("express");
const Portfolio = require("../models/Portfolio");
const Stock = require("../models/Stock");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route  GET /api/portfolio
// Returns current holdings enriched with live price + profit/loss
router.get("/", protect, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.id });
    const user = await User.findById(req.user.id).select("balance");

    if (!portfolio) {
      return res.json({ holdings: [], balance: user.balance, totalInvested: 0, currentValue: 0, profitLoss: 0 });
    }

    const symbols = portfolio.holdings.map((h) => h.symbol);
    const stocks = await Stock.find({ symbol: { $in: symbols } });
    const priceMap = Object.fromEntries(stocks.map((s) => [s.symbol, s.price]));

    let totalInvested = 0;
    let currentValue = 0;

    const enrichedHoldings = portfolio.holdings.map((h) => {
      const currentPrice = priceMap[h.symbol] ?? h.avgBuyPrice;
      const invested = h.avgBuyPrice * h.quantity;
      const value = currentPrice * h.quantity;
      totalInvested += invested;
      currentValue += value;
      return {
        symbol: h.symbol,
        quantity: h.quantity,
        avgBuyPrice: h.avgBuyPrice,
        currentPrice,
        invested,
        currentValue: value,
        profitLoss: value - invested,
        profitLossPercent: invested > 0 ? ((value - invested) / invested) * 100 : 0,
      };
    });

    res.json({
      holdings: enrichedHoldings,
      balance: user.balance,
      totalInvested,
      currentValue,
      profitLoss: currentValue - totalInvested,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error fetching portfolio", error: err.message });
  }
});

module.exports = router;
