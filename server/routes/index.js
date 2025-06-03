import express from "express";
import userRoutes from "./userRoutes.js";
import taskRoutes from "./taskRoutes.js";
import dailyReportRoutes from "./dailyReportRoutes.js"
import projectRoutes from "./projectRoutes.js";
import projectDetailRoutes from "./projectDetailsRoutes.js";
import { signupUser } from "../controllers/signupContoller.js";
import ideaBoardRoutes from "./ideaBoardRoutes.js";

const router = express.Router();

router.use("/user", userRoutes); //api/user/login
router.use("/task", taskRoutes);
router.use("/daily-reports", dailyReportRoutes);
router.use("/projects", projectRoutes);
router.use("/project-details", projectDetailRoutes);
router.use("/signup", signupUser);
router.use("/idea-board", ideaBoardRoutes);


export default router;
