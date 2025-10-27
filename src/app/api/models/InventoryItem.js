
import mongoose from "mongoose";
const { Schema } = mongoose;

const InventoryItemSchema = new Schema({

  name: { type: String, required: true, index: true },
  category: { type: String, index: true },
  quantity: { type: Number, default: 0 },
  units: { type: String},
  
  reOrderLevel: { type: Number, default: 0 },

  isActive: { type: Boolean, default: true }
}, { timestamps: true,
  collection: 'inventory_items'
 });

export default mongoose.models.InventoryItem || mongoose.model("InventoryItem", InventoryItemSchema);
