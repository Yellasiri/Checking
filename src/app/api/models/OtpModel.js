// import mongoose from "mongoose";

// const otpSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   phone_number: { type: Number, required: true },
//   otp: { type: Number, required: true },
//   createdAt: { type: Date, default: Date.now, expires: 300 },
// });

// const OtpModel = mongoose.models.LoginOtp || mongoose.model("LoginOtp", otpSchema);
// export default OtpModel;





import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema(
  {
    phone_number: { type: String, required: true, index: true }, // store as 10 digits (no +91)
    name: { type: String, required: true },
    otp: { type: String, required: true },
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true }, // TTL handled by index below
  },
  { timestamps: true }
);

// Auto-delete expired docs
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Otp || mongoose.model("Otp", OtpSchema);
