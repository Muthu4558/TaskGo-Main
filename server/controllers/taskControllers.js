import cron from 'node-cron';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';
import Task from '../models/task.js';
import User from '../models/user.js';

const QIKCHAT_API_KEY = process.env.QIKCHAT_API_KEY;
const QIKCHAT_API_URL = process.env.QIKCHAT_API_URL;

// Helper: send WhatsApp template via QikChat
const sendWhatsAppTemplate = async (phone, templateName, parameters) => {
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

// Helper: send email
const sendEmail = async (to, subject, text, htmlContent) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html: htmlContent,
    });
    console.log(`Email sent successfully to: ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
};

export const createTask = async (req, res) => {
  try {
    const { userId, tenantId } = req.user;
    const { title,description, team, stage, date, priority, assets } = req.body;

    let text = "New task has been assigned to you";
    if (team?.length > 1) {
      text = text + ` and ${team?.length - 1} others.`;
    }

    text = `${text} The task priority is set at ${priority} priority, so check and act accordingly. The task date is ${new Date(date).toDateString()}. Thank you!!!`;

    const activity = { type: 'assigned', activity: text, by: userId };

    const task = await Task.create({
      title,
      description,
      team,
      stage: stage.toLowerCase(),
      date,
      priority: priority.toLowerCase(),
      assets,
      activities: [activity],
      tenantId,
    });

    // Notify each team member
    for (const memberId of team) {
      const user = await User.findOne({ _id: memberId, tenantId });
      if (!user) continue;

      // Email
      if (user.email) {
        const emailSubject = `Task Assigned: ${title}`;
        const emailText = text;
        const emailHtml = `<h3>New Task: ${title}</h3><p>${text}</p>`;
        await sendEmail(user.email, emailSubject, emailText, emailHtml);
      }

      // WhatsApp
      if (user.phone) {
        await sendWhatsAppTemplate(
          user.phone,
          'taskgo_task_assigning_message_1',
          [title, priority, new Date(date).toDateString()]
        );
      }
    }

    res.status(200).json({ status: true, task, message: 'Task assigned and notifications sent.' });
  } catch (error) {
    console.error('Error in createTask:', error);
    res.status(400).json({ status: false, message: error.message });
  }
};

export const duplicateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;

    const task = await Task.findOne({ _id: id, tenantId }); // Ensure task belongs to the same tenant
    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }

    const newTask = await Task.create({
      ...task.toObject(),
      _id: undefined, // Remove the existing _id to create a new one
      title: task.title + " - Duplicate",
      tenantId, // Ensure new task belongs to the same tenant
    });

    res.status(200).json({ status: true, message: "Task duplicated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const postTaskActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user; // This assumes user is authenticated and the userId is available
    const { type, activity } = req.body;

    // Find the task by ID and populate the 'team' field to get user details
    const task = await Task.findById(id).populate('team');
    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }

    // Prepare the activity data to push into the task
    const data = {
      type,
      activity,
      by: userId,
      date: new Date(),
    };

    // Push the activity to the task's activities array
    task.activities.push(data);
    await task.save();

    // Ensure users are found (task.team should be populated)
    if (!task.team.length) {
      return res.status(404).json({ status: false, message: "No users found for this task" });
    }

    // Prepare the email content
    const subject = `New Task Activity: ${type}`;
    const text = `There is a new activity"${type}": ${activity}`;
    const htmlContent = `<p>There is a new activity of type <strong>${type}</strong>: ${activity}</p>`;

    // Send email to all users assigned to the task
    for (const user of task.team) {
      if (user.email) { // Ensure the user has an email field
        console.log(`Sending email to: ${user.email}`);
        await sendEmail(user.email, subject, text, htmlContent); // Send email to each user
      }
    }

    // Respond with success message
    res.status(200).json({ status: true, message: "Activity posted successfully." });
  } catch (error) {
    console.log("Error posting task activity:", error);
    res.status(400).json({ status: false, message: error.message });
  }
};

export const dashboardStatistics = async (req, res) => {
  try {
    const { userId, isAdmin, tenantId } = req.user;

    if (!tenantId) {
      return res.status(400).json({ status: false, message: "Tenant ID is required" });
    }

    const allTasks = await Task.find({
      isTrashed: false,
      tenantId,
      ...(isAdmin ? {} : { team: { $all: [userId] } })
    })
      .populate({
        path: "team",
        select: "name role title email",
      })
      .sort({ _id: -1 });

    const users = isAdmin
      ? await User.find({ isActive: true, tenantId })
        .select("name title role isAdmin createdAt")
        .limit(10)
        .sort({ _id: -1 })
      : [];

    const groupTaskks = allTasks.reduce((result, task) => {
      result[task.stage] = (result[task.stage] || 0) + 1;
      return result;
    }, {});

    const totalTasks = allTasks.length;
    const todoTasks = groupTaskks["todo"] || 0;
    const inProgressTasks = groupTaskks["in progress"] || 0;
    const completedTasks = groupTaskks["completed"] || 0;

    const groupData = Object.entries(
      allTasks.reduce((result, task) => {
        result[task.priority] = (result[task.priority] || 0) + 1;
        return result;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    const last10Task = allTasks.slice(0, 10);

    const data = {
      totalTasks,
      last10Task,
      users,
      tasks: groupTaskks,
      graphData: groupData,
    };

    res.status(200).json({
      status: true,
      message: "Successfully retrieved dashboard data",
      ...data,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// Cron Job: Daily WhatsApp Summary at 9.00 AM
const sendDailyDashboardSummary = async () => {
  try {
    const users = await User.find({ isActive: true, phone: { $exists: true, $ne: '' } });

    for (const user of users) {
      const tasks = await Task.find({
        isTrashed: false,
        tenantId: user.tenantId,
        team: { $all: [user._id] },
      });

      const stageCounts = tasks.reduce((acc, task) => {
        acc[task.stage] = (acc[task.stage] || 0) + 1;
        return acc;
      }, {});

      const totalTasks = tasks.length;
      const todo = stageCounts["todo"] || 0;
      const inProgress = stageCounts["in progress"] || 0;
      const completed = stageCounts["completed"] || 0;

      await sendWhatsAppTemplate(
        user.phone,
        'taskgo_76', // Replace with your real QikChat template name
        [
          user.name || 'User',
          `${totalTasks}`,
          `${completed}`,
          `${inProgress}`,
          `${todo}`,
        ]
      );
    }
  } catch (err) {
    console.error("📛 Error sending daily summary:", err.message);
  }
};

// Start cron job on server start
cron.schedule('0 9 * * *', () => {
  console.log("⏰ Running daily WhatsApp dashboard summary...");
  sendDailyDashboardSummary();
});

export const getTasks = async (req, res) => {
  try {
    const { stage, isTrashed } = req.query;
    const { userId, isAdmin, tenantId } = req.user;

    let query = { isTrashed: isTrashed === "true", tenantId }; // Add tenantId to query

    if (!isAdmin) {
      query.team = { $all: [userId] };
    }

    if (stage) {
      if (stage === "overdue") {
        query.date = { $lt: new Date() };
        query.stage = { $in: ["todo", "in progress"] };
      } else {
        query.stage = stage;
      }
    }

    const tasks = await Task.find(query)
      .populate({
        path: "team",
        select: "name title email",
      })
      .sort({ _id: -1 });

    res.status(200).json({ status: true, tasks });
  } catch (error) {
    console.error(error);
    res.status(400).json({ status: false, message: error.message });
  }
};

export const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    // Assuming the tenant ID is available on req.user.tenant. Change this if needed.
    const tenantId = req.user?.tenant || req.tenantId;

    // Find the task by its id and tenant id.
    const task = await Task.findOne({ _id: id, tenant: tenantId })
      .populate({
        path: "team",
        select: "name title role email",
      })
      .populate({
        path: "activities.by",
        select: "name",
      });

    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }

    res.status(200).json({
      status: true,
      task,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const createSubTask = async (req, res) => {
  try {
    const { title, tag, date } = req.body;
    const { id } = req.params;

    // Create new subtask
    const newSubTask = { title, date, tag };

    // Find the parent task
    const task = await Task.findById(id).populate('team', 'email name'); // Populate team field for email addresses

    if (!task) {
      return res
        .status(404)
        .json({ status: false, message: 'Task not found.' });
    }

    // Add the subtask to the task
    task.subTasks.push(newSubTask);
    await task.save();

    // Notify all users in the task's team via email
    const emailPromises = task.team.map((user) => {
      const emailSubject = `More Task Added: ${title}`;
      const emailText = `A new subtask titled "${title}" has been added to the task "${task.title}".`;
      const emailHtml = `
        <p>Hello ${user.name},</p>
        <p>A new subtask titled "<b>${title}</b>" has been added to the task "<b>${task.title}</b>".</p>
        <p>Due Date: ${new Date(date).toLocaleDateString()}</p>
        <p>Tag: ${tag}</p>
        <p>Best Regards,</p>
        <p>Your Task Manager</p>
      `;
      return sendEmail(user.email, emailSubject, emailText, emailHtml);
    });

    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    res.status(200).json({ status: true, message: 'More Task added successfully.' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ status: false, message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, team, stage, priority, assets } = req.body;

    const task = await Task.findById(id);

    task.title = title;
    task.description = description;
    task.date = date;
    task.priority = priority.toLowerCase();
    task.assets = assets;
    task.stage = stage.toLowerCase();
    task.team = team;

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Task Updated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const trashTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    task.isTrashed = true;

    await task.save();

    res.status(200).json({
      status: true,
      message: `Task trashed successfully.`,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const deleteRestoreTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { actionType } = req.query;
    const { tenantId } = req.user;

    if (actionType === "delete") {
      await Task.findOneAndDelete({ _id: id, tenantId });
    } else if (actionType === "deleteAll") {
      await Task.deleteMany({ isTrashed: true, tenantId });
    } else if (actionType === "restore") {
      const resp = await Task.findOne({ _id: id, tenantId });
      if (!resp) return res.status(404).json({ status: false, message: "Task not found" });

      resp.isTrashed = false;
      await resp.save();
    } else if (actionType === "restoreAll") {
      await Task.updateMany({ isTrashed: true, tenantId }, { $set: { isTrashed: false } });
    }

    res.status(200).json({ status: true, message: `Operation performed successfully.` });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};