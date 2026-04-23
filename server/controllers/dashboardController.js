import User from "../models/User.js";
import Resume from "../models/Resume.js";
import Mock from "../models/Mock.js";
import { getCodingSnapshot } from "../utils/dsaAggregator.js";

export const getDashboard = async (req, res) => {
  const user = await User.findById(req.user._id);
  const coding = await getCodingSnapshot(user._id);
  const resume = await Resume.findOne({ userId: user._id });
  const mocks = await Mock.find({ userId: user._id, evaluated: true });

  const mockAvg = mocks.length
    ? mocks.reduce((sum, m) => sum + m.overallScore, 0) / mocks.length
    : null;

  res.json({
    readinessScore: user.readinessScore,
    atsScore: resume?.atsScore || null,
    mockAverageScore: mockAvg ? Math.floor(mockAvg) : null,
    strongestTopic: coding.strongestTopic,
    weakestTopic: coding.weakestTopic,
    dsaScore: coding.aggregateScore || null,
    platformScores: coding.platformScores,
    totalSolvedAcrossPlatforms: coding.totalSolved
  });
};
