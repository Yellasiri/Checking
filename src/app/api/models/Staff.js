import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    // availability: {
    //   type: String,
    //   required: true,
    // },
    isActive: { type: Boolean, default: true },
     phone: { type: String },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Staff || mongoose.model("Staff", staffSchema);
