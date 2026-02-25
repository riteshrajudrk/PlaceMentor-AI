import mongoose from "mongoose";

const leetcodeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  username: String,
  totalSolved: Number,
  easySolved: Number,
  mediumSolved: Number,
  hardSolved: Number,
  ranking: Number,
  contributionPoints: Number,
  dsaScore: Number,
  topicStats: Object,
  strongestTopic: String,
  weakestTopic: String
});

export default mongoose.model("LeetcodeStat", leetcodeSchema);