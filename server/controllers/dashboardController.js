import User from "../models/User.js";
import LeetcodeStat from "../models/LeetcodeStat.js";
import Resume from "../models/Resume.js";
import Mock from "../models/Mock.js";

export const getDashboard = async (req, res) => {
  const user = await User.findById(req.user._id);
  const leetcode = await LeetcodeStat.findOne({ userId: user._id });
  const resume = await Resume.findOne({ userId: user._id });
  const mocks = await Mock.find({ userId: user._id, evaluated: true });

  const mockAvg = mocks.length
    ? mocks.reduce((sum, m) => sum + m.overallScore, 0) / mocks.length
    : null;

  res.json({
    readinessScore: user.readinessScore,
    atsScore: resume?.atsScore || null,
    mockAverageScore: mockAvg ? Math.floor(mockAvg) : null,
    strongestTopic: leetcode?.strongestTopic || null,
    weakestTopic: leetcode?.weakestTopic || null,
    dsaScore: leetcode?.dsaScore || null
  });
};