import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, ArrowRight, Keyboard } from "lucide-react";
import { useAppStore, logEvent } from "@/lib/store";

const placeholders = [
  "I run a successful company.",
  "I live near the ocean.",
  "I feel confident speaking in public.",
  "I wake up every morning excited about my work.",
];

const DreamCaptureScreen = () => {
  const { setStep, setDreamText, dreamText } = useAppStore();
  const [isRecording, setIsRecording] = useState(false);
  const [showText, setShowText] = useState(false);
  const [localText, setLocalText] = useState(dreamText);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      // Mock: simulate voice capture
      const mock = "I want financial freedom and a successful business that lets me live near the ocean and travel the world.";
      setLocalText(mock);
      setShowText(true);
      setRecordingTime(0);
    } else {
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    }
  };

  const handleContinue = () => {
    if (!localText.trim()) return;
    setDreamText(localText);
    logEvent('dream_captured', { method: showText ? 'text' : 'voice', length: localText.length });
    setStep("generating");
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="flex min-h-[100dvh] flex-col px-6 pt-16 pb-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-8 text-center"
      >
        <h2 className="mb-3 text-2xl font-serif">
          Describe the life you want to create.
        </h2>
        <p className="text-sm text-muted-foreground">
          Speak or type — let your imagination flow
        </p>
      </motion.div>

      {/* Placeholder prompts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mb-6 space-y-2"
      >
        {placeholders.map((p, i) => (
          <button
            key={i}
            onClick={() => { setLocalText(p); setShowText(true); }}
            className="block w-full rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            "{p}"
          </button>
        ))}
      </motion.div>

      <div className="flex-1" />

      {/* Text area */}
      {showText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <textarea
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            placeholder="Describe the life you imagine..."
            rows={4}
            className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {!showText && (
          <button
            onClick={() => setShowText(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          >
            <Keyboard className="h-5 w-5" />
          </button>
        )}

        <button
          onClick={toggleRecording}
          className={`flex h-20 w-20 items-center justify-center rounded-full transition-all ${
            isRecording
              ? "bg-destructive text-destructive-foreground animate-breathe shadow-lg shadow-destructive/30"
              : "border-2 border-primary/30 bg-card text-primary hover:border-primary/50"
          }`}
        >
          {isRecording ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
        </button>

        {localText.trim() && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleContinue}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          >
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        {isRecording ? `Recording… ${formatTime(recordingTime)}` : "Tap the mic to speak your dream"}
      </p>

      {isRecording && (
        <div className="mt-3 flex justify-center gap-3">
          <button onClick={toggleRecording} className="rounded-full border border-border px-4 py-2 text-xs text-muted-foreground">
            Re-record
          </button>
          <button
            onClick={() => { toggleRecording(); }}
            className="rounded-full bg-primary px-4 py-2 text-xs text-primary-foreground"
          >
            Use this
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default DreamCaptureScreen;
