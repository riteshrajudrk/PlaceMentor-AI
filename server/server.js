import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import leetcodeRoutes from "./routes/leetcodeRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import mockRoutes from "./routes/mockRoutes.js";
import codingRoutes from "./routes/codingRoutes.js";
import roadmapRoutes from "./routes/roadmapRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

if (!process.env.MONGO_URI) {
  console.warn("MONGO_URI is not set. Database routes will fail until it is configured.");
} else if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB connection error:", err));
}

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "PlaceMentor API" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/mock", mockRoutes);
app.use("/api/coding", codingRoutes);
app.use("/api/roadmap", roadmapRoutes);

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

export default app;
