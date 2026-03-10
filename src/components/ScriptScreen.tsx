import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Pencil } from "lucide-react";
import { useAppStore, logEvent } from "@/lib/store";

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
      transition={{ duration: 0.6 }}
      className="flex min-h-[100dvh] flex-col px-6 pt-14 pb-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-6 text-center"
      >
        <h2 className="mb-2 text-2xl font-serif">Your Manifestation Script</h2>
        <p className="text-sm text-muted-foreground">You can edit this to sound more like you.</p>
      </motion.div>

      {/* Script Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        {isEditing ? (
          <>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={10}
              className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground focus:outline-none"
            />
            <div className="mt-4 flex gap-2">
              <button onClick={handleSave} className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">
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
            <p className="whitespace-pre-line text-sm leading-[1.8] text-foreground/80 font-serif italic">
              {manifestationScript}
            </p>
            <div className="mt-5 flex gap-4">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Pencil className="h-3 w-3" /> Edit
              </button>
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Regenerate
              </button>
            </div>
          </>
        )}
      </motion.div>

      <div className="flex-1" />

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          logEvent('script_confirmed');
          setStep("audio");
        }}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-lg shadow-primary/20"
      >
        Generate My Visualization
        <ArrowRight className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
};

export default ScriptScreen;
