// src/app/api/models/Orders.js
import mongoose,{Schema} from "mongoose";


const MeasurementSchema = new Schema({
  label: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });





const ORDER_STATUS = [
  'new','pending','in_progress','ready_for_delivery','out_for_delivery','completed','cancelled','confirmed','awaiting_edit'
];

const OrderSchema = new Schema({
  
  customer: { type: Schema.Types.ObjectId, ref: "Customer", index: true },
  garment: { type: String },
  deliveryDate: { type: Date },
  specialInstructions: { type: String },

  // assignment
  staffAssigned: { type: Schema.Types.ObjectId, ref: "Staff" },

  // payments
  totalPayment: { type: Number, default: 0 },
  advancePayment: { type: Number, default: 0 },

  // messaging / offers
  sendOrderSummaryWhatsapp: { type: Boolean, default: false },
  

  status: { type: String, enum: ORDER_STATUS, default: 'pending', index: true },

  // embedded details
  measurements: { type: [MeasurementSchema], default: [] },
  sampleImages: { type: String, default: "" },
  handwrittenImageUrl: { type: String, default: "" },

  

  createdBy: { type: Schema.Types.ObjectId, ref: "User" },

}, {
  timestamps: true,
  
});





export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
