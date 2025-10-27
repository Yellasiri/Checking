
import mongoose from "mongoose";
const { Schema } = mongoose;

const OfferSchema = new Schema(
  {
    body: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    sentCount: { type: Number, default: 0 },
    sentTo: [{ type: Schema.Types.ObjectId, ref: "Customer" }],
    offerEndDate: { type: String }, // new field
  },
  { timestamps: true }
);

export default mongoose.models.Offer || mongoose.model("Offer", OfferSchema);
