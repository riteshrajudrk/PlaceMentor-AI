import Groq from "groq-sdk";
import Mock from "../models/Mock.js";
import User from "../models/User.js";
import { calculateReadiness } from "../utils/readinessCalculator.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

  //  START INTERVIEW – Generate Question

export const startInterview = async (req, res) => {
  try {
    const { subject, difficulty } = req.body;

    const prompt = `
You are a technical interviewer.

Generate ONE ${difficulty} level interview question on ${subject}.

Rules:
- Return ONLY plain text.
- No markdown.
- No formatting.
- No explanation.
- Just the question in 2-4 sentences.
`;

    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 400,
    });

    const question =
      response.choices?.[0]?.message?.content?.trim() ||
      "Unable to generate question";

    res.json({ question });
  } catch (error) {
    console.error("START INTERVIEW ERROR:", error);
    res.status(500).json({ message: "Failed to generate question" });
  }
};

  //  SUBMIT INTERVIEW – Evaluate Answer

export const submitInterview = async (req, res) => {
  try {
    const { question, answer, subject, difficulty } = req.body;

    const prompt = `
You are a senior technical interviewer evaluating a candidate.

Question:
${question}

Candidate Answer:
${answer}

Evaluate across these dimensions:
1. Technical Accuracy (0-100)
2. Concept Clarity (0-100)
3. Depth of Explanation (0-100)
4. Communication Quality (0-100)

Return strictly valid JSON in this format:

{
  "overallScore": number,
  "technicalAccuracy": number,
  "conceptClarity": number,
  "depth": number,
  "communication": number,
  "strengths": "string",
  "weaknesses": "string",
  "improvements": "string"
}
`;

    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 900,
      response_format: { type: "json_object" }, 
    });

    const parsed = JSON.parse(
      response.choices?.[0]?.message?.content || "{}"
    );

    // Safety fallback
    const safeData = {
      overallScore: Number(parsed.overallScore) || 50,
      technicalAccuracy: Number(parsed.technicalAccuracy) || 50,
      conceptClarity: Number(parsed.conceptClarity) || 50,
      depth: Number(parsed.depth) || 50,
      communication: Number(parsed.communication) || 50,
      strengths: parsed.strengths || "Could not evaluate properly",
      weaknesses: parsed.weaknesses || "Formatting issue",
      improvements: parsed.improvements || "Provide structured answers",
    };

    // 🔥 Save Interview
    await Mock.create({
      user: req.user.id,
      subject,
      difficulty,
      question,
      answer,
      ...safeData,
    });

    // 🔥 Update Readiness Score
    const user = await User.findById(req.user.id);

    const newScore = calculateReadiness({
      dsaScore: Number(user.readinessScore) || 0,
      atsScore: 50,
      mockScore: safeData.overallScore,
    });

    user.readinessScore = newScore;
    await user.save();

    res.json(safeData);
  } catch (error) {
    console.error("SUBMIT INTERVIEW ERROR:", error);
    res.status(500).json({ message: "Evaluation failed" });
  }
};