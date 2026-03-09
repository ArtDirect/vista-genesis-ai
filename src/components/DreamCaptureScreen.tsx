import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, ArrowRight, Keyboard } from "lucide-react";
import { useAppStore } from "@/lib/store";

const prompts = [
  "I live in a beautiful home overlooking the ocean.",
  "I wake up every morning with complete creative freedom.",
  "I travel the world and work from wherever I choose.",
  "I feel deeply connected to the people I love.",
];

const slow = { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] };

const DreamCaptureScreen = () => {
  const { setStep, setDreamText, dreamText } = useAppStore();
  const [isRecording, setIsRecording] = useState(false);
  const [showText, setShowText] = useState(false);
  const [localText, setLocalText] = useState(dreamText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      const mock = "I live in a beautiful home by the ocean, running a creative business that gives me complete freedom. I wake up every morning feeling abundant, inspired, and deeply connected to the life I've designed.";
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
      transition={{ duration: 1 }}
      className="flex min-h-[100dvh] flex-col gradient-twilight px-6 pt-16 pb-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ...slow }}
        className="mb-10 text-center"
      >
        <p className="mb-3 text-xs font-medium tracking-[0.4em] uppercase text-secondary/60">
          Imagination capture
        </p>
        <h2 className="mb-4 text-3xl font-medium text-foreground">
          Describe the life
          <br />
          <span className="italic text-gradient-dawn">you want to see.</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Speak or type — let your imagination flow
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="mb-8 space-y-2.5"
      >
        {prompts.map((p, i) => (
          <button
            key={i}
            onClick={() => { setLocalText(p); setShowText(true); }}
            className="block w-full rounded-xl border border-border/30 bg-card/30 px-4 py-3.5 text-left text-sm text-muted-foreground/80 transition-all duration-500 hover:border-primary/20 hover:text-foreground hover:bg-card/50"
          >
            "{p}"
          </button>
        ))}
      </motion.div>

      <div className="flex-1" />

      {showText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={slow}
          className="mb-6"
        >
          <textarea
            ref={textareaRef}
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            placeholder="Describe the life you imagine..."
            rows={4}
            className="w-full resize-none rounded-xl border border-border/30 bg-card/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30 backdrop-blur-sm"
          />
        </motion.div>
      )}

      <div className="flex items-center justify-center gap-4">
        {!showText && (
          <button
            onClick={() => setShowText(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border/30 bg-card/30 text-muted-foreground transition-all duration-500 hover:text-foreground hover:border-primary/20"
          >
            <Keyboard className="h-5 w-5" />
          </button>
        )}

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={toggleRecording}
          className={`flex h-20 w-20 items-center justify-center rounded-full transition-all duration-700 ${
            isRecording
              ? "gradient-dawn glow-sunrise animate-pulse-glow"
              : "border-2 border-primary/30 bg-card/30 text-primary hover:border-primary/50"
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
            whileTap={{ scale: 0.92 }}
            onClick={handleContinue}
            className="flex h-12 w-12 items-center justify-center rounded-full gradient-dawn text-primary-foreground glow-sunrise"
          >
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        )}
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground/40">
        {isRecording ? "Listening... tap to stop" : "Tap the mic to speak your dream"}
      </p>
    </motion.div>
  );
};

export default DreamCaptureScreen;
