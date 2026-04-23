import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB, requireDB } from "./config/db.js";

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

connectDB()
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "PlaceMentor API" });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "not_connected"
  });
});

app.use("/api/auth", requireDB, authRoutes);
app.use("/api/dashboard", requireDB, dashboardRoutes);
app.use("/api/leetcode", requireDB, leetcodeRoutes);
app.use("/api/resume", requireDB, resumeRoutes);
app.use("/api/mock", requireDB, mockRoutes);
app.use("/api/coding", requireDB, codingRoutes);
app.use("/api/roadmap", requireDB, roadmapRoutes);

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

export default app;
