import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import GlassCard from "../components/GlassCard";
import API from "../services/api";
import { Upload, FileText, CheckCircle, XCircle } from "lucide-react";
import { motion as Motion } from "framer-motion";

export default function ResumeAnalyzer() {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadResume();
  }, []);

  const loadResume = async () => {
    try {
      const res = await API.get("/resume");
      if (!res.data) {
        setResume(null);
        return;
      }

      // Ensure safe structure
      const safeData = {
        atsScore: res.data?.atsScore ?? 0,
        skills: res.data?.skills ?? [],
        missingSkills: res.data?.missingSkills ?? [],
        suggestions: res.data?.suggestions ?? ""
      };

      setResume(safeData);
    } catch (err) {
      console.error("Resume load error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".pdf")) {
      setError("Only PDF files allowed");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Ensure safe structure after upload
      const safeData = {
        atsScore: res.data?.atsScore ?? 0,
        skills: res.data?.skills ?? [],
        missingSkills: res.data?.missingSkills ?? [],
        suggestions: res.data?.suggestions ?? ""
      };

      setResume(safeData);
    } catch (err) {
        console.error("Resume Analysis Error:", err);
      setError("Upload failed");
    }

    setUploading(false);
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
            <FileText className="text-[#3B82F6]" size={36} />
            Resume Analyzer
          </h1>
          <p className="text-gray-400 mt-2">
            Get AI-powered ATS score & improvements
          </p>
        </div>

        {/* Upload Section */}
        <GlassCard hover={false}>
          <label className="block w-full p-10 border-2 border-dashed border-white/20 rounded-xl text-center cursor-pointer hover:border-[#3B82F6]/50 transition-all">
            <input
              type="file"
              accept=".pdf"
              onChange={handleUpload}
              className="hidden"
            />

            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#3B82F6] rounded-full mb-4"></div>
                <p className="text-gray-400">
                  Analyzing resume...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="text-[#3B82F6] mb-4" size={48} />
                <p className="text-white font-semibold">
                  Click to upload resume
                </p>
                <p className="text-sm text-gray-400">
                  PDF only
                </p>
              </div>
            )}
          </label>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
        </GlassCard>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#3B82F6] rounded-full"></div>
          </div>
        ) : resume ? (
          <>
            {/* ATS Score */}
            <GlassCard hover={false}>
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-6">
                  Your ATS Score
                </h2>

                <div className="inline-flex items-center justify-center w-48 h-48 rounded-full bg-white/5 border border-white/10">
                  <div>
                    <p
                      className="text-6xl font-bold"
                      style={{ color: getColor(resume.atsScore) }}
                    >
                      {resume.atsScore}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Out of 100
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Skills Found */}
            {resume.skills.length > 0 && (
              <GlassCard hover={false}>
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="text-green-400" size={24} />
                  <h3 className="text-xl font-bold">
                    Skills Found
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill, i) => (
                    <Motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-medium"
                    >
                      {skill}
                    </Motion.span>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Missing Skills */}
            {resume.missingSkills.length > 0 && (
              <GlassCard hover={false}>
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="text-yellow-400" size={24} />
                  <h3 className="text-xl font-bold">
                    Missing Skills
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {resume.missingSkills.map((skill, i) => (
                    <Motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-sm font-medium"
                    >
                      {skill}
                    </Motion.span>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Suggestions */}
            {resume.suggestions && (
              <GlassCard hover={false}>
                <h3 className="text-xl font-bold mb-4">
                  Improvement Suggestions
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {resume.suggestions}
                </p>
              </GlassCard>
            )}
          </>
        ) : (
          <GlassCard hover={false}>
            <div className="text-center py-16">
              <FileText
                className="mx-auto text-gray-600 mb-4"
                size={64}
              />
              <p className="text-xl text-gray-400">
                No resume uploaded yet
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Upload your resume to get ATS analysis
              </p>
            </div>
          </GlassCard>
        )}
      </div>
    </Layout>
  );
}

