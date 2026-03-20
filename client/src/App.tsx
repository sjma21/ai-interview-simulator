import { useState } from "react";
import { useInterview } from "./hooks/useInterview";
import LandingPage from "./pages/LandingPage";
import InterviewPage from "./pages/InterviewPage";
import EndScreen from "./pages/EndScreen";
import LearnPage from "./pages/LearnPage";
import AssistantPage from "./pages/AssistantPage";
import CodingPage from "./pages/CodingPage";
import RealInterviewPage from "./pages/RealInterviewPage";

type AppMode = "landing" | "interview" | "learn" | "assistant" | "coding" | "real-interview";

export default function App() {
  const [mode, setMode] = useState<AppMode>("landing");

  const {
    state,
    totalQuestions,
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
  } = useInterview();

  if (mode === "learn") {
    return <LearnPage onBack={() => setMode("landing")} />;
  }

  if (mode === "assistant") {
    return <AssistantPage onBack={() => setMode("landing")} />;
  }

  if (mode === "coding") {
    return <CodingPage onBack={() => setMode("landing")} />;
  }

  if (mode === "real-interview") {
    return <RealInterviewPage onBack={() => setMode("landing")} />;
  }

  if (mode === "landing" || state.phase === "landing") {
    return (
      <LandingPage
        onStart={(config) => {
          setMode("interview");
          startInterview(config);
        }}
        onLearn={() => setMode("learn")}
        onAssistant={() => setMode("assistant")}
        onCoding={() => setMode("coding")}
        onRealInterview={() => setMode("real-interview")}
      />
    );
  }

  if (state.phase === "end") {
    return (
      <EndScreen
        scores={state.scores}
        domain={state.config!.domain}
        difficulty={state.config!.difficulty}
        onRestart={() => {
          resetInterview();
          setMode("landing");
        }}
      />
    );
  }

  return (
    <InterviewPage
      config={state.config!}
      messages={state.messages}
      questionNumber={state.questionNumber}
      totalQuestions={totalQuestions}
      scores={state.scores}
      loading={state.loading}
      loadingText={state.loadingText}
      lastMessageIsQuestion={lastMessageIsQuestion}
      lastMessageIsFeedback={lastMessageIsFeedback}
      isLastQuestion={isLastQuestion}
      onSubmitAnswer={submitAnswer}
      onNextQuestion={nextQuestion}
      onEndInterview={endInterview}
      onRequestHint={requestHint}
      hintUsedThisQuestion={hintUsedThisQuestion}
      hintLoading={hintLoading}
    />
  );
}
