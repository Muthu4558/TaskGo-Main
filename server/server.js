import express from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import connectDB from "./config/db.js"; 
import routes from "./routes/index.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api", routes);

// Nodemailer function
const sendEmail = async (to) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Welcome to TaskGo 🚀",
    text: "Thank you for signing up for TaskGo! Get started now and boost your productivity.",
    html: `<p>Thank you for signing up for <b>TaskGo</b>! 🚀</p><p>Click <a href="https://taskgo.in">here</a> to get started.</p>
          <p>Demo Credntials: For Admin & User</p>
          <p>Email:admin1@gmail.com</p>
          <p>Password:12345</p>
          <p>Email:user@gmail.com</p>
          <p>Password:12345</p>
          <p>Login : https://taskgo.in/log-in</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${to}`);
  } catch (error) {
    console.error(`❌ Email sending failed:`, error);
    throw error;
  }
};

// API Route to send email
app.post("/api/send-email", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    await sendEmail(email);
    res.json({ message: "Email sent successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
