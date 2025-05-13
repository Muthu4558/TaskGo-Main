import express from 'express';
import {
  createProjectDetail,
  getProjectDetailsByProjectId,
  getProjectDetailsAssignedToUser,
  updateProjectDetailStatus,
  deleteProjectDetail,
  editProjectDetail,
  getProjectDetailsByUser
} from '../controllers/projectDetailsController.js';
import { protectRoute } from '../middlewares/authmiddlewave.js';

const router = express.Router();

// POST: Create a new task for a project
router.post('/', protectRoute, createProjectDetail);

// GET: Fetch all tasks for a specific project
router.get('/:projectId', protectRoute, getProjectDetailsByProjectId);

router.get('/user/assigned/all', protectRoute, getProjectDetailsAssignedToUser);

router.patch('/:id/status', protectRoute, updateProjectDetailStatus); // ✅ New route

router.put('/:id', editProjectDetail);

router.delete('/:id', deleteProjectDetail);

router.get("/user/:userId", getProjectDetailsByUser);

export default router;
