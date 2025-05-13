import ProjectDetail from '../models/ProjectDetails.js';
import User from '../models/user.js'; 
import nodemailer from 'nodemailer';

// Email utility function
const sendEmail = async (to, subject, text, htmlContent) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail
      pass: process.env.EMAIL_PASS  // Your App Password (not your Gmail password)
    },
  });

  try {
    await transporter.sendMail({
      from: `"TaskGo" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: htmlContent,
    });
    console.log(`✅ Email sent to: ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
  }
};

export const createProjectDetail = async (req, res) => {
  try {
    const { projectId, taskTitle, dueDate, priority, stage, team } = req.body;

    // Step 1: Create the project detail
    const detail = await ProjectDetail.create({
      projectId,
      taskTitle,
      dueDate,
      priority,
      stage,
      team
    });

    // Step 2: Get team members' email addresses
    const users = await User.find({ _id: { $in: team } }, 'email name');
    const teamEmails = users.map(user => user.email);

    // Step 3: Send notification email to each member
    // Step 3: Send notification email to each member
    if (users.length === 0) {
      console.warn('⚠️ No users found in the team array to send email');
    } else {
      for (const user of users) {
        await sendEmail(
          user.email,
          '📝 New Task Assigned in TaskGo',
          `Hi ${user.name},\n\nYou have been assigned a new task: "${taskTitle}" due on ${new Date(dueDate).toLocaleDateString()}.`,
          `<p>Hi <strong>${user.name}</strong>,</p>
       <p>You have been assigned a new task: <strong>${taskTitle}</strong>.</p>
       <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
       <p><strong>Priority:</strong> ${priority}</p>
       <p><strong>Stage:</strong> ${stage}</p>
       <p>Please login to <a href="https://taskgo.in">TaskGo</a> to view your task.</p>`
        );
      }
    }

    // Step 4: Send response
    res.status(201).json({ detail, teamEmails });

  } catch (err) {
    console.error('❌ Error creating project detail:', err);
    res.status(400).json({ message: err.message });
  }
};

export const getProjectDetailsByProjectId = async (req, res) => {
  try {
    const details = await ProjectDetail.find({ projectId: req.params.projectId }).populate('team', 'name email');
    res.status(200).json(details);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProjectDetailsAssignedToUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch project details where the user is part of the team
    const details = await ProjectDetail.find({ team: userId })
      .populate({
        path: 'projectId',
        select: 'title dueDate priority assets' // Ensure you're populating the project details
      })
      .populate('team', 'name email'); // Ensure team members' names and emails are populated

    if (!details || details.length === 0) {
      return res.status(404).json({ message: "No project tasks found for this user" });
    }

    res.status(200).json(details);
  } catch (err) {
    console.error("Error fetching assigned project details:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateProjectDetailStatus = async (req, res) => {
  const { id } = req.params;
  const { stage } = req.body;

  try {
    const updated = await ProjectDetail.findByIdAndUpdate(
      id,
      { stage },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Project detail not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ message: 'Failed to update status' });
  }
};

export const editProjectDetail = async (req, res) => {
  const { id } = req.params;
  const { taskTitle, dueDate, priority, stage, team } = req.body; // Fields to be updated

  try {
    const updatedDetail = await ProjectDetail.findByIdAndUpdate(
      id,
      { taskTitle, dueDate, priority, stage, team }, // Update multiple fields
      { new: true } // Return the updated document
    );

    if (!updatedDetail) {
      return res.status(404).json({ message: 'Project detail not found' });
    }

    res.json(updatedDetail);
  } catch (err) {
    console.error('Error updating project detail:', err);
    res.status(500).json({ message: 'Failed to update project detail' });
  }
};

export const deleteProjectDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedDetail = await ProjectDetail.findByIdAndDelete(id);

    if (!deletedDetail) {
      return res.status(404).json({ message: 'Project detail not found' });
    }

    res.status(200).json({ message: 'Project detail deleted successfully' });
  } catch (err) {
    console.error('Error deleting project detail:', err);
    res.status(500).json({ message: 'Failed to delete project detail' });
  }
};

export const getProjectDetailsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch project details where the user is part of the team
    const details = await ProjectDetail.find({ team: userId })
      .populate({
        path: 'projectId',
        select: 'taskTitle dueDate priority assets title' // Populate project details
      })
      .populate('team', 'name email'); // Populate team members (name, email)

    if (!details || details.length === 0) {
      return res.status(404).json({ message: "No project tasks found for this user." });
    }

    res.status(200).json(details);
  } catch (err) {
    console.error('Error fetching project details for user:', err);
    res.status(500).json({ message: err.message });
  }
};