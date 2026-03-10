import { useState } from "react";
import { motion } from "framer-motion";
import { Sun, CloudSun, Moon, Flame, MessageSquare, RotateCcw, Play, Eye } from "lucide-react";
import { useAppStore, logEvent } from "@/lib/store";

const DailyRitualScreen = () => {
  const { streak, completeRitual, resetApp, setStep } = useAppStore();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  const sendFeedback = () => {
    if (!feedback.trim()) return;
    logEvent('feedback_submitted', { text: feedback.slice(0, 500) });
    setFeedbackSent(true);
    setFeedback("");
    setTimeout(() => { setShowFeedback(false); setFeedbackSent(false); }, 2000);
  };

  const handleReset = () => {
    if (window.confirm("Reset all data and start over? This is for testing purposes.")) {
      resetApp();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-[100dvh] px-6 pb-28 pt-14"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="mb-1 text-2xl font-serif">Your Daily Future Ritual</h1>
        <p className="text-sm text-muted-foreground">
          Day {streak || 1} of your visualization ritual.
        </p>
      </motion.div>

      {/* Streak */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
          <Flame className="h-5 w-5 text-accent-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Streak: {streak || 1} day{(streak || 1) > 1 ? 's' : ''}</p>
          <p className="text-xs text-muted-foreground">Keep it going!</p>
        </div>
      </motion.div>

      {/* Ritual Cards */}
      <div className="space-y-3">
        {/* Morning */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-2">
            <Sun className="h-5 w-5 text-primary" />
            <h3 className="text-base font-serif">Morning</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { completeRitual('morning'); logEvent('morning_affirmation_played'); }}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm"
            >
              <Play className="h-3.5 w-3.5" /> Play Affirmation
            </button>
            <button
              onClick={() => setStep("gallery")}
              className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm text-foreground"
            >
              <Eye className="h-3.5 w-3.5" /> View Visuals
            </button>
          </div>
        </motion.div>

        {/* Midday */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-2">
            <CloudSun className="h-5 w-5 text-primary" />
            <h3 className="text-base font-serif">Midday</h3>
          </div>
          <p className="mb-3 text-sm text-muted-foreground italic">
            "Your future self is already proud of you."
          </p>
          <button
            onClick={() => { completeRitual('midday'); logEvent('midday_completed'); }}
            className="rounded-lg border border-border px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
          >
            Mark Complete
          </button>
        </motion.div>

        {/* Night */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-2">
            <Moon className="h-5 w-5 text-primary" />
            <h3 className="text-base font-serif">Night</h3>
          </div>
          <button
            onClick={() => { completeRitual('night'); logEvent('night_affirmation_played'); }}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm"
          >
            <Play className="h-3.5 w-3.5" /> Play Sleep Affirmation
          </button>
        </motion.div>
      </div>

      {/* Feedback */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-8"
      >
        {!showFeedback ? (
          <button
            onClick={() => setShowFeedback(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageSquare className="h-4 w-4" /> Send Feedback
          </button>
        ) : (
          <div className="rounded-xl border border-border bg-card p-4">
            {feedbackSent ? (
              <p className="text-center text-sm text-primary font-medium">Thank you for your feedback! 🙏</p>
            ) : (
              <>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what you think…"
                  rows={3}
                  className="mb-3 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="flex gap-2">
                  <button onClick={sendFeedback} className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">
                    Send
                  </button>
                  <button onClick={() => setShowFeedback(false)} className="rounded-lg border border-border px-4 py-2 text-xs text-muted-foreground">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </motion.div>

      {/* Reset (for testing) */}
      <div className="mt-6 text-center">
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          <RotateCcw className="h-3 w-3" /> Reset for testing
        </button>
      </div>
    </motion.div>
  );
};

export default DailyRitualScreen;
