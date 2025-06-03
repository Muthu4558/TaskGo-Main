import IdeaBoard from '../models/ideaBoardModel.js';

export const createIdea = async (req, res) => {
  try {
    const idea = new IdeaBoard({ ...req.body, createdBy: req.user.userId });
    await idea.save();
    res.status(201).json(idea);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getIdeas = async (req, res) => {
  try {
    const ideas = await IdeaBoard.find({ createdBy: req.user.userId }).sort({ createdAt: -1 });
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateIdea = async (req, res) => {
  try {
    const idea = await IdeaBoard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!idea) return res.status(404).json({ error: 'Idea not found' });
    res.json(idea);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteIdea = async (req, res) => {
  try {
    const idea = await IdeaBoard.findByIdAndDelete(req.params.id);
    if (!idea) return res.status(404).json({ error: 'Idea not found' });
    res.json({ message: 'Idea deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
