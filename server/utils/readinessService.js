import Resume from "../models/Resume.js";
import Mock from "../models/Mock.js";
import User from "../models/User.js";
import { calculateReadinessScore } from "./scoreCalculator.js";
import { getCodingSnapshot } from "./dsaAggregator.js";

export const recalculateReadinessForUser = async (userId) => {
  const [resume, mocks, coding] = await Promise.all([
    Resume.findOne({ userId }),
    Mock.find({ userId, evaluated: true }),
    getCodingSnapshot(userId)
  ]);

  const mockAvg = mocks.length
    ? mocks.reduce((sum, m) => sum + (m.overallScore || 0), 0) / mocks.length
    : 0;

  const readiness = calculateReadinessScore(
    coding.aggregateScore || 0,
    resume?.atsScore || 0,
    mockAvg
  );

  await User.findByIdAndUpdate(userId, { readinessScore: readiness });
  return readiness;
};

