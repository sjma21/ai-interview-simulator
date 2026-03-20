import OpenAI from "openai";
import dotenv from "dotenv";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const MODEL = "openai/gpt-oss-120b";

export async function uploadPdf(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No PDF file uploaded" });
  }

  try {
    const data = await pdfParse(req.file.buffer);
    const rawText = data.text.trim();

    if (!rawText || rawText.length < 50) {
      return res.status(400).json({ error: "Could not extract readable text from PDF" });
    }

    // Truncate to 8000 chars to stay within token limits
    const text = rawText.slice(0, 8000);

    // Ask AI for a quick summary of the topics covered
    const summaryPrompt = `You are a study assistant. Read the following content and return a JSON object with:
- "title": a short title (max 6 words) describing the document
- "topics": an array of 3–5 key topics covered (short strings)
- "summary": a 2-sentence overview of the content

Content:
${text}

Return ONLY valid JSON, no markdown.`;

    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 400,
      messages: [{ role: "user", content: summaryPrompt }],
    });

    let meta = { title: "Uploaded Document", topics: [], summary: "" };
    try {
      meta = JSON.parse(response.choices[0].message.content.trim());
    } catch {
      // fallback if JSON parse fails
    }

    res.json({ text, meta });
  } catch (error) {
    console.error("PDF parse error:", error);
    res.status(500).json({ error: "Failed to process PDF" });
  }
}

export async function generateLearnQuestion(req, res) {
  const { pdfText, askedQuestions = [] } = req.body;

  if (!pdfText) {
    return res.status(400).json({ error: "pdfText is required" });
  }

  const asked = askedQuestions.length
    ? `\nAvoid repeating these questions:\n${askedQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
    : "";

  const prompt = `You are a strict but helpful tutor. Based on the content below, generate exactly ONE question to test the reader's understanding.

Content:
${pdfText.slice(0, 6000)}
${asked}

Rules:
- Ask only ONE question
- The question must be directly answerable from the content
- Do NOT provide the answer
- Do NOT add explanations or prefixes
- Keep it clear and concise

Return ONLY the question text.`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 250,
      messages: [{ role: "user", content: prompt }],
    });

    const question = response.choices[0].message.content.trim();
    res.json({ question });
  } catch (error) {
    console.error("Error generating learn question:", error);
    res.status(500).json({ error: "Failed to generate question" });
  }
}

export async function generateLearnHint(req, res) {
  const { pdfText, question } = req.body;

  if (!pdfText || !question) {
    return res.status(400).json({ error: "pdfText and question are required" });
  }

  const prompt = `You are a helpful tutor giving a subtle hint based on a document.

Reference Material (excerpt):
${pdfText.slice(0, 3000)}

Question: ${question}

Give a SHORT hint (1-2 sentences) that:
- Points the student in the right direction using the reference material
- Does NOT reveal the full answer
- Nudges them to look at a specific concept or section

Return ONLY the hint text.`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 120,
      messages: [{ role: "user", content: prompt }],
    });
    const hint = response.choices[0].message.content.trim();
    res.json({ hint });
  } catch (error) {
    console.error("Error generating learn hint:", error);
    res.status(500).json({ error: "Failed to generate hint" });
  }
}

export async function evaluateLearnAnswer(req, res) {
  const { pdfText, question, answer } = req.body;

  if (!pdfText || !question || !answer) {
    return res.status(400).json({ error: "pdfText, question, and answer are required" });
  }

  const prompt = `You are a strict but helpful tutor evaluating a student's answer.

Reference Material:
${pdfText.slice(0, 6000)}

Question: ${question}
Student's Answer: ${answer}

Evaluate based ONLY on the reference material above.

Output format:

Score: X/10

Feedback:
- What the student got right
- What was missing or incorrect

Correct Answer:
- The accurate answer based on the material

Tips to Improve:
- 2-3 specific suggestions`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 700,
      messages: [{ role: "user", content: prompt }],
    });

    const feedback = response.choices[0].message.content.trim();
    const scoreMatch = feedback.match(/score[^0-9]*(\d+)\s*\/\s*10/i);
    const score = scoreMatch ? Math.min(10, Math.max(0, parseInt(scoreMatch[1], 10))) : 5;

    res.json({ feedback, score });
  } catch (error) {
    console.error("Error evaluating learn answer:", error);
    res.status(500).json({ error: "Failed to evaluate answer" });
  }
}
