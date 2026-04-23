import { useState } from "react";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import API from "../services/api";
import { Sparkles, Flag, Calendar, Clock3 } from "lucide-react";

export default function Roadmap() {
  const [goal, setGoal] = useState("");
  const [focusArea, setFocusArea] = useState("DSA + Interview Prep");
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [timelineWeeks, setTimelineWeeks] = useState(8);
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState("");

  const generateRoadmap = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await API.post("/roadmap/generate", {
        goal,
        focusArea,
        hoursPerDay,
        timelineWeeks
      });
      setRoadmap(data);
    } catch {
      setError("Failed to generate roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Sparkles className="text-cyan-400" size={36} />
            AI Career Roadmap
          </h1>
          <p className="text-gray-400 mt-2">
            Enter your target role, company, or exam and get a personalized execution plan.
          </p>
        </div>

        <GlassCard hover={false}>
          <form onSubmit={generateRoadmap} className="space-y-4">
            <textarea
              required
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Example: I want to crack Google SWE internship in 4 months and improve DSA + system design."
              className="w-full h-28 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none resize-none"
            />

            <div className="grid md:grid-cols-3 gap-4">
              <input
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                placeholder="Focus area"
              />
              <input
                type="number"
                min="1"
                max="12"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                placeholder="Hours/day"
              />
              <input
                type="number"
                min="2"
                max="52"
                value={timelineWeeks}
                onChange={(e) => setTimelineWeeks(Number(e.target.value))}
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                placeholder="Timeline (weeks)"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-500 px-6 py-3 rounded-full font-semibold"
            >
              {loading ? "Generating..." : "Generate Roadmap"}
            </button>
          </form>
        </GlassCard>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {roadmap && (
          <>
            <GlassCard hover={false}>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                    <Flag size={14} /> Goal
                  </p>
                  <p className="text-sm text-gray-200">{roadmap.title}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                    <Calendar size={14} /> Duration
                  </p>
                  <p className="text-sm text-gray-200">{roadmap.durationWeeks} weeks</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                    <Clock3 size={14} /> Outcome
                  </p>
                  <p className="text-sm text-gray-200">{roadmap.outcome}</p>
                </div>
              </div>
              <p className="text-gray-300 mt-5">{roadmap.summary}</p>
            </GlassCard>

            <div className="grid lg:grid-cols-2 gap-6">
              {(roadmap.milestones || []).map((m) => (
                <GlassCard key={m.week} hover={false}>
                  <p className="text-xs text-cyan-300 mb-2">Week {m.week}</p>
                  <h3 className="text-xl font-bold mb-3">{m.focus}</h3>
                  <p className="text-sm text-gray-400 mb-2">Tasks</p>
                  <ul className="space-y-2 text-sm text-gray-300 mb-4">
                    {(m.tasks || []).map((t) => (
                      <li key={t}>• {t}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-400 mb-2">Deliverables</p>
                  <ul className="space-y-2 text-sm text-gray-300 mb-4">
                    {(m.deliverables || []).map((d) => (
                      <li key={d}>• {d}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-400 mb-2">Resources</p>
                  <ul className="space-y-2 text-sm text-gray-300">
                    {(m.resources || []).map((r) => (
                      <li key={r}>• {r}</li>
                    ))}
                  </ul>
                </GlassCard>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <GlassCard hover={false}>
                <h3 className="text-lg font-bold mb-3">Daily Routine</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  {(roadmap.dailyRoutine || []).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </GlassCard>
              <GlassCard hover={false}>
                <h3 className="text-lg font-bold mb-3">Interview Checklist</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  {(roadmap.interviewPrepChecklist || []).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </GlassCard>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

