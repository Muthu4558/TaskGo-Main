import Project from '../models/Project.js';

export const createProject = async (req, res) => {
  try {
    const { title, dueDate, priority, assets } = req.body;

    if (!title || !dueDate || !priority) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newProject = new Project({
      title,
      dueDate,
      priority,
      assets,
      createdBy: req.user.userId, // ✅ This should work based on your middleware
      tenantId: req.user.tenantId, // optional if using multitenancy
    });

    const saved = await newProject.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error in createProject:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user.userId })
      .sort({ order: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reorderProjects = async (req, res) => {
  try {
    const { projects } = req.body;
    for (let proj of projects) {
      await Project.findOneAndUpdate(
        { _id: proj._id, createdBy: req.user.userId },
        { order: proj.order }
      );
    }
    res.json({ message: "Projects reordered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const updated = await Project.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.userId },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Project not found' });
    res.status(200).json(updated);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const deleted = await Project.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.userId,
    });
    if (!deleted) return res.status(404).json({ message: 'Project not found' });
    res.status(200).json({ message: 'Project deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user.userId, // ensures only the creator can access it
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
