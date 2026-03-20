import { useState, useCallback } from "react";
import type {
  InterviewConfig,
  InterviewState,
  Message,
} from "../types";

const TOTAL_QUESTIONS = 5;

function createMessage(
  role: Message["role"],
  content: string,
  type: Message["type"]
): Message {
  return { id: crypto.randomUUID(), role, content, type };
}

export function useInterview() {
  const [state, setState] = useState<InterviewState>({
    config: null,
    messages: [],
    currentQuestion: "",
    questionNumber: 0,
    scores: [],
    loading: false,
    loadingText: "",
    phase: "landing",
  });
  const [hintUsedThisQuestion, setHintUsedThisQuestion] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);

  const setLoading = (loading: boolean, loadingText = "") =>
    setState((prev) => ({ ...prev, loading, loadingText }));

  const startInterview = useCallback(async (config: InterviewConfig) => {
    setHintUsedThisQuestion(false);
    setState((prev) => ({
      ...prev,
      config,
      messages: [],
      scores: [],
      questionNumber: 0,
      phase: "interview",
      loading: true,
      loadingText: "Thinking like an interviewer...",
    }));

    try {
      const res = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();

      setState((prev) => ({
        ...prev,
        currentQuestion: data.question,
        questionNumber: 1,
        messages: [createMessage("ai", data.question, "question")],
        loading: false,
        loadingText: "",
      }));
    } catch {
      setLoading(false);
    }
  }, []);

  const requestHint = useCallback(async () => {
    if (!state.currentQuestion || !state.config) return;
    setHintLoading(true);
    try {
      const res = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: state.config.domain,
          question: state.currentQuestion,
        }),
      });
      const data = await res.json();
      setHintUsedThisQuestion(true);
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, createMessage("ai", data.hint, "hint")],
      }));
    } catch {
      // silently fail
    } finally {
      setHintLoading(false);
    }
  }, [state.currentQuestion, state.config]);

  const submitAnswer = useCallback(
    async (answer: string) => {
      const usedHint = hintUsedThisQuestion;
      setState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          createMessage("user", answer, "answer"),
        ],
        loading: true,
        loadingText: "Evaluating your answer...",
      }));

      try {
        const res = await fetch("/api/evaluate-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            domain: state.config!.domain,
            question: state.currentQuestion,
            answer,
          }),
        });
        const data = await res.json();
        const finalScore = Math.max(0, data.score - (usedHint ? 1 : 0));

        setState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            createMessage("ai", data.feedback, "feedback"),
          ],
          scores: [...prev.scores, finalScore],
          loading: false,
          loadingText: "",
        }));
      } catch {
        setLoading(false);
      }
    },
    [state.config, state.currentQuestion, hintUsedThisQuestion]
  );

  const nextQuestion = useCallback(async () => {
    if (state.questionNumber >= TOTAL_QUESTIONS) {
      setState((prev) => ({ ...prev, phase: "end" }));
      return;
    }

    setHintUsedThisQuestion(false);
    setState((prev) => ({
      ...prev,
      loading: true,
      loadingText: "Thinking like an interviewer...",
    }));

    try {
      const res = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.config),
      });
      const data = await res.json();

      setState((prev) => ({
        ...prev,
        currentQuestion: data.question,
        questionNumber: prev.questionNumber + 1,
        messages: [
          ...prev.messages,
          createMessage("ai", data.question, "question"),
        ],
        loading: false,
        loadingText: "",
      }));
    } catch {
      setLoading(false);
    }
  }, [state.questionNumber, state.config]);

  const endInterview = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "end", loading: false }));
  }, []);

  const resetInterview = useCallback(() => {
    setState({
      config: null,
      messages: [],
      currentQuestion: "",
      questionNumber: 0,
      scores: [],
      loading: false,
      loadingText: "",
      phase: "landing",
    });
  }, []);

  const totalScore = state.scores.reduce((a, b) => a + b, 0);
  const averageScore =
    state.scores.length > 0
      ? (totalScore / state.scores.length).toFixed(1)
      : "0";
  const lastMessageIsQuestion =
    state.messages.length > 0 &&
    state.messages[state.messages.length - 1].type === "question";
  const lastMessageIsFeedback =
    state.messages.length > 0 &&
    state.messages[state.messages.length - 1].type === "feedback";
  const isLastQuestion = state.questionNumber >= TOTAL_QUESTIONS;

  return {
    state,
    totalQuestions: TOTAL_QUESTIONS,
    totalScore,
    averageScore,
    lastMessageIsQuestion,
    lastMessageIsFeedback,
    isLastQuestion,
    hintUsedThisQuestion,
    hintLoading,
    startInterview,
    submitAnswer,
    requestHint,
    nextQuestion,
    endInterview,
    resetInterview,
  };
}
