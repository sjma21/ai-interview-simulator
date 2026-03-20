import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import interviewRoutes from "./routes/interview.js";
import learnRoutes from "./routes/learn.js";
import assistantRoutes from "./routes/assistant.js";
import codingRoutes from "./routes/coding.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

app.use("/api", interviewRoutes);
app.use("/api/learn", learnRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/coding", codingRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "AI Interview Simulator API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
