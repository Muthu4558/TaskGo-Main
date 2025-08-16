// models/Project.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dueDate: { type: Date, required: true },
  priority: { type: String, default: "medium" },
  assets: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tenantId: { type: String },
  order: { type: Number, default: Date.now } // NEW
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);