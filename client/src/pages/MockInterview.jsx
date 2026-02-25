import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import API from "../services/api";
import {
  MessageSquare,
  Send,
  Clock,
  Award
} from "lucide-react";
import { motion } from "framer-motion";

export default function MockInterview() {
  const [subject, setSubject] = useState("Data Structures");
  const [difficulty, setDifficulty] = useState("Medium");
  const [question, setQuestion] = useState(null);
  const [mockId, setMockId] = useState(null);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await API.get("/mock/history");
      setHistory(res.data);
    } catch (err) {
      console.error("History load error", err);
    }
  };

  const generateQuestion = async () => {
    setLoading(true);
    setQuestion(null);
    setEvaluation(null);
    setAnswer("");

    try {
      const res = await API.post("/mock/generate", {
        subject,
        difficulty
      });

      setQuestion(res.data.question);
      setMockId(res.data.mockId);
    } catch {
      alert("Failed to generate question");
    }

    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      alert("Please enter your answer");
      return;
    }

    setEvaluating(true);

    try {
      const res = await API.post("/mock/evaluate", {
        mockId,
        answer
      });

      setEvaluation(res.data);
      loadHistory();
    } catch {
      alert("Evaluation failed");
    }

    setEvaluating(false);
  };

  const getColor = (score) => {
    if (score >= 75) return "#10B981";
    if (score >= 50) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <MessageSquare className="text-[#3B82F6]" size={36} />
            AI Mock Interview
          </h1>
          <p className="text-gray-400 mt-2">
            Practice with AI-generated interview questions
          </p>
        </div>

        {/* Generate Section */}
        {!question && !evaluation && (
          <GlassCard hover={false}>
            <h3 className="text-lg font-bold mb-4">
              Generate Interview Question
            </h3>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
              >
                <option>Data Structures</option>
                <option>Algorithms</option>
                <option>System Design</option>
                <option>Operating Systems</option>
                <option>Database Management</option>
                <option>Networking</option>
                <option>OOP Concepts</option>
              </select>

              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            <button
              onClick={generateQuestion}
              disabled={loading}
              className="w-full bg-[#3B82F6] hover:bg-[#2563EB] py-3 rounded-full font-semibold"
            >
              {loading ? "Generating..." : "Generate Question"}
            </button>
          </GlassCard>
        )}

        {/* Question */}
        {question && !evaluation && (
          <>
            <GlassCard hover={false}>
              <h3 className="text-xl font-bold mb-4">
                Interview Question
              </h3>
              <p className="text-gray-200 leading-relaxed">
                {question}
              </p>
            </GlassCard>

            <GlassCard hover={false}>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="w-full h-48 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none resize-none"
              />
              <button
                onClick={submitAnswer}
                disabled={evaluating}
                className="mt-4 w-full bg-[#3B82F6] hover:bg-[#2563EB] py-3 rounded-full font-semibold flex justify-center gap-2"
              >
                {evaluating ? (
                  "Evaluating..."
                ) : (
                  <>
                    Submit Answer <Send size={18} />
                  </>
                )}
              </button>
            </GlassCard>
          </>
        )}

        {/* Evaluation */}
        {evaluation && (
          <>
            <GlassCard hover={false}>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-4">
                  Evaluation Results
                </h2>

                <div className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-white/5 border border-white/10">
                  <p
                    className="text-5xl font-bold"
                    style={{
                      color: getColor(evaluation.overallScore)
                    }}
                  >
                    {evaluation.overallScore}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  ["Technical", evaluation.technicalAccuracy],
                  ["Clarity", evaluation.conceptClarity],
                  ["Depth", evaluation.depth],
                  ["Communication", evaluation.communication]
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="text-center p-4 bg-white/5 rounded-xl"
                  >
                    <p className="text-sm text-gray-400">
                      {label}
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: getColor(value) }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard hover={false}>
              <h3 className="text-green-400 font-bold mb-2">
                Strengths
              </h3>
              <p className="text-gray-300">
                {evaluation.strengths}
              </p>
            </GlassCard>

            <GlassCard hover={false}>
              <h3 className="text-yellow-400 font-bold mb-2">
                Weaknesses
              </h3>
              <p className="text-gray-300">
                {evaluation.weaknesses}
              </p>
            </GlassCard>

            <GlassCard hover={false}>
              <h3 className="text-[#3B82F6] font-bold mb-2">
                Improvements
              </h3>
              <p className="text-gray-300">
                {evaluation.improvements}
              </p>
            </GlassCard>

            <button
              onClick={() => {
                setQuestion(null);
                setEvaluation(null);
              }}
              className="w-full bg-[#3B82F6] hover:bg-[#2563EB] py-3 rounded-full font-semibold"
            >
              Try Another Question
            </button>
          </>
        )}

        {/* History */}
        {history.length > 0 && (
          <GlassCard hover={false}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock size={20} /> Recent History
            </h3>

            {history.slice(0, 5).map((item) => (
              <div
                key={item._id}
                className="flex justify-between p-4 bg-white/5 rounded-xl mb-3"
              >
                <div>
                  <p className="text-sm text-gray-400">
                    {item.subject} • {item.difficulty}
                  </p>
                  <p className="text-white text-sm">
                    {item.question.slice(0, 80)}...
                  </p>
                </div>
                <p
                  className="text-xl font-bold"
                  style={{
                    color: getColor(item.overallScore)
                  }}
                >
                  {item.overallScore}
                </p>
              </div>
            ))}
          </GlassCard>
        )}
      </div>
    </Layout>
  );
}
