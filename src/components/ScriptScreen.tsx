import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import AudioPlayer from "./AudioPlayer";
import BackgroundSoundPicker from "./BackgroundSoundPicker";

const slow = { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] as const };

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
      transition={{ duration: 1 }}
      className="min-h-[100dvh] gradient-twilight px-6 pb-24 pt-14"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ...slow }}
        className="mb-8 text-center"
      >
        <p className="mb-2 text-xs font-medium tracking-[0.4em] uppercase text-secondary/60">
          Your visualization
        </p>
        <h2 className="text-2xl font-medium text-foreground">
          <span className="italic text-gradient-dawn">Your imagined future</span>
        </h2>
      </motion.div>

      {/* Script Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, ...slow }}
        className="relative mb-6 rounded-2xl border border-border/30 bg-card/40 p-6 backdrop-blur-sm"
      >
        <Sparkles className="absolute right-4 top-4 h-4 w-4 text-gold/60" />

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
                className="rounded-lg gradient-dawn px-4 py-2 text-xs font-medium text-primary-foreground"
              >
                Save
              </button>
              <button
                onClick={() => { setIsEditing(false); setEditText(manifestationScript); }}
                className="rounded-lg border border-border/30 px-4 py-2 text-xs text-muted-foreground"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="whitespace-pre-line text-sm leading-[1.9] text-foreground/80 font-serif italic">
              {manifestationScript}
            </p>
            <div className="mt-5 flex gap-4">
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-primary/80 hover:text-primary transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => {}}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
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
        transition={{ delay: 0.9, ...slow }}
        className="mb-6"
      >
        <BackgroundSoundPicker />
      </motion.div>

      {/* Audio Player */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, ...slow }}
        className="mb-8"
      >
        <AudioPlayer />
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, ...slow }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setStep("ritual")}
        className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-dawn px-8 py-4 text-base font-medium text-primary-foreground glow-sunrise"
      >
        Start your daily ritual
        <ArrowRight className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
};

export default ScriptScreen;
