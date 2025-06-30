import User from "../models/user.js";
import Task from "../models/task.js";
import { createJWT } from "../config/db.js";
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const QIKCHAT_API_KEY = process.env.QIKCHAT_API_KEY;
const QIKCHAT_API_URL = process.env.QIKCHAT_API_URL;

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
          parameters: parameters.map(param => ({
            type: 'text',
            text: param,
          })),
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
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
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
    console.log(`📧 Email sent to: ${to}`);
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error);
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, companyName, email, password, isAdmin, role, title, userLimit, phone } = req.body;

    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).json({ status: false, message: "User already exists" });

    const phoneExist = await User.findOne({ phone });
    if (phoneExist) return res.status(400).json({ status: false, message: "Phone number is already used by another user." });

    if (!req.user) return res.status(401).json({ status: false, message: "Unauthorized request" });

    let tenantId = req.user.tenantId;

    if (req.user.isSuperAdmin && isAdmin) {
      tenantId = uuidv4();
    }

    if (req.user.isAdmin && !req.user.isSuperAdmin && !isAdmin) {
      const adminUser = await User.findById(req.user.userId);
      if (!adminUser) return res.status(400).json({ status: false, message: "Admin user not found." });

      const currentUserCount = await User.countDocuments({ tenantId: adminUser.tenantId, isAdmin: false });
      if (currentUserCount >= adminUser.userLimit) {
        return res.status(400).json({ status: false, message: "User creation limit reached for this admin." });
      }
    }

    const newUserData = {
      name,
      email,
      password,
      companyName,
      isAdmin: !!isAdmin,
      isSuperAdmin: false,
      role,
      title,
      tenantId,
      phone,
    };

    if (isAdmin) {
      newUserData.userLimit = userLimit;
    }

    const user = await User.create(newUserData);
    if (!user) return res.status(400).json({ status: false, message: "Invalid user data" });

    const emailContent = `
      <h3>Welcome ${name},</h3>
      <p>Your Nizcare Task Management account has been successfully created.</p>
      <p><strong>Login Credentials:</strong></p>
      <p>Email: <strong>${email}</strong></p>
      <p>Password: <strong>${password}</strong></p>
      <p><a href="https://taskgo.in/">Login here</a></p>
    `;

    await sendEmail(
      user.email,
      "Welcome to Nizcare Task Management",
      `Your account has been created. Email: ${email}, Password: ${password}`,
      emailContent
    );

    await sendWhatsAppTemplate(
      phone,
      'taskgo_test5',
      [name, email, password, 'https://taskgo.in/']
    );

    return res.status(201).json({ status: true, message: "User created successfully", user });
  } catch (error) {
    console.error("❌ Error in registerUser:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ status: false, message: "Invalid email or password." });
    if (!user.isActive) return res.status(401).json({ status: false, message: "User account has been deactivated, contact admin" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ status: false, message: "Invalid email or password" });

    createJWT(res, user._id);
    user.password = undefined;

    const emailContent = `
      <h3>Hello ${user.name},</h3>
      <p>You have successfully logged into Nizcare Task Management.</p>
      <p>If this was not you, please reset your password immediately.</p>
    `;

    await sendEmail(user.email, "Login Notification", "Successful Login", emailContent);

    // ✅ Optional: Only send login WhatsApp if template exists with only 1 parameter
    // await sendWhatsAppTemplate(
    //   user.phone,
    //   'user_login_notification',
    //   [user.name]
    // );

    return res.status(200).json(user);
  } catch (error) {
    console.log("🔥 Error in loginUser:", error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.cookie("token", "", {
      htttpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getUserTasks = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1) Ensure user is in the same tenant (unless super admin)
    const user = await User.findOne({
      _id: userId,
      ...(req.user.isSuperAdmin ? {} : { tenantId: req.user.tenantId }),
    });
    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "User not found or not in your tenant" });
    }

    // 2) Find tasks for that user, filtered by tenant
    const taskQuery = {
      team: { $in: [userId] },
      isTrashed: false,
      ...(req.user.isSuperAdmin ? {} : { tenantId: req.user.tenantId }),
    };

    const tasks = await Task.find(taskQuery)
      .populate({
        path: "team",
        select: "name title email",
      })
      .populate({
        path: "activities.by",
        select: "name",
      })
      .sort({ _id: -1 });

    if (!tasks.length) {
      return res
        .status(404)
        .json({ status: false, message: "No tasks found for this user" });
    }

    return res.status(200).json({
      status: true,
      tasks,
    });
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params; // Extract userId from params

    // Fetch user details
    const user = await User.findById(userId).select("name title role email");

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Fetch tasks assigned to the user
    const tasks = await Task.find({ team: userId, isTrashed: false })
      .populate("team", "name role title email")
      .sort({ _id: -1 });

    // Send response with user details and tasks
    res.status(200).json({
      status: true,
      user,
      tasks,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(400).json({ status: false, message: error.message });
  }
};

export const getTeamList = async (req, res) => {
  try {
    // If super admin => get all users
    // If normal admin => only your tenant
    let query = {};
    if (!req.user.isSuperAdmin) {
      query.tenantId = req.user.tenantId;
    }

    const users = await User.find(query).select(
      "name title role email phone isActive tenantId"
    );

    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;
    const { _id } = req.body;

    const id =
      isAdmin && userId === _id
        ? userId
        : isAdmin && userId !== _id
          ? _id
          : userId;

    const user = await User.findById(id);

    if (user) {
      user.name = req.body.name || user.name;
      user.title = req.body.title || user.title;
      user.role = req.body.role || user.role;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.password = req.body.password || user.password;
      user.userLimit = req.body.userLimit || user.userLimit;
      user.companyName = req.body.companyName || user.companyName;

      const updatedUser = await user.save();

      user.password = undefined;

      res.status(201).json({
        status: true,
        message: "Profile Updated Successfully.",
        user: updatedUser,
      });
    } else {
      res.status(404).json({ status: false, message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId);

    if (user) {
      user.password = req.body.password;

      await user.save();

      user.password = undefined;

      res.status(201).json({
        status: true,
        message: `Password chnaged successfully.`,
      });
    } else {
      res.status(404).json({ status: false, message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const activateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (user) {
      const previousStatus = user.isActive;
      user.isActive = req.body.isActive;

      await user.save();

      // Send email notification to the user
      const subject = user.isActive ? "Account Activated" : "Account Disabled";
      const emailContent = `
        <h3>Hello ${user.name},</h3>
        <p>Your account has been ${user.isActive ? "activated" : "disabled"
        } by the administrator.</p>
        <p>${user.isActive ? "You can now log in and use the platform." : "If you think this was a mistake, please contact support."}</p>
        <p>Thank you!</p>
      `;
      await sendEmail(
        user.email,
        subject,
        `Your account has been ${user.isActive ? "activated" : "disabled"}`,
        emailContent
      );

      res.status(201).json({
        status: true,
        message: `User account has been ${user.isActive ? "activated" : "disabled"
          }`,
      });
    } else {
      res.status(404).json({ status: false, message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const deleteUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    res
      .status(200)
      .json({ status: true, message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getAdmin = async (req, res) => {
  try {
    // If Super Admin => get all admins
    // If normal Admin => get only admins under their tenant
    let query = { isAdmin: true }; // Ensure only admins are fetched

    if (!req.user.isSuperAdmin) {
      query.tenantId = req.user.tenantId;
    }

    const admins = await User.find(query).select(
      "name title role email isActive tenantId userLimit companyName"
    );

    return res.status(200).json(admins);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};