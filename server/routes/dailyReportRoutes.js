import express from "express";
import {
    getAllReports,
    createReport,
    updateReport,
    deleteReport,
    getDailyReports,
    reorderReports,
} from "../controllers/dailyReportController.js";

const router = express.Router();

// Routes
router.route("/").get(getAllReports).post(createReport);
router.route("/:id").put(updateReport).delete(deleteReport);

router.get("/:userId", getDailyReports);
router.post("/reorder", reorderReports);


export default router;