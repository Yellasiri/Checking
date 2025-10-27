import mongoose from "mongoose";

const EditSessionSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  measurementLabel: { type: String },
  createdAt: { type: Date, default: Date.now, expires: 600 } // expires after 10 min
});

export default mongoose.models.EditSession ||
  mongoose.model("EditSession", EditSessionSchema);
