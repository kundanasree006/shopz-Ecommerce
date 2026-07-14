const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stock: { type: mongoose.Schema.Types.ObjectId, ref: "Stock", required: true },
    symbol: { type: String, required: true },
    type: { type: String, enum: ["BUY", "SELL"], required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "APPROVED" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
