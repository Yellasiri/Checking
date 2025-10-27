
import mongoose from "mongoose";
const { Schema } = mongoose;

const GalleryImageSchema = new Schema({
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
  fileName: { type: String },
  url: { type: String, required: true },
  category: { type: String },
  subCategory: { type: String },
  color: { type: String },
  addedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.GalleryImage || mongoose.model("GalleryImage", GalleryImageSchema);
