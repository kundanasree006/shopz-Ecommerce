const mongoose = require("mongoose");

const priceHistorySchema = new mongoose.Schema(
  {
    price: Number,
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const stockSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    previousClose: { type: Number, default: 0 },
    dayHigh: { type: Number, default: 0 },
    dayLow: { type: Number, default: 0 },
    volume: { type: Number, default: 0 },
    sector: { type: String, default: "General" },
    isActive: { type: Boolean, default: true },
    history: { type: [priceHistorySchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stock", stockSchema);
