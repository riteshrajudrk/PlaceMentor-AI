import mongoose from "mongoose";

const mockSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subject: String,
  difficulty: String,
  question: String,
  answer: String,
  evaluated: { type: Boolean, default: false },
  overallScore: Number,
  technicalAccuracy: Number,
  conceptClarity: Number,
  depth: Number,
  communication: Number,
  strengths: String,
  weaknesses: String,
  improvements: String
}, { timestamps: true });

export default mongoose.model("Mock", mockSchema);