import DailyReport from "../models/DailyReport.js";
import nodemailer from "nodemailer";
import User from "../models/user.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "taskmanager@mamce.org",
    pass: "fchs ppue ehkq lfzi",   // Replace with your email password or app-specific password
  },
});

export const reorderReports = async (req, res) => {
  const { reordered } = req.body;

  try {
    const updates = reordered.map(({ id, order }) =>
      DailyReport.findByIdAndUpdate(id, { order })
    );
    await Promise.all(updates);
    res.status(200).json({ message: "Reports reordered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error reordering reports" });
  }
};

export const getAllReports = async (req, res) => {
  const { userId } = req.query; // Fetch userId from query params
  try {
    const reports = await DailyReport.find({ userId });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDailyReports = async (req, res) => {
  const { userId } = req.params;

  try {
    const reports = await DailyReport.find({ userId });
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Server error while fetching reports" });
  }
};

export const createReport = async (req, res) => {
  const { content, date, userId } = req.body; 
  try {
    const newReport = new DailyReport({
      content,
      date: date || new Date().toLocaleString(),
      userId,
    });
    const savedReport = await newReport.save();
    res.status(201).json(savedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReport = async (req, res) => {
  const { id } = req.params;
  const { status, remark } = req.body; 

  try {
    const updatedReport = await DailyReport.findByIdAndUpdate(
      id,
      { status, remark }, 
      { new: true }
    );

    if (!updatedReport) {
      return res.status(404).json({ message: "Report not found" });
    }

    const user = await User.findById(updatedReport.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userEmail = user.email;

    const mailOptions = {
      from: "taskmanager@mamce.org", 
      to: userEmail,                
      subject: "Daily Report Updated",  
      text: `The daily report has been updated.\n\nRemark: ${remark}`, 
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Error sending email" });
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.status(200).json(updatedReport);
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({ message: "Error updating report" });
  }
};

export const deleteReport = async (req, res) => {
  const { id } = req.params;
  try {
    await DailyReport.findByIdAndDelete(id);
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};