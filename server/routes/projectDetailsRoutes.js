import express from 'express';
import {
  createProjectDetail,
  getProjectDetailsByProjectId,
  getProjectDetailsAssignedToUser,
  updateProjectDetailStatus,
  deleteProjectDetail,
  editProjectDetail,
  getProjectDetailsByUser,
  reorderProjectDetails,
} from '../controllers/projectDetailsController.js';
import { protectRoute } from '../middlewares/authmiddlewave.js';

const router = express.Router();

// Specific routes first
router.post('/', protectRoute, createProjectDetail);

router.get('/user/assigned/all', protectRoute, getProjectDetailsAssignedToUser);
router.get('/user/:userId', protectRoute, getProjectDetailsByUser);

// Reorder endpoint
router.put('/reorder', protectRoute, reorderProjectDetails);

// Status update
router.patch('/:id/status', protectRoute, updateProjectDetailStatus);

// Edit & delete
router.put('/:id', protectRoute, editProjectDetail);
router.delete('/:id', protectRoute, deleteProjectDetail);

// Finally: get all tasks for a project (by projectId)
router.get('/:projectId', protectRoute, getProjectDetailsByProjectId);

export default router;