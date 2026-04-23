import axios from "axios";
import LeetcodeStat from "../models/LeetcodeStat.js";
import CodeforcesStat from "../models/CodeforcesStat.js";
import { calculateDsaScore } from "../utils/scoreCalculator.js";
import { getCodingSnapshot } from "../utils/dsaAggregator.js";
import { recalculateReadinessForUser } from "../utils/readinessService.js";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const normalizeHandle = (raw = "") => {
  const trimmed = String(raw).trim();
  const withoutPrefix = trimmed.replace(/^@/, "");
  const match = withoutPrefix.match(/codeforces\.com\/profile\/([^/?#]+)/i);
  return (match?.[1] || withoutPrefix).trim();
};

const parseLeetcodeStats = (stats) => {
  let easy = 0;
  let medium = 0;
  let hard = 0;
  let total = 0;

  stats.submitStatsGlobal.acSubmissionNum.forEach((s) => {
    if (s.difficulty === "Easy") easy = s.count;
    if (s.difficulty === "Medium") medium = s.count;
    if (s.difficulty === "Hard") hard = s.count;
    if (s.difficulty === "All") total = s.count;
  });

  const topicStats = {};
  ["fundamental", "intermediate", "advanced"].forEach((cat) => {
    stats.tagProblemCounts[cat].forEach((t) => {
      if (t.problemsSolved > 0) topicStats[t.tagName] = t.problemsSolved;
    });
  });

  const strongestTopic = Object.keys(topicStats).length
    ? Object.keys(topicStats).reduce((a, b) => (topicStats[a] > topicStats[b] ? a : b))
    : "None";
  const weakestTopic = Object.keys(topicStats).length
    ? Object.keys(topicStats).reduce((a, b) => (topicStats[a] < topicStats[b] ? a : b))
    : "None";

  return {
    easy,
    medium,
    hard,
    total,
    topicStats,
    strongestTopic,
    weakestTopic
  };
};

export const syncLeetcodeProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        profile { ranking reputation }
        submitStatsGlobal { acSubmissionNum { difficulty count } }
        tagProblemCounts {
          fundamental { tagName problemsSolved }
          intermediate { tagName problemsSolved }
          advanced { tagName problemsSolved }
        }
      }
    }`;

    const response = await axios.post("https://leetcode.com/graphql", {
      query,
      variables: { username }
    });

    const stats = response.data?.data?.matchedUser;
    if (!stats) return res.status(404).json({ message: "LeetCode user not found" });

    const parsed = parseLeetcodeStats(stats);
    const dsaScore = calculateDsaScore(parsed.easy, parsed.medium, parsed.hard);

    await LeetcodeStat.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        username,
        totalSolved: parsed.total,
        easySolved: parsed.easy,
        mediumSolved: parsed.medium,
        hardSolved: parsed.hard,
        ranking: stats.profile?.ranking,
        contributionPoints: stats.profile?.reputation,
        dsaScore,
        topicStats: parsed.topicStats,
        strongestTopic: parsed.strongestTopic,
        weakestTopic: parsed.weakestTopic
      },
      { upsert: true, returnDocument: "after" }
    );

    await recalculateReadinessForUser(req.user._id);
    const snapshot = await getCodingSnapshot(req.user._id);
    return res.json(snapshot);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to sync LeetCode profile" });
  }
};

export const syncCodeforcesProfile = async (req, res) => {
  try {
    const handle = normalizeHandle(req.params.handle);
    if (!handle) {
      return res.status(400).json({ message: "Codeforces handle is required" });
    }
    const [infoRes, statusRes] = await Promise.all([
      axios.get("https://codeforces.com/api/user.info", { params: { handles: handle } }),
      axios.get("https://codeforces.com/api/user.status", { params: { handle, from: 1, count: 1000 } })
    ]);

    if (infoRes.data?.status !== "OK") {
      return res.status(404).json({
        message: infoRes.data?.comment || "Codeforces user not found"
      });
    }

    const info = infoRes.data?.result?.[0];
    if (!info) return res.status(404).json({ message: "Codeforces user not found" });

    const submissions = statusRes.data?.status === "OK" ? statusRes.data?.result || [] : [];
    const accepted = submissions.filter((s) => s.verdict === "OK");
    const uniqueSolved = new Set(
      accepted.map((s) => `${s.problem?.contestId || 0}-${s.problem?.index || ""}`)
    );

    const topicStats = {};
    accepted.forEach((s) => {
      (s.problem?.tags || []).forEach((tag) => {
        topicStats[tag] = (topicStats[tag] || 0) + 1;
      });
    });

    const strongestTopic = Object.keys(topicStats).length
      ? Object.keys(topicStats).reduce((a, b) => (topicStats[a] > topicStats[b] ? a : b))
      : "None";
    const weakestTopic = Object.keys(topicStats).length
      ? Object.keys(topicStats).reduce((a, b) => (topicStats[a] < topicStats[b] ? a : b))
      : "None";

    const rating = info.rating || 0;
    const ratingScore = clamp(((rating - 800) / 2200) * 100, 0, 100);
    const solvedScore = clamp((uniqueSolved.size / 400) * 100, 0, 100);
    const activityScore = clamp(((info.maxRating || rating || 0) / 3000) * 100, 0, 100);
    const dsaScore = Number((ratingScore * 0.5 + solvedScore * 0.3 + activityScore * 0.2).toFixed(2));

    await CodeforcesStat.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        handle,
        rating: info.rating || null,
        maxRating: info.maxRating || null,
        rank: info.rank || null,
        maxRank: info.maxRank || null,
        contribution: info.contribution || 0,
        solvedCount: uniqueSolved.size,
        contestsCount: info.friendOfCount || 0,
        topicStats,
        strongestTopic,
        weakestTopic,
        dsaScore
      },
      { upsert: true, returnDocument: "after" }
    );

    await recalculateReadinessForUser(req.user._id);
    const snapshot = await getCodingSnapshot(req.user._id);
    return res.json(snapshot);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err?.response?.data?.comment || "Failed to sync Codeforces profile"
    });
  }
};

export const getCodingStats = async (req, res) => {
  try {
    const snapshot = await getCodingSnapshot(req.user._id);
    return res.json(snapshot);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch coding stats" });
  }
};
