import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import API from "../services/api";
import { Search, TrendingUp, TrendingDown, Code2 } from "lucide-react";
import { motion } from "framer-motion";

export default function DSATracker() {
  const [username, setUsername] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await API.get("/leetcode");
      setStats(res.data || null);
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  };

  const handleSync = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post(`/leetcode/${username}`);
      setStats(res.data);
      setUsername("");
    } catch (err) {
      setError("Failed to sync LeetCode profile");
    }

    setLoading(false);
  };

  const getColor = (score) => {
    if (score >= 75) return "#10B981";
    if (score >= 50) return "#F59E0B";
    return "#EF4444";
  };

  const topTopics =
    stats?.topicStats &&
    Object.entries(stats.topicStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Code2 className="text-[#3B82F6]" size={36} />
            DSA Tracker
          </h1>
          <p className="text-gray-400 mt-2">
            Track your LeetCode performance & mastery
          </p>
        </div>

        {/* Sync Card */}
        <GlassCard hover={false}>
          <h3 className="text-lg font-bold mb-4">
            Sync LeetCode Profile
          </h3>

          <form onSubmit={handleSync} className="flex gap-3">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your LeetCode username"
              className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#3B82F6] hover:bg-[#2563EB] px-6 py-3 rounded-full flex items-center gap-2 font-semibold"
            >
              {loading ? (
                <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
              ) : (
                <>
                  <Search size={18} />
                  Sync
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
        </GlassCard>

        {/* Stats */}
        {stats && (
          <>
            {/* Overview */}
            <div className="grid md:grid-cols-4 gap-6">
              <GlassCard hover={false}>
                <p className="text-sm text-gray-400 mb-2">DSA Score</p>
                <p
                  className="text-4xl font-bold"
                  style={{ color: getColor(stats.dsaScore) }}
                >
                  {stats.dsaScore}
                </p>
              </GlassCard>

              <GlassCard hover={false}>
                <p className="text-sm text-gray-400 mb-2">
                  Total Solved
                </p>
                <p className="text-4xl font-bold text-[#3B82F6]">
                  {stats.totalSolved}
                </p>
              </GlassCard>

              <GlassCard hover={false}>
                <p className="text-sm text-gray-400 mb-2">Ranking</p>
                <p className="text-4xl font-bold text-[#8B5CF6]">
                  {stats.ranking?.toLocaleString()}
                </p>
              </GlassCard>

              <GlassCard hover={false}>
                <p className="text-sm text-gray-400 mb-2">
                  Contribution
                </p>
                <p className="text-4xl font-bold text-[#06B6D4]">
                  {stats.contributionPoints}
                </p>
              </GlassCard>
            </div>

            {/* Difficulty Breakdown */}
            <GlassCard hover={false}>
              <h3 className="text-xl font-bold mb-6">
                Problems by Difficulty
              </h3>

              {["easy", "medium", "hard"].map((type) => {
                const value =
                  type === "easy"
                    ? stats.easySolved
                    : type === "medium"
                    ? stats.mediumSolved
                    : stats.hardSolved;

                const color =
                  type === "easy"
                    ? "#10B981"
                    : type === "medium"
                    ? "#F59E0B"
                    : "#EF4444";

                return (
                  <div key={type} className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400 capitalize">
                        {type}
                      </span>
                      <span
                        className="font-bold"
                        style={{ color }}
                      >
                        {value}
                      </span>
                    </div>

                    <div className="h-2 bg-white/5 rounded-full">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${
                            (value / stats.totalSolved) * 100
                          }%`,
                          background: color
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </GlassCard>

            {/* Strongest & Weakest */}
            <div className="grid md:grid-cols-2 gap-6">
              <GlassCard hover={false}>
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp
                    className="text-green-400"
                    size={24}
                  />
                  <h3 className="text-xl font-bold">
                    Strongest Topic
                  </h3>
                </div>
                <p className="text-3xl font-mono text-green-400 font-bold">
                  {stats.strongestTopic}
                </p>
              </GlassCard>

              <GlassCard hover={false}>
                <div className="flex items-center gap-3 mb-4">
                  <TrendingDown
                    className="text-red-400"
                    size={24}
                  />
                  <h3 className="text-xl font-bold">
                    Weakest Topic
                  </h3>
                </div>
                <p className="text-3xl font-mono text-red-400 font-bold">
                  {stats.weakestTopic}
                </p>
              </GlassCard>
            </div>

            {/* Top Topics */}
            {topTopics && (
              <GlassCard hover={false}>
                <h3 className="text-xl font-bold mb-6">
                  Top 10 Topics
                </h3>

                {topTopics.map(([topic, count], index) => (
                  <motion.div
                    key={topic}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="mb-4"
                  >
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-300 font-mono text-sm">
                        {topic}
                      </span>
                      <span className="text-[#3B82F6] font-bold">
                        {count}
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full">
                      <div
                        className="h-2 bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] rounded-full"
                        style={{
                          width: `${
                            (count / topTopics[0][1]) * 100
                          }%`
                        }}
                      ></div>
                    </div>
                  </motion.div>
                ))}
              </GlassCard>
            )}
          </>
        )}

        {!stats && !loading && (
          <GlassCard hover={false}>
            <div className="text-center py-12">
              <Code2 className="mx-auto text-gray-600 mb-4" size={64} />
              <p className="text-xl text-gray-400">
                No LeetCode stats found
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Enter your username above to sync profile
              </p>
            </div>
          </GlassCard>
        )}
      </div>
    </Layout>
  );
}
