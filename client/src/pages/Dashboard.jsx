import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import ScoreCircle from "../components/ScoreCircle";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { Brain, Target, Award, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await API.get("/dashboard");
      setDashboard(res.data);
      updateUser({ readinessScore: res.data.readinessScore });
    } catch (err) {
      console.error("Dashboard load error", err);
    } finally {
      setLoading(false);
    }
  };

  const getColor = (score) => {
    if (!score) return "#6B7280";
    if (score >= 75) return "#10B981";
    if (score >= 50) return "#F59E0B";
    return "#EF4444";
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#3B82F6] rounded-full"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">
            Welcome back,{" "}
            <span className="text-[#3B82F6]">{user?.name}</span>
          </h1>
          <p className="text-gray-400 mt-2">
            Track your placement readiness journey
          </p>
        </div>

        {/* Readiness Hero */}
        <GlassCard className="flex flex-col items-center py-12" hover={false}>
          <h2 className="text-2xl font-bold mb-8">
            Overall Placement Readiness
          </h2>

          <ScoreCircle
            score={dashboard?.readinessScore || 0}
            label="Readiness"
          />

          <p className="text-gray-400 mt-6 max-w-md text-center">
            Your readiness score combines DSA (40%), Resume (30%), and
            Mock Interview (30%)
          </p>
        </GlassCard>

        {/* Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* DSA */}
          <GlassCard hover={false}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-[#3B82F6]/10 rounded-xl">
                <Brain className="text-[#3B82F6]" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">DSA Score</p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: getColor(dashboard?.dsaScore) }}
                >
                  {dashboard?.dsaScore ?? "N/A"}
                </p>
              </div>
            </div>

            {dashboard?.strongestTopic && (
              <div className="text-sm text-gray-400 space-y-1">
                <p>
                  Strongest:{" "}
                  <span className="text-green-400 font-mono">
                    {dashboard.strongestTopic}
                  </span>
                </p>
                <p>
                  Weakest:{" "}
                  <span className="text-red-400 font-mono">
                    {dashboard.weakestTopic}
                  </span>
                </p>
              </div>
            )}
          </GlassCard>

          {/* ATS */}
          <GlassCard hover={false}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-[#8B5CF6]/10 rounded-xl">
                <Target className="text-[#8B5CF6]" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">ATS Score</p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: getColor(dashboard?.atsScore) }}
                >
                  {dashboard?.atsScore ?? "N/A"}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {dashboard?.atsScore
                ? "Resume analyzed successfully"
                : "Upload your resume to see score"}
            </p>
          </GlassCard>

          {/* Mock */}
          <GlassCard hover={false}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-[#06B6D4]/10 rounded-xl">
                <Award className="text-[#06B6D4]" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  Mock Interview Avg
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: getColor(dashboard?.mockAverageScore) }}
                >
                  {dashboard?.mockAverageScore ?? "N/A"}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {dashboard?.mockAverageScore
                ? "Keep practicing!"
                : "Start mock interviews"}
            </p>
          </GlassCard>
        </div>

        {/* Next Steps */}
        <GlassCard hover={false}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="text-[#3B82F6]" size={24} />
            Next Steps to Improve
          </h3>

          <div className="grid md:grid-cols-2 gap-4">

            {!dashboard?.dsaScore && (
              <div className="p-4 bg-[#3B82F6]/5 border border-[#3B82F6]/20 rounded-xl">
                <p className="font-semibold text-white">
                  Sync LeetCode Stats
                </p>
                <p className="text-sm text-gray-400">
                  Connect your LeetCode profile to track DSA progress
                </p>
              </div>
            )}

            {!dashboard?.atsScore && (
              <div className="p-4 bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 rounded-xl">
                <p className="font-semibold text-white">
                  Upload Resume
                </p>
                <p className="text-sm text-gray-400">
                  Get AI-powered ATS analysis
                </p>
              </div>
            )}

            {!dashboard?.mockAverageScore && (
              <div className="p-4 bg-[#06B6D4]/5 border border-[#06B6D4]/20 rounded-xl">
                <p className="font-semibold text-white">
                  Take Mock Interview
                </p>
                <p className="text-sm text-gray-400">
                  Practice with AI questions
                </p>
              </div>
            )}

            {dashboard?.dsaScore &&
              dashboard?.atsScore &&
              dashboard?.mockAverageScore && (
                <div className="col-span-2 p-4 bg-green-500/5 border border-green-500/20 rounded-xl text-center">
                  <p className="font-semibold text-white">
                    🎉 Excellent Work!
                  </p>
                  <p className="text-sm text-gray-400">
                    Keep improving your scores further.
                  </p>
                </div>
              )}
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
}
