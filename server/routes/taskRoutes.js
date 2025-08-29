import express from "express";
import {
  createSubTask,
  createTask,
  dashboardStatistics,
  deleteRestoreTask,
  duplicateTask,
  getTask,
  getTasks,
  postTaskActivity,
  trashTask,
  updateTask,
  bulkReorderTasks, // 👈 new
} from "../controllers/taskControllers.js";
import { isAdminRoute, protectRoute } from "../middlewares/authmiddlewave.js";

const router = express.Router();

// 👇 NEW bulk reorder
router.post("/reorder", protectRoute, bulkReorderTasks);
router.put("/reorder", protectRoute, bulkReorderTasks);

router.post("/create", protectRoute, createTask);
router.post("/duplicate/:id", protectRoute, duplicateTask);
router.post("/activity/:id", protectRoute, postTaskActivity);

router.get("/dashboard", protectRoute, dashboardStatistics);
router.get("/", protectRoute, getTasks);
router.get("/:id", protectRoute, getTask);

router.put("/create-subtask/:id", protectRoute, createSubTask);
router.put("/update/:id", protectRoute, updateTask);
router.put("/:id", protectRoute, isAdminRoute, trashTask);


router.delete(
  "/delete-restore/:id?",
  protectRoute,
  isAdminRoute,
  deleteRestoreTask
);

export default router;