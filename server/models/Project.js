// models/projectModel.js
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dueDate: { type: Date, required: true },
  priority: { type: String, required: true },
  assets: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
