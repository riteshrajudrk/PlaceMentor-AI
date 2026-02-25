import mongoose from "mongoose";

const dsaSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    problemName: String,
    topic: String,
    difficulty: String,
  },
  { timestamps: true }
);

export default mongoose.model("DSA", dsaSchema);
