import express from "express";
import userRoutes from "./userRoutes.js";
import taskRoutes from "./taskRoutes.js";
import dailyReportRoutes from "./dailyReportRoutes.js"
import { signupUser } from "../controllers/signupContoller.js";

const router = express.Router();

router.use("/user", userRoutes); //api/user/login
router.use("/task", taskRoutes);
router.use("/daily-reports", dailyReportRoutes);
router.use("/signup", signupUser);

export default router;
