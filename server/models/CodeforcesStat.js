import mongoose from "mongoose";

const codeforcesSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    handle: String,
    rating: Number,
    maxRating: Number,
    rank: String,
    maxRank: String,
    contribution: Number,
    solvedCount: Number,
    contestsCount: Number,
    topicStats: Object,
    strongestTopic: String,
    weakestTopic: String,
    dsaScore: Number
  },
  { timestamps: true }
);

export default mongoose.model("CodeforcesStat", codeforcesSchema);

