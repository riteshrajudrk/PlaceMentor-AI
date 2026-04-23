import axios from "axios";
import LeetcodeStat from "../models/LeetcodeStat.js";
import { calculateDsaScore } from "../utils/scoreCalculator.js";
import { recalculateReadinessForUser } from "../utils/readinessService.js";

export const syncLeetcode = async (req, res) => {
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

  const stats = response.data.data.matchedUser;
  if (!stats) return res.status(404).json({ message: "User not found" });

  let easy=0, medium=0, hard=0, total=0;

  stats.submitStatsGlobal.acSubmissionNum.forEach(s => {
    if (s.difficulty==="Easy") easy=s.count;
    if (s.difficulty==="Medium") medium=s.count;
    if (s.difficulty==="Hard") hard=s.count;
    if (s.difficulty==="All") total=s.count;
  });

  const dsaScore = calculateDsaScore(easy, medium, hard);

  const topicStats = {};
  ["fundamental","intermediate","advanced"].forEach(cat=>{
    stats.tagProblemCounts[cat].forEach(t=>{
      if (t.problemsSolved>0) topicStats[t.tagName]=t.problemsSolved;
    });
  });

  const strongestTopic = Object.keys(topicStats).length
    ? Object.keys(topicStats).reduce((a,b)=>topicStats[a]>topicStats[b]?a:b)
    : "None";

  const weakestTopic = Object.keys(topicStats).length
    ? Object.keys(topicStats).reduce((a,b)=>topicStats[a]<topicStats[b]?a:b)
    : "None";

  await LeetcodeStat.findOneAndUpdate(
    { userId:req.user._id },
    {
      userId:req.user._id,
      username,
      totalSolved:total,
      easySolved:easy,
      mediumSolved:medium,
      hardSolved:hard,
      ranking:stats.profile.ranking,
      contributionPoints:stats.profile.reputation,
      dsaScore,
      topicStats,
      strongestTopic,
      weakestTopic
    },
    { upsert: true, returnDocument: "after" }
  );
  await recalculateReadinessForUser(req.user._id);

  res.json(await LeetcodeStat.findOne({ userId:req.user._id }));
};

export const getLeetcodeStats = async (req, res) => {
  try {
    const stats = await LeetcodeStat.findOne({
      userId: req.user._id
    });

    if (!stats) {
      return res.json(null);
    }

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};
