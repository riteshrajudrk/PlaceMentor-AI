import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import API from "../services/api";
import { Search, Code2, Trophy, Gauge } from "lucide-react";

const scoreColor = (score = 0) => {
  if (score >= 75) return "#10B981";
  if (score >= 50) return "#F59E0B";
  return "#EF4444";
};

const PlatformCard = ({ title, score, subtitle, meta }) => (
  <GlassCard hover={false}>
    <div className="flex items-center justify-between mb-3">
      <p className="text-gray-300 font-semibold">{title}</p>
      <p className="text-2xl font-bold" style={{ color: scoreColor(score || 0) }}>
        {typeof score === "number" ? score.toFixed(1) : "N/A"}
      </p>
    </div>
    <p className="text-xs text-gray-500 mb-3">{subtitle}</p>
    <div className="text-sm text-gray-400 space-y-1">
      {meta.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  </GlassCard>
);

export default function DSATracker() {
  const [coding, setCoding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncingLeet, setSyncingLeet] = useState(false);
  const [syncingCf, setSyncingCf] = useState(false);
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [codeforcesHandle, setCodeforcesHandle] = useState("");
  const [error, setError] = useState("");

  const loadCodingStats = async () => {
    try {
      const { data } = await API.get("/coding");
      setCoding(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load coding stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCodingStats();
  }, []);

  const syncLeetcode = async (e) => {
    e.preventDefault();
    setError("");
    setSyncingLeet(true);
    try {
      const username = encodeURIComponent(leetcodeUsername.trim());
      const { data } = await API.post(`/coding/leetcode/${username}`);
      setCoding(data);
      setLeetcodeUsername("");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to sync LeetCode profile. Check username and try again.");
    } finally {
      setSyncingLeet(false);
    }
  };

  const syncCodeforces = async (e) => {
    e.preventDefault();
    setError("");
    setSyncingCf(true);
    try {
      const handle = encodeURIComponent(codeforcesHandle.trim());
      const { data } = await API.post(`/coding/codeforces/${handle}`);
      setCoding(data);
      setCodeforcesHandle("");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to sync Codeforces profile. Check handle and try again.");
    } finally {
      setSyncingCf(false);
    }
  };

  const lc = coding?.platforms?.leetcode;
  const cf = coding?.platforms?.codeforces;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Code2 className="text-[#3B82F6]" size={36} />
            Multi-Platform DSA Hub
          </h1>
          <p className="text-gray-400 mt-2">
            Sync LeetCode and Codeforces to power a unified readiness score.
          </p>
        </div>

        <GlassCard hover={false}>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                <Gauge size={14} /> Aggregate DSA Score
              </p>
              <p className="text-4xl font-bold" style={{ color: scoreColor(coding?.aggregateScore || 0) }}>
                {(coding?.aggregateScore || 0).toFixed(1)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                <Trophy size={14} /> Total Solved
              </p>
              <p className="text-4xl font-bold text-[#3B82F6]">{coding?.totalSolved || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-gray-500 mb-2">Focus Signal</p>
              <p className="text-sm text-gray-300">Strongest: {coding?.strongestTopic || "N/A"}</p>
              <p className="text-sm text-gray-300">Weakest: {coding?.weakestTopic || "N/A"}</p>
            </div>
          </div>
        </GlassCard>

        <div className="grid lg:grid-cols-2 gap-6">
          <GlassCard hover={false}>
            <h3 className="text-lg font-bold mb-4">Sync LeetCode</h3>
            <form onSubmit={syncLeetcode} className="flex gap-3">
              <input
                type="text"
                required
                value={leetcodeUsername}
                onChange={(e) => setLeetcodeUsername(e.target.value)}
                placeholder="LeetCode username"
                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
              />
              <button
                type="submit"
                disabled={syncingLeet}
                className="bg-[#3B82F6] hover:bg-[#2563EB] px-5 py-3 rounded-full flex items-center gap-2 font-semibold"
              >
                <Search size={18} />
                {syncingLeet ? "Syncing..." : "Sync"}
              </button>
            </form>
          </GlassCard>

          <GlassCard hover={false}>
            <h3 className="text-lg font-bold mb-4">Sync Codeforces</h3>
            <form onSubmit={syncCodeforces} className="flex gap-3">
              <input
                type="text"
                required
                value={codeforcesHandle}
                onChange={(e) => setCodeforcesHandle(e.target.value)}
                placeholder="Codeforces handle"
                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
              />
              <button
                type="submit"
                disabled={syncingCf}
                className="bg-cyan-600 hover:bg-cyan-500 px-5 py-3 rounded-full flex items-center gap-2 font-semibold"
              >
                <Search size={18} />
                {syncingCf ? "Syncing..." : "Sync"}
              </button>
            </form>
          </GlassCard>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {!loading && (
          <div className="grid md:grid-cols-2 gap-6">
            <PlatformCard
              title="LeetCode"
              score={lc?.dsaScore}
              subtitle="Problem-solving depth and topic consistency."
              meta={[
                `Solved: ${lc?.totalSolved ?? 0}`,
                `Easy/Medium/Hard: ${lc?.easySolved ?? 0}/${lc?.mediumSolved ?? 0}/${lc?.hardSolved ?? 0}`,
                `Ranking: ${lc?.ranking ? lc.ranking.toLocaleString() : "N/A"}`
              ]}
            />

            <PlatformCard
              title="Codeforces"
              score={cf?.dsaScore}
              subtitle="Contest performance and accepted problem quality."
              meta={[
                `Solved: ${cf?.solvedCount ?? 0}`,
                `Rating: ${cf?.rating ?? "N/A"} (max ${cf?.maxRating ?? "N/A"})`,
                `Rank: ${cf?.rank || "N/A"}`
              ]}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
