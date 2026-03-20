import { useState, useRef, useEffect, useCallback } from "react";
import { useSTT } from "../hooks/useSpeech";

interface ChatInputProps {
  onSubmit: (answer: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // STT — live transcript appends into the textarea
  const handleTranscript = useCallback((transcript: string) => {
    setValue(transcript);
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, []);

  const { toggle: toggleMic, status: micStatus, supported: micSupported } = useSTT(handleTranscript);
  const isListening = micStatus === "listening";

  useEffect(() => {
    if (!disabled && !isListening && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled, isListening]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    // Stop mic if still running before submitting
    if (isListening) toggleMic();
    onSubmit(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const hasContent = value.trim().length > 0;
  const charCount = value.length;

  return (
    <div className="border-t border-white/5 bg-[#0d0d14] px-5 py-4">
      {/* Mic listening banner */}
      {isListening && (
        <div className="flex items-center gap-3 mb-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <p className="text-xs text-red-300 font-medium flex-1">Listening... speak your answer</p>
          <button
            onClick={toggleMic}
            className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer"
          >
            Stop
          </button>
        </div>
      )}

      {micStatus === "error" && (
        <div className="mb-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-xs text-red-400">Microphone error — check browser permissions.</p>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Mic button */}
        {micSupported && (
          <button
            onClick={toggleMic}
            disabled={disabled}
            title={isListening ? "Stop recording" : "Speak your answer"}
            className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isListening
                ? "bg-red-500 shadow-lg shadow-red-900/50 animate-pulse"
                : "bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10"
            }`}
          >
            <svg
              className={`w-4 h-4 transition-colors ${isListening ? "text-white" : "text-slate-400"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isListening ? (
                // Stop square icon
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10h6v4H9z" />
              ) : (
                // Mic icon
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              )}
            </svg>
          </button>
        )}

        {/* Textarea */}
        <div className={`flex-1 relative rounded-2xl border transition-all duration-200 ${
          disabled
            ? "border-white/5 bg-white/[0.02]"
            : isListening
            ? "border-red-500/30 bg-[#13131a]"
            : hasContent
            ? "border-indigo-500/50 bg-[#13131a] shadow-lg shadow-indigo-900/20"
            : "border-white/10 bg-[#13131a] focus-within:border-indigo-500/50"
        }`}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            disabled={disabled}
            placeholder={
              isListening
                ? "Listening to your voice..."
                : disabled
                ? "Waiting..."
                : "Type your answer or use the mic..."
            }
            className="w-full resize-none bg-transparent px-4 py-3.5 pr-14 text-sm text-slate-200 placeholder-slate-600 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed max-h-40"
          />
          {charCount > 0 && (
            <span className="absolute right-3 bottom-3 text-xs text-slate-600 tabular-nums">
              {charCount}
            </span>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={handleSubmit}
          disabled={disabled || !hasContent}
          className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
            hasContent && !disabled
              ? "bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60 hover:scale-105 active:scale-95"
              : "bg-white/5 border border-white/10 cursor-not-allowed"
          }`}
        >
          <svg
            className={`w-4 h-4 transition-colors ${hasContent && !disabled ? "text-white" : "text-slate-600"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between mt-2 px-1">
        <p className="text-xs text-slate-700">
          {disabled
            ? "⏳ Waiting for the interviewer..."
            : isListening
            ? "🎙️ Speaking mode active — mic transcribes live"
            : micSupported
            ? "↵ Enter to submit · Shift+Enter for new line · 🎙️ Mic to speak"
            : "↵ Enter to submit · Shift+Enter for new line"}
        </p>
      </div>
    </div>
  );
}
