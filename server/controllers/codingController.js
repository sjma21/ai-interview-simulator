import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const MODEL = "openai/gpt-oss-120b";

const starterTemplates = {
  javascript: (title) =>
    `/**\n * ${title}\n * @param {any} input\n * @return {any}\n */\nfunction solution(input) {\n  // Write your code here\n  \n}\n`,
  python: (title) =>
    `# ${title}\ndef solution(input):\n    # Write your code here\n    pass\n`,
  typescript: (title) =>
    `/**\n * ${title}\n */\nfunction solution(input: any): any {\n  // Write your code here\n  \n}\n`,
  java: (title) =>
    `// ${title}\npublic class Solution {\n    public static Object solution(Object input) {\n        // Write your code here\n        return null;\n    }\n}\n`,
  cpp: (title) =>
    `// ${title}\n#include <bits/stdc++.h>\nusing namespace std;\n\nauto solution(auto input) {\n    // Write your code here\n    \n}\n`,
  go: (title) =>
    `// ${title}\npackage main\n\nfunc solution(input interface{}) interface{} {\n    // Write your code here\n    return nil\n}\n`,
};

export async function generateCodingQuestion(req, res) {
  const { topic, difficulty, language } = req.body;

  if (!topic || !difficulty || !language) {
    return res.status(400).json({ error: "topic, difficulty, and language are required" });
  }

  const prompt = `You are a coding interview question generator. Generate a ${difficulty} level coding problem about "${topic}".

Return ONLY a valid JSON object with NO markdown, NO code fences, just raw JSON.

JSON schema:
{
  "title": "short problem title",
  "description": "full problem description (2-3 clear sentences explaining what to solve)",
  "examples": [
    { "input": "example input string", "output": "expected output string", "explanation": "brief explanation" },
    { "input": "another input", "output": "expected output", "explanation": "brief explanation" }
  ],
  "constraints": ["constraint 1", "constraint 2", "constraint 3"],
  "starterCode": "the function signature and docstring in ${language}, with a placeholder comment for user to fill in"
}

Rules:
- Make the problem realistic and interview-worthy
- Provide exactly 2 examples
- Give 3-4 constraints
- The starterCode should match the language: ${language}
- For ${language}, use appropriate syntax for the function signature`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 900,
      messages: [{ role: "user", content: prompt }],
    });

    let raw = response.choices[0].message.content.trim();
    // Strip any accidental markdown fences
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let question;
    try {
      question = JSON.parse(raw);
    } catch {
      // Fallback if JSON parsing fails
      question = {
        title: `${topic} Challenge`,
        description: raw.slice(0, 300),
        examples: [{ input: "input", output: "output", explanation: "see description" }],
        constraints: ["Follow the problem description"],
        starterCode: starterTemplates[language.toLowerCase()]?.(`${topic} Challenge`) ?? "// Write your solution here\n",
      };
    }

    // Ensure starter code uses our template if AI gave a bad one
    if (!question.starterCode || question.starterCode.length < 5) {
      question.starterCode = starterTemplates[language.toLowerCase()]?.(question.title) ?? "// Write your solution here\n";
    }

    res.json({ question });
  } catch (error) {
    console.error("Error generating coding question:", error);
    res.status(500).json({ error: "Failed to generate question" });
  }
}

export async function analyzeCode(req, res) {
  const { question, code, language, timeTaken, timerSeconds } = req.body;

  if (!question || !code || !language) {
    return res.status(400).json({ error: "question, code, and language are required" });
  }

  const timeInfo = timeTaken != null
    ? `Time taken: ${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s${timerSeconds ? ` out of ${Math.floor(timerSeconds / 60)}m` : ""}`
    : "";

  const prompt = `You are an expert code reviewer conducting a technical interview. Analyze this code submission.

Problem Title: ${question.title}
Problem: ${question.description}
Language: ${language}
${timeInfo}

User's Code:
\`\`\`${language}
${code}
\`\`\`

Provide a detailed analysis using EXACTLY this format (use **bold** for section headers):

**Verdict:** [Correct ✅ / Partially Correct ⚠️ / Incorrect ❌]

**Code Review:**
- What the code does correctly
- Any logic errors or bugs found

**Time Complexity:** O(?) — brief explanation

**Space Complexity:** O(?) — brief explanation

**Edge Cases:**
- List any edge cases not handled (or "All major edge cases handled ✓")

**Optimal Approach:**
Explain the best approach to solve this problem in 2-3 sentences.

**Optimal Solution (${language}):**
\`\`\`${language}
// Complete optimal solution with comments
\`\`\`

**Score:** X/10

Be specific, educational, and constructive. If the code is correct, still suggest improvements or better approaches.`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    const analysis = response.choices[0].message.content.trim();

    // Extract score
    const scoreMatch = analysis.match(/score[^0-9]*(\d+)\s*\/\s*10/i);
    const score = scoreMatch ? Math.min(10, Math.max(0, parseInt(scoreMatch[1], 10))) : null;

    res.json({ analysis, score });
  } catch (error) {
    console.error("Error analyzing code:", error);
    res.status(500).json({ error: "Failed to analyze code" });
  }
}
