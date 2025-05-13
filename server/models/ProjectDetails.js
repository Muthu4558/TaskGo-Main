import mongoose from 'mongoose';

const projectDetailsSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  taskTitle: { type: String, required: true },
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  stage: { type: String, enum: ['todo', 'in progress', 'completed'], default: 'todo' },
  assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const ProjectDetail = mongoose.model('ProjectDetail', projectDetailsSchema);
export default ProjectDetail;
