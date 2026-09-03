import Mock from "../models/Mock.js";
import axios from "axios";
import { recalculateReadinessForUser } from "../utils/readinessService.js";

const cleanInterviewQuestion = (raw = "") => {
  let q = raw.trim();

  // Remove markdown fences and bold markers.
  q = q.replace(/```[\s\S]*?```/g, "").replace(/\*\*/g, "");

  // Prefer explicit "Question:" section if the model returns a template.
  const questionMatch = q.match(/question\s*:\s*([\s\S]*?)(?:example input|example output|note:|$)/i);
  if (questionMatch?.[1]) {
    q = questionMatch[1].trim();
  }

  // Drop common template tails.
  q = q
    .replace(/example input[\s\S]*$/i, "")
    .replace(/example output[\s\S]*$/i, "")
    .replace(/note:\s*[\s\S]*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  // Ensure question punctuation for display consistency.
  if (q && !/[?.!]$/.test(q)) q = `${q}?`;
  return q;
};

export const generateQuestion = async (req, res) => {
  const { subject, difficulty } = req.body;

  try {
    const aiResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content:
              "You are a senior technical interviewer. Return exactly one interview question only."
          },
          {
            role: "user",
            content: `
Generate exactly one ${difficulty} ${subject} interview question.
Rules:
- Output only the question sentence.
- Do not include headings like "Question:".
- Do not include notes, hints, examples, input/output, or explanation.
- Keep it realistic for a live interview.
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

    const rawQuestion = aiResponse.data.choices[0].message.content || "";
    const question = cleanInterviewQuestion(rawQuestion);

    const mock = await Mock.create({
      userId: req.user._id,
      subject,
      difficulty,
      question,
      evaluated: false
    });

    res.json({
      question,
      mockId: mock._id
    });

  } catch (err) {
    
    console.error(JSON.stringify(err.response?.data, null, 2));
    res.status(500).json({ message: "Failed to generate question" });
  }
};

export const evaluateAnswer = async (req, res) => {
  const { mockId, answer } = req.body;

  const mock = await Mock.findById(mockId);
  if (!mock) return res.status(404).json({ message: "Mock not found" });

  try {
    const aiResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content:
              "Evaluate interview answers and respond ONLY in JSON."
          },
          {
            role: "user",
            content: `
Evaluate this answer and return:

{
  "overallScore": number,
  "technicalAccuracy": number,
  "conceptClarity": number,
  "depth": number,
  "communication": number,
  "strengths": "",
  "weaknesses": "",
  "improvements": ""
}

Question:
${mock.question}

Answer:
${answer}
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
      result = result.replace(/```json|```/g, "");
    }

    const parsed = JSON.parse(result);

    Object.assign(mock, parsed, {
      answer,
      evaluated: true
    });

    await mock.save();

    await recalculateReadinessForUser(req.user._id);

    res.json(parsed);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Evaluation failed" });
  }
};

export const getHistory = async (req, res) => {
  const mocks = await Mock.find({
    userId: req.user._id,
    evaluated: true
  }).sort({ updatedAt: -1 });

  res.json(mocks);
};
