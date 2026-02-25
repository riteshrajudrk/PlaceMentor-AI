import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  targetCompany: String,
  readinessScore: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("User", userSchema);