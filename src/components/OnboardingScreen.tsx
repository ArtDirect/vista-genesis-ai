import { motion } from "framer-motion";
import heroImage from "@/assets/hero-sunrise.jpg";
import { useAppStore } from "@/lib/store";

const OnboardingScreen = () => {
  const setStep = useAppStore((s) => s.setStep);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
      className="relative flex min-h-[100dvh] flex-col items-center justify-end overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Ocean sunrise"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative z-10 flex flex-col items-center px-8 pb-16 text-center"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mb-3 text-sm font-medium tracking-[0.3em] uppercase text-gold"
        >
          FutureSelf
        </motion.p>

        <h1 className="mb-4 text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
          Design Your
          <br />
          <span className="text-gradient-sunrise italic">Future Self</span>
        </h1>

        <p className="mb-10 max-w-xs text-base leading-relaxed text-muted-foreground">
          Turn your dreams into visual experiences you can see, hear, and feel
          every day.
        </p>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setStep("dream-capture")}
          className="w-full max-w-xs rounded-2xl gradient-sunrise px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg glow-coral transition-all"
        >
          Start Visualizing
        </motion.button>

        <p className="mt-6 text-xs text-muted-foreground/60">
          Your private future visualization studio
        </p>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingScreen;
