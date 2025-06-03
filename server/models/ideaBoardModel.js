import mongoose from 'mongoose';

const ideaBoardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  stage: {
    type: String,
    enum: ['To Do', 'In Progress', 'Cpmpleted'],
    default: 'To Do',
  },
  tag: {
    type: String,
    default: '',
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

const IdeaBoard = mongoose.model('IdeaBoard', ideaBoardSchema);

export default IdeaBoard;
