import mongoose from "mongoose";

const signupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    company: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    userCount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Signup", signupSchema);
