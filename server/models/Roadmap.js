import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    goal: { type: String, required: true },
    focusArea: String,
    timelineWeeks: Number,
    hoursPerDay: Number,
    result: Object
  },
  { timestamps: true }
);

export default mongoose.model("Roadmap", roadmapSchema);

