import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true },
  mobileNumber: { type: String, required: true, trim: true },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  images: [{ type: String }],
}, { timestamps: true });

export default mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);