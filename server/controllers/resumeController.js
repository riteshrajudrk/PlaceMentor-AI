import Resume from "../models/Resume.js";
import axios from "axios";
import { recalculateReadinessForUser } from "../utils/readinessService.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse-new");

export const uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "PDF required" });
  }

  try {
    const data = await pdf(req.file.buffer);
    const resumeText = data.text.slice(0, 4000);

    const aiResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content: "You are an ATS analyzer. Respond ONLY in valid JSON format."
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
    if (result.startsWith("```")) {
      result = result.replace(/```json|```/g, "").trim();
    }

    const parsed = JSON.parse(result);

    await Resume.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        atsScore: parsed.atsScore,
        skills: parsed.skills,
        missingSkills: parsed.missingSkills,
        suggestions: parsed.suggestions
      },
      { upsert: true, returnDocument: "after" }
    );

    await recalculateReadinessForUser(req.user._id);
    return res.json(parsed);
  } catch (err) {
    console.error("Resume Analysis Error:", err);
    return res.status(500).json({ message: "Resume analysis failed" });
  }
};

export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      userId: req.user._id
    });

    if (!resume) {
      return res.json(null);
    }

    return res.json(resume);
  } catch (err) {
    console.error("Get Resume Error:", err);
    return res.status(500).json({ message: "Failed to fetch resume" });
  }
};
