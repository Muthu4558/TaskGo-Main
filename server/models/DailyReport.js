// models/DailyReport.js
import mongoose from "mongoose";

const dailyReportSchema = mongoose.Schema(
  {
    content: { type: String, required: true },
    status: { type: String, default: "Todo" },
    remark: { type: String },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const DailyReport = mongoose.model("DailyReport", dailyReportSchema);
export default DailyReport;