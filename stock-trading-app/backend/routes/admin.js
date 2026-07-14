const express = require("express");
const User = require("../models/User");
const Stock = require("../models/Stock");
const Transaction = require("../models/Transaction");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

// All routes below require an authenticated ADMIN
router.use(protect, requireRole("ADMIN"));

// @route  GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching users", error: err.message });
  }
});

// @route  PUT /api/admin/users/:id/status  (activate/deactivate a user)
router.put("/users/:id/status", async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error updating user status", error: err.message });
  }
});

// @route  GET /api/admin/transactions  (monitor all trading activity)
router.get("/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching transactions", error: err.message });
  }
});

// @route  GET /api/admin/stats  (dashboard summary numbers)
router.get("/stats", async (req, res) => {
  try {
    const [userCount, stockCount, txCount] = await Promise.all([
      User.countDocuments(),
      Stock.countDocuments({ isActive: true }),
      Transaction.countDocuments(),
    ]);
    const volumeAgg = await Transaction.aggregate([
      { $group: { _id: null, totalVolume: { $sum: "$total" } } },
    ]);
    res.json({
      userCount,
      stockCount,
      transactionCount: txCount,
      totalTradedVolume: volumeAgg[0]?.totalVolume || 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error fetching admin stats", error: err.message });
  }
});

module.exports = router;
