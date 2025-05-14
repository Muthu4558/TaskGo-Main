import express from 'express';
import {
  createProject,
  getUserProjects,
  updateProject,
  deleteProject,
  getProjectById,
} from '../controllers/projectController.js';
import { protectRoute } from '../middlewares/authmiddlewave.js';

const router = express.Router();

// Create project
router.post('/', protectRoute, createProject);

// Get all projects for logged-in user
router.get('/', protectRoute, getUserProjects);

// Update project by ID
router.put('/:id', protectRoute, updateProject);

// Delete project by ID
router.delete('/:id', protectRoute, deleteProject);

// Get project by ID
router.get('/:id', protectRoute, getProjectById);


export default router;
