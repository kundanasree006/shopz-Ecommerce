const express = require("express");
const mongoose = require("mongoose");
const Stock = require("../models/Stock");
const User = require("../models/User");
const Portfolio = require("../models/Portfolio");
const Transaction = require("../models/Transaction");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route  POST /api/trade/buy
router.post("/buy", protect, async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const qty = Number(quantity);

    if (!symbol || !qty || qty <= 0) {
      return res.status(400).json({ message: "symbol and a positive quantity are required" });
    }

    const stock = await Stock.findOne({ symbol: symbol.toUpperCase(), isActive: true });
    if (!stock) return res.status(404).json({ message: "Stock not found" });

    const user = await User.findById(req.user.id);
    const cost = stock.price * qty;

    if (user.balance < cost) {
      return res.status(400).json({ message: "Insufficient virtual balance for this trade" });
    }

    // Deduct balance
    user.balance -= cost;
    await user.save();

    // Update / create portfolio holding
    let portfolio = await Portfolio.findOne({ user: user._id });
    if (!portfolio) portfolio = await Portfolio.create({ user: user._id, holdings: [] });

    const holding = portfolio.holdings.find((h) => h.symbol === stock.symbol);
    if (holding) {
      const totalCost = holding.avgBuyPrice * holding.quantity + cost;
      holding.quantity += qty;
      holding.avgBuyPrice = totalCost / holding.quantity;
    } else {
      portfolio.holdings.push({
        stock: stock._id,
        symbol: stock.symbol,
        quantity: qty,
        avgBuyPrice: stock.price,
      });
    }
    await portfolio.save();

    const transaction = await Transaction.create({
      user: user._id,
      stock: stock._id,
      symbol: stock.symbol,
      type: "BUY",
      quantity: qty,
      price: stock.price,
      total: cost,
    });

    res.status(201).json({ message: "Buy order executed", transaction, balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: "Server error executing buy order", error: err.message });
  }
});

// @route  POST /api/trade/sell
router.post("/sell", protect, async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const qty = Number(quantity);

    if (!symbol || !qty || qty <= 0) {
      return res.status(400).json({ message: "symbol and a positive quantity are required" });
    }

    const stock = await Stock.findOne({ symbol: symbol.toUpperCase(), isActive: true });
    if (!stock) return res.status(404).json({ message: "Stock not found" });

    const portfolio = await Portfolio.findOne({ user: req.user.id });
    const holding = portfolio && portfolio.holdings.find((h) => h.symbol === stock.symbol);

    if (!holding || holding.quantity < qty) {
      return res.status(400).json({ message: "You do not own enough shares to sell" });
    }

    const proceeds = stock.price * qty;

    holding.quantity -= qty;
    if (holding.quantity === 0) {
      portfolio.holdings = portfolio.holdings.filter((h) => h.symbol !== stock.symbol);
    }
    await portfolio.save();

    const user = await User.findById(req.user.id);
    user.balance += proceeds;
    await user.save();

    const transaction = await Transaction.create({
      user: user._id,
      stock: stock._id,
      symbol: stock.symbol,
      type: "SELL",
      quantity: qty,
      price: stock.price,
      total: proceeds,
    });

    res.status(201).json({ message: "Sell order executed", transaction, balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: "Server error executing sell order", error: err.message });
  }
});

// @route  GET /api/trade/history
router.get("/history", protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching trade history", error: err.message });
  }
});

module.exports = router;
