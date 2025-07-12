import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  expireAt: { type: Date, required: true },
});

const OTPStore = mongoose.model("OTPStore", otpSchema);
export default OTPStore;
