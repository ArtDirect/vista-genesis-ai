import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/events";

const ThanksPage = () => {
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [submissionId] = useState(() => sessionStorage.getItem("mf_submission_id"));
  const [email] = useState(() => sessionStorage.getItem("mf_email"));

  useEffect(() => {
    trackEvent("page_view", "/thanks", submissionId);
  }, [submissionId]);

  const sendFeedback = async () => {
    if (!feedbackText.trim()) return;
    await supabase.from("feedback").insert({
      submission_id: submissionId,
      email,
      feedback_text: feedbackText.trim(),
    });
    setFeedbackSent(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-md w-full text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent">
          <Check className="h-8 w-8 text-accent-foreground" />
        </div>

        <h1 className="mb-3 text-3xl font-serif">You're in. We're crafting your audio.</h1>
        <p className="mb-8 text-muted-foreground leading-relaxed">
          We'll perfect your words and generate your audio track. You'll receive it at{" "}
          <strong className="text-foreground">{email || "your email"}</strong> within 24 hours.
        </p>

        {/* Feedback */}
        <div className="rounded-xl border border-border bg-card p-4 text-left">
          <p className="text-sm font-medium mb-2">Any feedback for us?</p>
          {feedbackSent ? (
            <p className="text-sm text-muted-foreground">Thanks for the feedback! 🙏</p>
          ) : (
            <>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="How was the experience? What would make it better?"
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 mb-2"
              />
              <button
                onClick={sendFeedback}
                disabled={!feedbackText.trim()}
                className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                <Send className="h-3 w-3" /> Send Feedback
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ThanksPage;
