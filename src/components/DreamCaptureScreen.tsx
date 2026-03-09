import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, ArrowRight, Keyboard } from "lucide-react";
import { useAppStore } from "@/lib/store";

const placeholders = [
  "I run a successful company.",
  "I live near the ocean.",
  "I feel confident speaking in public.",
  "I wake up every day excited about my work.",
];

const DreamCaptureScreen = () => {
  const { setStep, setDreamText, dreamText } = useAppStore();
  const [isRecording, setIsRecording] = useState(false);
  const [showText, setShowText] = useState(false);
  const [localText, setLocalText] = useState(dreamText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Mock transcription
      const mock = "I want to build a successful business that gives me freedom to travel the world. I wake up every morning excited and energized. I live in a beautiful home near the ocean.";
      setLocalText(mock);
    } else {
      setIsRecording(true);
    }
  };

  const handleContinue = () => {
    if (!localText.trim()) return;
    setDreamText(localText);
    setStep("generating");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="flex min-h-[100dvh] flex-col gradient-ocean px-6 pt-16 pb-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8 text-center"
      >
        <p className="mb-2 text-xs font-medium tracking-[0.3em] uppercase text-gold">
          Dream Capture
        </p>
        <h2 className="mb-3 text-3xl font-semibold text-foreground">
          Describe the life
          <br />
          <span className="italic text-gradient-sunrise">you want to live in 3 years</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Speak or type your vision for the future
        </p>
      </motion.div>

      {/* Placeholder prompts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mb-8 space-y-2"
      >
        {placeholders.map((p, i) => (
          <button
            key={i}
            onClick={() => { setLocalText(p); setShowText(true); }}
            className="block w-full rounded-xl border border-border/50 bg-card/50 px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            "{p}"
          </button>
        ))}
      </motion.div>

      <div className="flex-1" />

      {/* Text input area */}
      {showText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <textarea
            ref={textareaRef}
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            placeholder="Describe the life you want to create..."
            rows={4}
            className="w-full resize-none rounded-xl border border-border bg-card/80 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {!showText && (
          <button
            onClick={() => setShowText(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card/50 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Keyboard className="h-5 w-5" />
          </button>
        )}

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleRecording}
          className={`flex h-20 w-20 items-center justify-center rounded-full transition-all ${
            isRecording
              ? "gradient-sunrise glow-coral animate-pulse-glow"
              : "border-2 border-primary/40 bg-card/50 text-primary hover:border-primary"
          }`}
        >
          {isRecording ? (
            <MicOff className="h-7 w-7 text-primary-foreground" />
          ) : (
            <Mic className="h-7 w-7" />
          )}
        </motion.button>

        {localText.trim() && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleContinue}
            className="flex h-12 w-12 items-center justify-center rounded-full gradient-sunrise text-primary-foreground glow-coral"
          >
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground/50">
        {isRecording ? "Recording... tap to stop" : "Tap the mic to record your dream"}
      </p>
    </motion.div>
  );
};

export default DreamCaptureScreen;
