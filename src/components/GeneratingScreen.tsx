import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import vizFutureHome from "@/assets/viz-future-home.jpg";
import vizHorizon from "@/assets/viz-horizon.jpg";
import vizReflection from "@/assets/viz-reflection.jpg";
import vizPeaceful from "@/assets/viz-peaceful.jpg";

const steps = [
  "Listening to your dream...",
  "Shaping your visualization...",
  "Preparing your experience...",
];

const GeneratingScreen = () => {
  const { setStep, setManifestationScript, setScenes } = useAppStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setManifestationScript(
        "I wake up in my beautiful home by the ocean, sunlight streaming through the windows.\n\nI feel deeply grateful for the life I've created — a life of creative freedom, abundance, and purpose.\n\nEvery day, I step into my work with clarity and confidence. Opportunities find me effortlessly.\n\nI am calm, focused, and aligned with the future I've designed.\n\nThis is my life. I see it clearly. I feel it completely."
      );
      setScenes([
        { id: "1", src: vizFutureHome, title: "Morning Light", favorited: false },
        { id: "2", src: vizHorizon, title: "Infinite Horizon", favorited: false },
        { id: "3", src: vizReflection, title: "Quiet Clarity", favorited: false },
        { id: "4", src: vizPeaceful, title: "Inner Stillness", favorited: false },
      ]);
      setStep("script");
    }, 5000);
    return () => clearTimeout(timer);
  }, [setStep, setManifestationScript, setScenes]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="flex min-h-[100dvh] flex-col items-center justify-center gradient-twilight px-8"
    >
      {/* Ambient glow */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="mb-16 h-40 w-40 rounded-full gradient-dawn opacity-30 blur-3xl"
      />

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1.5 }}
        className="mb-10 text-center text-2xl font-medium text-foreground"
      >
        Your future is
        <br />
        <span className="italic text-gradient-dawn">emerging</span>
      </motion.h2>

      <div className="w-full max-w-xs space-y-4">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5 + i * 1.3, duration: 1 }}
            className="flex items-center gap-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.8 + i * 1.3, duration: 0.6 }}
              className="h-1.5 w-1.5 rounded-full gradient-dawn"
            />
            <p className="text-sm text-muted-foreground/70">{step}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default GeneratingScreen;
