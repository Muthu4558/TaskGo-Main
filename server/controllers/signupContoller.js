import User from "../models/signup.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "taskmanager@mamce.org",
        pass: "fchs ppue ehkq lfzi",
    },
});

const sendMail = async (to, subject, htmlContent) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: htmlContent,
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

export const signupUser = async (req, res) => {
    try {
        const { name, company, email, userCount } = req.body;

        if (!name || !company || !email || !userCount) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the email already exists in the database
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "Email already exists! Please use another email." });
        }

        // Store in database
        const newUser = new User({ name, company, email, userCount });
        await newUser.save();

        // Email content
        const userMessage = `
            <h3>Welcome to TaskGo!</h3>
            <p>Your Admin credentials will be sent to you within 1 hour.</p>
            <p>Thank you for registering!</p>
        `;

        const adminMessage = `
            <h3>New Signup Received</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Company:</strong> ${company}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>User Count:</strong> ${userCount}</p>
        `;

        // Send email to user
        await sendMail(email, "TaskGo Signup - Credentials Incoming", userMessage);

        // Send email to admin
        await sendMail(process.env.EMAIL_USER, "New TaskGo Signup", adminMessage);

        res.status(201).json({ message: "Signup successful. Check your email!" });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
