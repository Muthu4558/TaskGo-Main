import mongoose from 'mongoose';

const projectDetailsSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  taskTitle: { type: String, required: true },
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  stage: { type: String, enum: ['todo', 'inprogress', 'completed'], default: 'todo' },
  team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  order: { type: Number, default: 0 },
}, { timestamps: true });

const ProjectDetail = mongoose.model('ProjectDetail', projectDetailsSchema);
export default ProjectDetail;