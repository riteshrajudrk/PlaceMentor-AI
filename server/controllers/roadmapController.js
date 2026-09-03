import axios from "axios";
import Roadmap from "../models/Roadmap.js";

const cleanJson = (value = "") => {
  let result = value.trim();
  if (result.startsWith("```")) result = result.replace(/```json|```/g, "").trim();
  return result;
};

export const generateRoadmap = async (req, res) => {
  try {
    const { goal, focusArea, hoursPerDay, timelineWeeks } = req.body;

    if (!goal || !goal.trim()) {
      return res.status(400).json({ message: "Goal is required" });
    }

    const prompt = `
Create a practical preparation roadmap.
Goal: ${goal}
Focus Area: ${focusArea || "General preparation"}
Hours per day: ${hoursPerDay || 2}
Timeline weeks: ${timelineWeeks || 8}

Return ONLY valid JSON with this exact shape:
{
  "title": "",
  "summary": "",
  "durationWeeks": number,
  "outcome": "",
  "milestones": [
    {
      "week": number,
      "focus": "",
      "tasks": ["", ""],
      "deliverables": ["", ""],
      "resources": ["", ""]
    }
  ],
  "dailyRoutine": ["", "", ""],
  "interviewPrepChecklist": ["", "", ""]
}
`;

    const aiResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: "You are an expert technical mentor. Return strict JSON only." },
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const raw = aiResponse.data?.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(cleanJson(raw));

    const saved = await Roadmap.create({
      userId: req.user._id,
      goal,
      focusArea: focusArea || "General preparation",
      hoursPerDay: Number(hoursPerDay) || 2,
      timelineWeeks: Number(timelineWeeks) || parsed.durationWeeks || 8,
      result: parsed
    });

    return res.json({
      roadmapId: saved._id,
      ...parsed
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to generate roadmap" });
  }
};

export const getRoadmapHistory = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(10);
    return res.json(roadmaps);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch roadmap history" });
  }
};

