
import mongoose from "mongoose";
const { Schema } = mongoose;

const MessageSchema = new Schema({
  from_id: { type: Schema.Types.ObjectId, ref: "User" },     // sender (system or user/staff)
  to_id: { type: Schema.Types.ObjectId, ref: "Customer" },  // target customer
  via: { type: String, enum: ['in-app','whatsapp','sms','email'], default: 'in-app' },
  subject: { type: String },
  text: { type: String },
  status: { type: String, enum: ['queued','sent','failed'], default: 'queued' }
}, { timestamps: true });

MessageSchema.index({ to_id: 1, createdAt: -1 });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
