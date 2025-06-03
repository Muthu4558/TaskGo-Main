import express from 'express';
import {
  createIdea,
  getIdeas,
  updateIdea,
  deleteIdea,
} from '../controllers/ideaBoardController.js';
import { protectRoute } from '../middlewares/authmiddlewave.js';

const router = express.Router();

router.use(protectRoute); // Apply to all routes below

router.post('/', createIdea);
router.get('/', getIdeas);
router.put('/:id', updateIdea);
router.delete('/:id', deleteIdea);

export default router;