import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const MODEL = "openai/gpt-oss-120b";

export async function generateQuestion(req, res) {
  const { domain, difficulty, verbal } = req.body;

  if (!domain || !difficulty) {
    return res.status(400).json({ error: "domain and difficulty are required" });
  }

  const prompt = verbal
    ? `You are a professional technical interviewer conducting a spoken voice interview.

Generate exactly ONE conceptual/theoretical interview question.

Domain: ${domain}
Difficulty: ${difficulty}

STRICT RULES — the question MUST be:
- Answered verbally by speaking, not by writing code
- About concepts, definitions, trade-offs, how things work, or real-world scenarios
- Clear and natural when read aloud (no code snippets, no backticks, no syntax)
- A single focused question (not multi-part)

Good examples: "Can you explain how closures work in JavaScript and why they're useful?"
Bad examples: "What does this code output?" or anything with \`\`\` code blocks

Return ONLY the question text. No prefix, no explanation.`
    : `You are a strict technical interviewer.

Generate exactly ONE interview question.

Domain: ${domain}
Difficulty: ${difficulty}

Rules:
- Ask only ONE question
- Do NOT provide answer
- Do NOT add explanation
- Keep it realistic

Return ONLY the question text.`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const question = response.choices[0].message.content.trim();
    res.json({ question });
  } catch (error) {
    console.error("Error generating question:", error);
    res.status(500).json({ error: "Failed to generate question" });
  }
}

export async function generateHint(req, res) {
  const { domain, question } = req.body;

  if (!domain || !question) {
    return res.status(400).json({ error: "domain and question are required" });
  }

  const prompt = `You are a helpful technical interviewer giving a subtle hint.

Domain: ${domain}
Question: ${question}

Give a SHORT hint (1-2 sentences) that:
- Points the candidate in the right direction
- Does NOT reveal the answer
- Does NOT give examples or code
- Nudges them to think about a specific concept

Return ONLY the hint text. No prefix like "Hint:" needed.`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 120,
      messages: [{ role: "user", content: prompt }],
    });
    const hint = response.choices[0].message.content.trim();
    res.json({ hint });
  } catch (error) {
    console.error("Error generating hint:", error);
    res.status(500).json({ error: "Failed to generate hint" });
  }
}

export async function evaluateAnswer(req, res) {
  const { domain, question, answer, verbal } = req.body;

  if (!domain || !question || !answer) {
    return res
      .status(400)
      .json({ error: "domain, question, and answer are required" });
  }

  const prompt = verbal
    ? `You are a professional technical interviewer evaluating a spoken verbal answer.

Domain: ${domain}
Question: ${question}
Spoken Answer: ${answer}

Important: The candidate answered by speaking out loud, not typing. Be fair — spoken answers are naturally less structured than written ones. Evaluate the conceptual understanding, not grammar or formatting.

Output format:

Score: X/10

Feedback:
- What concepts they got right
- What key points were missing or vague

Ideal Answer:
- A strong spoken answer covering the key concepts

Improvement Tips:
- 2-3 short actionable bullet points`
    : `You are a strict but helpful technical interviewer.

Evaluate the user's answer.

Domain: ${domain}
Question: ${question}
User Answer: ${answer}

Output format:

Score: X/10

Feedback:
- What was correct
- What was missing

Ideal Answer:
- Strong concise answer

Improvement Tips:
- 2-3 bullet points`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const feedback = response.choices[0].message.content.trim();
    // Handle markdown bold (**Score: 8/10**), spaces around slash, varied casing
    const scoreMatch = feedback.match(/score[^0-9]*(\d+)\s*\/\s*10/i);
    const score = scoreMatch ? Math.min(10, Math.max(0, parseInt(scoreMatch[1], 10))) : 5;

    res.json({ feedback, score });
  } catch (error) {
    console.error("Error evaluating answer:", error);
    res.status(500).json({ error: "Failed to evaluate answer" });
  }
}
