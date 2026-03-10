import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAppStore, logEvent } from "@/lib/store";

const OnboardingScreen = () => {
  const setStep = useAppStore((s) => s.setStep);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent"
      >
        <span className="text-3xl">✨</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="mb-4 text-3xl font-serif md:text-4xl"
      >
        Design Your Future Self
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="mb-12 max-w-sm text-base text-muted-foreground leading-relaxed"
      >
        Turn your dreams into visual experiences you can see, hear, and feel every day.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          logEvent('onboarding_complete');
          setStep("dream-capture");
        }}
        className="flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-lg shadow-primary/20 animate-breathe"
      >
        Start Visualizing
        <ArrowRight className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
};

export default OnboardingScreen;
