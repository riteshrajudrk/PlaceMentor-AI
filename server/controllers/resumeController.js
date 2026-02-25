import Resume from "../models/Resume.js";
import LeetcodeStat from "../models/LeetcodeStat.js";
import Mock from "../models/Mock.js";
import User from "../models/User.js";
import { calculateReadinessScore } from "../utils/scoreCalculator.js";
import axios from "axios";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

// ✅ Use pdf-parse-new safely inside ESM
const pdf = require("pdf-parse-new");


// ===============================
// 🔥 Upload Resume
// ===============================
export const uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "PDF required" });
  }

  try {
    // ✅ Parse PDF from memory buffer
    const data = await pdf(req.file.buffer);

    const resumeText = data.text.slice(0, 4000);

    // ✅ Send to Groq AI
    const aiResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are an ATS analyzer. Respond ONLY in valid JSON format."
          },
          {
            role: "user",
            content: `
Analyze this resume and return JSON:

{
  "atsScore": number (0-100),
  "skills": [],
  "missingSkills": [],
  "suggestions": ""
}

Resume:
${resumeText}
`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let result = aiResponse.data.choices[0].message.content;

    // Clean markdown if present
    if (result.startsWith("```")) {
      result = result.replace(/```json|```/g, "").trim();
    }

    const parsed = JSON.parse(result);

    // ✅ Save Resume
    await Resume.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        atsScore: parsed.atsScore,
        skills: parsed.skills,
        missingSkills: parsed.missingSkills,
        suggestions: parsed.suggestions
      },
      { upsert: true, new: true }
    );

    // ✅ Get DSA score
    const leetcode = await LeetcodeStat.findOne({
      userId: req.user._id
    });

    // ✅ Get Mock Average
    const mocks = await Mock.find({
      userId: req.user._id,
      evaluated: true
    });

    const mockAvg = mocks.length
      ? mocks.reduce((sum, m) => sum + m.overallScore, 0) / mocks.length
      : 0;

    // ✅ Calculate Readiness
    const readiness = calculateReadinessScore(
      leetcode?.dsaScore || 0,
      parsed.atsScore,
      mockAvg
    );

    await User.findByIdAndUpdate(req.user._id, {
      readinessScore: readiness
    });

    res.json(parsed);

  } catch (err) {
    console.error("Resume Analysis Error:", err);
    res.status(500).json({ message: "Resume analysis failed" });
  }
};


// ===============================
// 🔥 Get Resume
// ===============================
export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      userId: req.user._id
    });

    if (!resume) {
      return res.json(null);
    }

    res.json(resume);
  } catch (err) {
    console.error("Get Resume Error:", err);
    res.status(500).json({ message: "Failed to fetch resume" });
  }
};
