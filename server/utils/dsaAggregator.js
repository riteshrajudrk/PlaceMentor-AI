import LeetcodeStat from "../models/LeetcodeStat.js";
import CodeforcesStat from "../models/CodeforcesStat.js";

const platformWeights = {
  leetcode: 0.6,
  codeforces: 0.4
};

const weightedAverage = (entries) => {
  if (!entries.length) return 0;
  const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
  if (!totalWeight) return 0;
  const score = entries.reduce((sum, e) => sum + e.score * e.weight, 0) / totalWeight;
  return Number(score.toFixed(2));
};

export const getCodingSnapshot = async (userId) => {
  const [leetcode, codeforces] = await Promise.all([
    LeetcodeStat.findOne({ userId }),
    CodeforcesStat.findOne({ userId })
  ]);

  const platformScores = {
    leetcode: leetcode?.dsaScore ?? null,
    codeforces: codeforces?.dsaScore ?? null
  };

  const activePlatforms = Object.entries(platformScores)
    .filter(([, score]) => typeof score === "number")
    .map(([name, score]) => ({
      name,
      score,
      weight: platformWeights[name] || 0
    }));

  const aggregateScore = weightedAverage(activePlatforms);
  const totalSolved = (leetcode?.totalSolved || 0) + (codeforces?.solvedCount || 0);

  return {
    aggregateScore,
    totalSolved,
    strongestTopic: leetcode?.strongestTopic || codeforces?.strongestTopic || null,
    weakestTopic: leetcode?.weakestTopic || codeforces?.weakestTopic || null,
    platforms: {
      leetcode,
      codeforces
    },
    platformScores
  };
};

