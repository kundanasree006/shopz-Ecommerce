const mongoose = require("mongoose");

const holdingSchema = new mongoose.Schema(
  {
    stock: { type: mongoose.Schema.Types.ObjectId, ref: "Stock", required: true },
    symbol: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    avgBuyPrice: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const portfolioSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    holdings: { type: [holdingSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Portfolio", portfolioSchema);
