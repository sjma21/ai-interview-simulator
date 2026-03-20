import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const MODEL = "openai/gpt-oss-120b";

export async function generateStudyPlan(req, res) {
  const { domain, experience, hoursPerDay, weeks } = req.body;

  if (!domain || !experience || !hoursPerDay || !weeks) {
    return res.status(400).json({ error: "All fields required" });
  }

  const prompt = `You are an expert technical interview coach. Create a detailed, personalized study plan.

Target Role/Domain: ${domain}
Current Experience Level: ${experience}
Time Available Per Day: ${hoursPerDay} hours
Preparation Timeframe: ${weeks} weeks

Create a structured week-by-week study plan with:
- Clear weekly goals and milestones
- Core topics to cover each week (prioritized by interview frequency)
- Daily practice breakdown
- Types of projects/exercises to build
- Checkpoints to self-assess progress
- Final week interview preparation tips

Use clear headers like "Week 1:", "Week 2:" etc. Be practical, specific, and motivating. Tailor it to the experience level.`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });
    const plan = response.choices[0].message.content.trim();
    res.json({ message: plan });
  } catch (error) {
    console.error("Error generating study plan:", error);
    res.status(500).json({ error: "Failed to generate study plan" });
  }
}

export async function explainText(req, res) {
  const { text } = req.body;

  if (!text || text.trim().length < 10) {
    return res.status(400).json({ error: "Please provide a paragraph to explain" });
  }

  const prompt = `You are an expert technical educator. Explain the following text in a clear, engaging way.

Text to Explain:
"""
${text}
"""

Provide your explanation in this structure:
**Simple Explanation:** (explain as if talking to someone new to the topic)
**Key Concepts:** (bullet list of the important ideas)
**Why It Matters:** (practical significance)
**Analogy:** (a relatable real-world analogy if applicable)

Keep it conversational, clear, and educational.`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });
    const explanation = response.choices[0].message.content.trim();
    res.json({ message: explanation });
  } catch (error) {
    console.error("Error explaining text:", error);
    res.status(500).json({ error: "Failed to explain text" });
  }
}

export async function chatFollowUp(req, res) {
  const { history, message, mode } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const systemPrompt =
    mode === "study-plan"
      ? "You are an expert technical interview coach helping a candidate with their study plan. Answer follow-up questions concisely and helpfully. Give actionable advice."
      : "You are an expert technical educator. Help the user understand technical concepts better. Be clear, use examples, and make complex topics approachable.";

  const messages = [
    { role: "system", content: systemPrompt },
    ...(history || []).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: message },
  ];

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 600,
      messages,
    });
    const reply = response.choices[0].message.content.trim();
    res.json({ message: reply });
  } catch (error) {
    console.error("Error in chat follow-up:", error);
    res.status(500).json({ error: "Failed to get response" });
  }
}
