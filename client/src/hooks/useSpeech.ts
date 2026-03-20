import { useState, useCallback, useRef } from "react";

// ── Text-to-Speech ────────────────────────────────────────────────────────────
export function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) { onEnd?.(); return; }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Prefer a natural-sounding English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Google") ||
          v.name.includes("Samantha") ||
          v.name.includes("Daniel") ||
          v.name.includes("Alex"))
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend  = () => { setSpeaking(false); onEnd?.(); };
    utterance.onerror = () => { setSpeaking(false); onEnd?.(); };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  return { speak, stop, speaking, supported };
}

// ── Speech-to-Text ────────────────────────────────────────────────────────────
type STTStatus = "idle" | "listening" | "error" | "unsupported";

export function useSTT(onTranscript: (text: string) => void) {
  const [status, setStatus] = useState<STTStatus>("idle");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const SpeechRecognitionClass =
    typeof window !== "undefined"
      ? (window.SpeechRecognition ??
         (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition)
      : null;

  const supported = !!SpeechRecognitionClass;

  const startListening = useCallback(() => {
    if (!SpeechRecognitionClass) {
      setStatus("unsupported");
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onstart = () => setStatus("listening");

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscript += t + " ";
        } else {
          interim = t;
        }
      }
      onTranscript((finalTranscript + interim).trim());
    };

    recognition.onerror = () => {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    };

    recognition.onend = () => {
      setStatus("idle");
      finalTranscript = "";
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [SpeechRecognitionClass, onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setStatus("idle");
  }, []);

  const toggle = useCallback(() => {
    if (status === "listening") {
      stopListening();
    } else {
      startListening();
    }
  }, [status, startListening, stopListening]);

  return { toggle, stopListening, status, supported };
}
