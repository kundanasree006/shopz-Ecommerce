const express = require("express");
const Stock = require("../models/Stock");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

// @route  GET /api/stocks
// Public list + search + sector filter, used by the Market page
router.get("/", async (req, res) => {
  try {
    const { search, sector } = req.query;
    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { symbol: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }
    if (sector) filter.sector = sector;

    const stocks = await Stock.find(filter).select("-history").sort({ symbol: 1 });
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching stocks", error: err.message });
  }
});

// @route  GET /api/stocks/:symbol
// Stock detail page: current data + recent price history for charting
router.get("/:symbol", async (req, res) => {
  try {
    const stock = await Stock.findOne({ symbol: req.params.symbol.toUpperCase() });
    if (!stock) return res.status(404).json({ message: "Stock not found" });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching stock", error: err.message });
  }
});

// @route  POST /api/stocks  (ADMIN only)
router.post("/", protect, requireRole("ADMIN"), async (req, res) => {
  try {
    const { symbol, name, price, sector } = req.body;
    if (!symbol || !name || price == null) {
      return res.status(400).json({ message: "symbol, name and price are required" });
    }

    const exists = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (exists) return res.status(400).json({ message: "Stock with this symbol already exists" });

    const stock = await Stock.create({
      symbol: symbol.toUpperCase(),
      name,
      price,
      previousClose: price,
      dayHigh: price,
      dayLow: price,
      sector: sector || "General",
      history: [{ price }],
    });
    res.status(201).json(stock);
  } catch (err) {
    res.status(500).json({ message: "Server error creating stock", error: err.message });
  }
});

// @route  PUT /api/stocks/:id  (ADMIN only)
router.put("/:id", protect, requireRole("ADMIN"), async (req, res) => {
  try {
    const updates = req.body;
    const stock = await Stock.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!stock) return res.status(404).json({ message: "Stock not found" });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: "Server error updating stock", error: err.message });
  }
});

// @route  DELETE /api/stocks/:id  (ADMIN only) - soft delete
router.delete("/:id", protect, requireRole("ADMIN"), async (req, res) => {
  try {
    const stock = await Stock.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!stock) return res.status(404).json({ message: "Stock not found" });
    res.json({ message: "Stock deactivated", stock });
  } catch (err) {
    res.status(500).json({ message: "Server error deleting stock", error: err.message });
  }
});

module.exports = router;
