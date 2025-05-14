import express from 'express';
import {
  createProject,
  getUserProjects,
  updateProject,
  deleteProject,
  getProjectById,
} from '../controllers/projectController.js';

const router = express.Router();

// Create project
router.post('/', createProject);

// Get all projects
router.get('/', getUserProjects);

// Update project by ID
router.put('/:id', updateProject);

// Delete project by ID
router.delete('/:id', deleteProject);

// Get project by ID
router.get('/:id', getProjectById);

export default router;
