export type Domain =
  | "JavaScript"
  | "React.js"
  | "Backend"
  | "SQL"
  | "System Design"
  | "TypeScript"
  | "DSA";
export type Difficulty = "Easy" | "Medium" | "Hard";

export type MessageRole = "user" | "ai";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  type: "question" | "answer" | "feedback" | "hint";
}

export interface InterviewConfig {
  domain: Domain;
  difficulty: Difficulty;
  timerSeconds: number | null; // null = no timer
}

export interface InterviewState {
  config: InterviewConfig | null;
  messages: Message[];
  currentQuestion: string;
  questionNumber: number;
  scores: number[];
  loading: boolean;
  loadingText: string;
  phase: "landing" | "interview" | "end" | "learn";
}
