
import mongoose from "mongoose";
const { Schema } = mongoose;

const AddressSchema = new Schema({
  line1: String, line2: String, city: String, state: String, zip: String, country: String
}, { _id: false });

const UserSchema = new Schema({
  name: { type: String, required: true, index: true },
  email: { type: String, lowercase: true, trim: true, index: true, sparse: true },
  phone: { type: String, index: true, sparse: true },
  password: { type: String },
  boutiqueName: { type: String },
  boutiqueType: { type: String },
  address: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
