import { useState, useCallback } from "react";
import type { Message } from "../types";

export type LearnPhase = "upload" | "session" | "end";

export interface PdfMeta {
  title: string;
  topics: string[];
  summary: string;
}

export interface LearnState {
  phase: LearnPhase;
  pdfText: string;
  pdfMeta: PdfMeta | null;
  fileName: string;
  messages: Message[];
  currentQuestion: string;
  askedQuestions: string[];
  questionNumber: number;
  scores: number[];
  loading: boolean;
  loadingText: string;
}

const TOTAL_QUESTIONS = 5;

function createMessage(
  role: Message["role"],
  content: string,
  type: Message["type"]
): Message {
  return { id: crypto.randomUUID(), role, content, type };
}

export function useLearn() {
  const [state, setState] = useState<LearnState>({
    phase: "upload",
    pdfText: "",
    pdfMeta: null,
    fileName: "",
    messages: [],
    currentQuestion: "",
    askedQuestions: [],
    questionNumber: 0,
    scores: [],
    loading: false,
    loadingText: "",
  });
  const [hintUsedThisQuestion, setHintUsedThisQuestion] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);

  const uploadPdf = useCallback(async (file: File) => {
    setState((prev) => ({ ...prev, loading: true, loadingText: "Reading your PDF..." }));

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch("/api/learn/upload-pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setState((prev) => ({
        ...prev,
        pdfText: data.text,
        pdfMeta: data.meta,
        fileName: file.name,
        loading: false,
        loadingText: "",
      }));
    } catch (err) {
      console.error(err);
      setState((prev) => ({ ...prev, loading: false, loadingText: "" }));
    }
  }, []);

  const startSession = useCallback(async () => {
    setHintUsedThisQuestion(false);
    setState((prev) => ({
      ...prev,
      phase: "session",
      messages: [],
      scores: [],
      askedQuestions: [],
      questionNumber: 0,
      loading: true,
      loadingText: "Generating your first question...",
    }));

    try {
      const res = await fetch("/api/learn/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfText: state.pdfText, askedQuestions: [] }),
      });
      const data = await res.json();

      setState((prev) => ({
        ...prev,
        currentQuestion: data.question,
        questionNumber: 1,
        askedQuestions: [data.question],
        messages: [createMessage("ai", data.question, "question")],
        loading: false,
        loadingText: "",
      }));
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [state.pdfText]);

  const requestHint = useCallback(async () => {
    if (!state.currentQuestion || !state.pdfText) return;
    setHintLoading(true);
    try {
      const res = await fetch("/api/learn/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfText: state.pdfText,
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
  }, [state.currentQuestion, state.pdfText]);

  const submitAnswer = useCallback(
    async (answer: string) => {
      const usedHint = hintUsedThisQuestion;
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, createMessage("user", answer, "answer")],
        loading: true,
        loadingText: "Evaluating based on your PDF...",
      }));

      try {
        const res = await fetch("/api/learn/evaluate-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pdfText: state.pdfText,
            question: state.currentQuestion,
            answer,
          }),
        });
        const data = await res.json();
        const finalScore = Math.max(0, data.score - (usedHint ? 1 : 0));

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, createMessage("ai", data.feedback, "feedback")],
          scores: [...prev.scores, finalScore],
          loading: false,
          loadingText: "",
        }));
      } catch {
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [state.pdfText, state.currentQuestion, hintUsedThisQuestion]
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
      loadingText: "Generating next question...",
    }));

    try {
      const res = await fetch("/api/learn/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfText: state.pdfText,
          askedQuestions: state.askedQuestions,
        }),
      });
      const data = await res.json();

      setState((prev) => ({
        ...prev,
        currentQuestion: data.question,
        questionNumber: prev.questionNumber + 1,
        askedQuestions: [...prev.askedQuestions, data.question],
        messages: [...prev.messages, createMessage("ai", data.question, "question")],
        loading: false,
        loadingText: "",
      }));
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [state.questionNumber, state.pdfText, state.askedQuestions]);

  const endSession = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "end", loading: false }));
  }, []);

  const reset = useCallback(() => {
    setState({
      phase: "upload",
      pdfText: "",
      pdfMeta: null,
      fileName: "",
      messages: [],
      currentQuestion: "",
      askedQuestions: [],
      questionNumber: 0,
      scores: [],
      loading: false,
      loadingText: "",
    });
  }, []);

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
    lastMessageIsQuestion,
    lastMessageIsFeedback,
    isLastQuestion,
    hintUsedThisQuestion,
    hintLoading,
    uploadPdf,
    startSession,
    submitAnswer,
    requestHint,
    nextQuestion,
    endSession,
    reset,
  };
}
