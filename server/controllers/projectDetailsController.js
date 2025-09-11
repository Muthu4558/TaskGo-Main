import ProjectDetail from '../models/ProjectDetails.js';
import User from '../models/user.js';
import nodemailer from 'nodemailer';

const QIKCHAT_API_KEY = process.env.QIKCHAT_API_KEY;
const QIKCHAT_API_URL = process.env.QIKCHAT_API_URL;

const sendWhatsAppTemplate = async (phone, templateName, parameters) => {
  if (!QIKCHAT_API_URL || !QIKCHAT_API_KEY) return;
  const payload = {
    to_contact: `+91${phone}`,
    type: 'template',
    template: {
      name: templateName,
      language: 'en',
      components: [
        {
          type: 'body',
          parameters: parameters.map(param => ({ type: 'text', text: param })),
        },
      ],
    },
  };

  try {
    const response = await fetch(QIKCHAT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'QIKCHAT-API-KEY': QIKCHAT_API_KEY,
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok || result.status === false) {
      console.error('❌ WhatsApp send failed:', result);
    } else {
      console.log('✅ WhatsApp message sent:', result);
    }
  } catch (error) {
    console.error('🔥 WhatsApp error:', error.message);
  }
};

const sendEmail = async (to, subject, text, htmlContent) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials not configured; skipping email send');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
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
    const { projectId, taskTitle, dueDate, priority, stage = 'todo', team = [] } = req.body;

    // determine highest order + 1
    const highest = await ProjectDetail.findOne({ projectId }).sort({ order: -1 }).select('order');
    const nextOrder = highest && typeof highest.order === 'number' ? highest.order + 1 : 1;

    const detail = await ProjectDetail.create({
      projectId,
      taskTitle,
      dueDate,
      priority,
      stage,
      team,
      order: nextOrder,
    });

    // populate team users
    const users = await User.find({ _id: { $in: team } }, 'email name phone');

    // notify each user (email + optional WhatsApp)
    for (const user of users) {
      // email (if configured)
      await sendEmail(
        user.email,
        '📝 New Task Assigned in TaskGo',
        `Hi ${user.name},\n\nYou have been assigned a new task: "${taskTitle}" due on ${new Date(dueDate).toLocaleDateString()}.`,
        `<p>Hi <strong>${user.name}</strong>,</p>
         <p>You have been assigned a new task: <strong>${taskTitle}</strong>.</p>
         <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
         <p><strong>Priority:</strong> ${priority}</p>
         <p><strong>Stage:</strong> ${stage}</p>
         <p>Please login to <a href="https://taskgo.in/userproject">TaskGo</a> to view your task.</p>`
      );

      // whatsapp template (optional)
      if (user.phone) {
        await sendWhatsAppTemplate(user.phone, 'taskgo_12', [
          user.name,
          taskTitle,
          new Date(dueDate).toLocaleDateString(),
          priority,
          stage,
        ]);
      }
    }

    const populated = await ProjectDetail.findById(detail._id).populate('team', 'name email phone');
    res.status(201).json(populated);
  } catch (err) {
    console.error('❌ Error creating project detail:', err);
    res.status(400).json({ message: err.message });
  }
};

export const getProjectDetailsByProjectId = async (req, res) => {
  try {
    const details = await ProjectDetail.find({ projectId: req.params.projectId })
      .populate('team', 'name email phone')
      .sort({ order: -1 }); // highest order first
    res.status(200).json(details);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getProjectDetailsAssignedToUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const details = await ProjectDetail.find({ team: userId })
      .populate({
        path: 'projectId',
        select: 'title dueDate priority assets',
      })
      .populate('team', 'name email');

    if (!details || details.length === 0) {
      return res.status(404).json({ message: 'No project tasks found for this user' });
    }

    res.status(200).json(details);
  } catch (err) {
    console.error('Error fetching assigned project details:', err);
    res.status(500).json({ message: err.message });
  }
};

export const updateProjectDetailStatus = async (req, res) => {
  const { id } = req.params;
  const { stage } = req.body;

  try {
    const updated = await ProjectDetail.findByIdAndUpdate(id, { stage }, { new: true }).populate('team', 'name email phone');
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
  const { taskTitle, dueDate, priority, stage, team } = req.body;

  try {
    const updatedDetail = await ProjectDetail.findByIdAndUpdate(
      id,
      { taskTitle, dueDate, priority, stage, team },
      { new: true }
    ).populate('team', 'name email phone');

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

    const details = await ProjectDetail.find({ team: userId })
      .populate({
        path: 'projectId',
        select: 'title dueDate priority assets',
      })
      .populate('team', 'name email');

    if (!details || details.length === 0) {
      return res.status(404).json({ message: 'No project tasks found for this user.' });
    }

    res.status(200).json(details);
  } catch (err) {
    console.error('Error fetching project details for user:', err);
    res.status(500).json({ message: err.message });
  }
};

// New: reorder multiple tasks
export const reorderProjectDetails = async (req, res) => {
  try {
    const { tasks } = req.body; // [{ _id, order }, ...]
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ message: 'tasks must be an array' });
    }

    const bulkOps = tasks.map((t) => ({
      updateOne: {
        filter: { _id: t._id },
        update: { $set: { order: t.order } },
      },
    }));

    if (bulkOps.length > 0) {
      await ProjectDetail.bulkWrite(bulkOps);
    }

    // return updated list for projectId (if tasks provided, derive projectId from first task)
    const first = tasks[0];
    let projectId = null;
    if (first) {
      const doc = await ProjectDetail.findById(first._id).select('projectId');
      if (doc) projectId = doc.projectId;
    }

    const details = projectId
      ? await ProjectDetail.find({ projectId }).populate('team', 'name email phone').sort({ order: -1 })
      : [];

    res.status(200).json({ message: 'Reordered', details });
  } catch (err) {
    console.error('Error reordering tasks:', err);
    res.status(500).json({ message: 'Failed to reorder tasks' });
  }
};

// controllers/projectDetails.js
export const sendTaskReminder = async (req, res) => {
  try {
    const { id } = req.params; // task id
    const task = await ProjectDetail.findById(id).populate('team', 'email name phone');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // notify each assigned user
    for (const user of task.team) {
      // Email
      await sendEmail(
        user.email,
        '⏰ Task Reminder - TaskGo',
        `Hi ${user.name},\n\nReminder: The task "${task.taskTitle}" is due on ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}.`,
        `<p>Hi <strong>${user.name}</strong>,</p>
         <p>This is a reminder for your task: <strong>${task.taskTitle}</strong>.</p>
         <p><strong>Due Date:</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
         <p><strong>Priority:</strong> ${task.priority}</p>
         <p><strong>Status:</strong> ${task.stage}</p>
         <p>Please login to <a href="https://taskgo.in/userproject">TaskGo</a> for details.</p>`
      );

      // WhatsApp
      if (user.phone) {
        await sendWhatsAppTemplate(user.phone, 'taskgo_reminder', [
          user.name,
          task.taskTitle,
          task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A',
          task.priority,
          task.stage,
        ]);
      }
    }

    res.json({ message: 'Reminder sent successfully' });
  } catch (err) {
    console.error('❌ Error sending reminder:', err);
    res.status(500).json({ message: 'Failed to send reminder' });
  }
};