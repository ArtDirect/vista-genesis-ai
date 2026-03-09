import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import vizWorkspace from "@/assets/viz-workspace.jpg";
import vizSpeaking from "@/assets/viz-speaking.jpg";
import vizPeaceful from "@/assets/viz-peaceful.jpg";
import vizGallery from "@/assets/viz-gallery.jpg";

const steps = [
  "Crafting your manifestation script...",
  "Generating audio affirmation...",
  "Preparing your listening experience...",
];

const GeneratingScreen = () => {
  const { setStep, setManifestationScript, setScenes } = useAppStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setManifestationScript(
        "I am building a successful business that brings me complete financial freedom.\n\nOpportunities flow to me every day and my work creates massive value for the world.\n\nI am confident, focused, and aligned with abundance.\n\nMoney comes to me easily and I manage it wisely.\n\nEvery day I am becoming the best version of myself."
      );
      setScenes([
        { id: "1", src: vizWorkspace, title: "Abundance Mindset", favorited: false },
        { id: "2", src: vizSpeaking, title: "Confident Expression", favorited: false },
        { id: "3", src: vizPeaceful, title: "Inner Peace", favorited: false },
        { id: "4", src: vizGallery, title: "Inspiration", favorited: false },
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
        Creating your
        <br />
        <span className="italic text-gradient-sunrise">manifestation</span>
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
