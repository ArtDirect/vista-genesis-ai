import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import vizWorkspace from "@/assets/viz-workspace.jpg";
import vizSpeaking from "@/assets/viz-speaking.jpg";
import vizPeaceful from "@/assets/viz-peaceful.jpg";
import vizGallery from "@/assets/viz-gallery.jpg";

const steps = [
  "Crafting your manifestation script...",
  "Generating affirmation audio...",
  "Creating visualization scenes...",
];

const GeneratingScreen = () => {
  const { setStep, setManifestationScript, setScenes } = useAppStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setManifestationScript(
        "You wake up calm and energized.\nThe morning light warms your face as you step into your workspace overlooking the ocean.\n\nYour work feels meaningful.\nYour ideas are turning into successful projects that impact thousands of lives.\n\nYou speak with confidence and clarity.\nPeople are drawn to your vision and your presence commands respect.\n\nYou live with freedom and purpose.\nEvery day feels like a step closer to the extraordinary life you've designed."
      );
      setScenes([
        { id: "1", src: vizWorkspace, title: "Your Dream Workspace", favorited: false },
        { id: "2", src: vizSpeaking, title: "Confident Speaking", favorited: false },
        { id: "3", src: vizPeaceful, title: "Peaceful Living", favorited: false },
        { id: "4", src: vizGallery, title: "Inspiration Gallery", favorited: false },
      ]);
      setStep("script");
    }, 4500);
    return () => clearTimeout(timer);
  }, [setStep, setManifestationScript, setScenes]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-[100dvh] flex-col items-center justify-center gradient-ocean px-8"
    >
      {/* Glowing orb */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="mb-12 h-32 w-32 rounded-full gradient-sunrise opacity-50 blur-xl"
      />

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8 text-center text-2xl font-semibold text-foreground"
      >
        Designing your future
        <br />
        <span className="italic text-gradient-sunrise">visualization</span>
      </motion.h2>

      <div className="w-full max-w-xs space-y-3">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 + i * 1.2 }}
            className="flex items-center gap-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.3 + i * 1.2 }}
              className="h-2 w-2 rounded-full gradient-sunrise"
            />
            <p className="text-sm text-muted-foreground">{step}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default GeneratingScreen;
