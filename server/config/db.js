
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const connectDB = async () => {

  try {
    const con = await mongoose.connect(process.env.MONGO_URI)
    console.log("DB Connected");
  } catch (err) {
    console.log(`Error - ${err}`);
    process.exit(1);
  }

}

export default connectDB;

export const createJWT = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Increased token expiration to 7 days
  });

  // Set cookie with matching expiration
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};