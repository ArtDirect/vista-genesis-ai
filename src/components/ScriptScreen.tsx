import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import AudioPlayer from "./AudioPlayer";
import BackgroundSoundPicker from "./BackgroundSoundPicker";

const ScriptScreen = () => {
  const { manifestationScript, setManifestationScript, setStep } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(manifestationScript);

  const handleSave = () => {
    setManifestationScript(editText);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[100dvh] gradient-ocean px-6 pb-24 pt-14"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-center"
      >
        <p className="mb-1 text-xs font-medium tracking-[0.3em] uppercase text-gold">
          Your Manifestation
        </p>
        <h2 className="text-2xl font-semibold text-foreground">
          <span className="italic text-gradient-sunrise">Your Manifestation Script</span>
        </h2>
      </motion.div>

      {/* Script Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative mb-6 rounded-2xl border border-border/50 bg-card/80 p-6 backdrop-blur-sm"
      >
        <Sparkles className="absolute right-4 top-4 h-4 w-4 text-gold" />

        {isEditing ? (
          <>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={8}
              className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground/90 focus:outline-none"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleSave}
                className="rounded-lg gradient-sunrise px-4 py-2 text-xs font-medium text-primary-foreground"
              >
                Save
              </button>
              <button
                onClick={() => { setIsEditing(false); setEditText(manifestationScript); }}
                className="rounded-lg border border-border px-4 py-2 text-xs text-muted-foreground"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90 font-serif italic">
              {manifestationScript}
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-primary hover:underline"
              >
                Edit script
              </button>
              <button
                onClick={() => {}}
                className="text-xs text-muted-foreground hover:underline"
              >
                Regenerate
              </button>
            </div>
          </>
        )}
      </motion.div>

      {/* Background Sound Picker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-6"
      >
        <BackgroundSoundPicker />
      </motion.div>

      {/* Audio Player */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-8"
      >
        <AudioPlayer />
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setStep("ritual")}
        className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-sunrise px-8 py-4 text-base font-semibold text-primary-foreground glow-coral"
      >
        Start Listening
        <ArrowRight className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
};

export default ScriptScreen;
