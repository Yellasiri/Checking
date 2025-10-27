import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone_number: {
      type: Number,
      required: true,
      unique: true,
    },
    last_login: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.models.User || mongoose.model("Dashboard_Users", userSchema);

export default UserModel;
