import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  atsScore: Number,
  skills: [String],
  missingSkills: [String],
  suggestions: String
});

export default mongoose.model("Resume", resumeSchema);