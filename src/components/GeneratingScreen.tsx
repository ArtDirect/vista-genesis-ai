import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import vizFutureHome from "@/assets/viz-future-home.jpg";
import vizHorizon from "@/assets/viz-horizon.jpg";
import vizReflection from "@/assets/viz-reflection.jpg";
import vizPeaceful from "@/assets/viz-peaceful.jpg";
import vizSpeaking from "@/assets/viz-speaking.jpg";

const loadingSteps = [
  "Listening to your dream…",
  "Writing your manifestation script…",
  "Creating your affirmation audio…",
  "Generating visualization scenes…",
];

const GeneratingScreen = () => {
  const { setStep, setManifestationScript, setScenes } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((s) => {
        if (s < loadingSteps.length - 1) return s + 1;
        return s;
      });
    }, 1200);

    const timer = setTimeout(() => {
      clearInterval(interval);
      setManifestationScript(
        "I am building a successful business that brings me complete financial freedom. Opportunities flow to me every day and my work creates real value for the world.\n\nI wake up each morning in my beautiful home near the ocean, feeling energized, confident, and deeply grateful.\n\nI travel freely, I create boldly, and I live a life designed entirely on my own terms.\n\nThis is my reality. I see it clearly. I feel it completely."
      );
      setScenes([
        { id: "1", src: vizFutureHome, title: "My Dream Home", tag: "lifestyle", favorited: false },
        { id: "2", src: vizHorizon, title: "Infinite Possibilities", tag: "mindset", favorited: false },
        { id: "3", src: vizReflection, title: "Inner Clarity", tag: "wellness", favorited: false },
        { id: "4", src: vizPeaceful, title: "Morning Peace", tag: "ritual", favorited: false },
        { id: "5", src: vizSpeaking, title: "Confident Voice", tag: "career", favorited: false },
      ]);
      setStep("script");
    }, 5000);

    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [setStep, setManifestationScript, setScenes]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="flex min-h-[100dvh] flex-col items-center justify-center px-8"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="mb-12 h-24 w-24 rounded-full bg-primary/20 blur-2xl"
      />

      <h2 className="mb-8 text-center text-2xl font-serif">
        Creating your future visualization…
      </h2>

      <div className="w-full max-w-xs space-y-3">
        {loadingSteps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: i <= currentStep ? 1 : 0.3, x: 0 }}
            transition={{ delay: i * 0.3, duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className={`h-2 w-2 rounded-full transition-colors ${i <= currentStep ? 'bg-primary' : 'bg-muted'}`} />
            <p className="text-sm text-muted-foreground">{step}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default GeneratingScreen;
