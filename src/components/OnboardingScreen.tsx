import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import heroImage from "@/assets/hero-sunrise.jpg";
import { useAppStore } from "@/lib/store";
import { Sparkles, Heart, Briefcase, Leaf, Compass, PenLine } from "lucide-react";

const categories = [
  { id: "success", label: "Success", icon: Sparkles },
  { id: "health", label: "Health", icon: Heart },
  { id: "wealth", label: "Wealth", icon: Briefcase },
  { id: "freedom", label: "Freedom", icon: Compass },
  { id: "wellness", label: "Wellness", icon: Leaf },
  { id: "custom", label: "Custom", icon: PenLine },
];

const OnboardingScreen = () => {
  const { setStep, setDreamCategory } = useAppStore();
  const [subStep, setSubStep] = useState<"welcome" | "category">("welcome");
  const [selected, setSelected] = useState<string | null>(null);

  const handleCategoryNext = () => {
    if (selected) {
      setDreamCategory(selected);
      setStep("dream-capture");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
      className="relative flex min-h-[100dvh] flex-col items-center justify-end overflow-hidden"
    >
      <div className="absolute inset-0">
        <img src={heroImage} alt="Calm sunrise" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <AnimatePresence mode="wait">
        {subStep === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-10 flex flex-col items-center px-8 pb-16 text-center"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mb-3 text-sm font-medium tracking-[0.3em] uppercase text-secondary"
            >
              ManifestFlow
            </motion.p>

            <h1 className="mb-4 text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
              Speak Your Dreams.
              <br />
              <span className="text-gradient-sunrise italic">Listen To Your Future.</span>
            </h1>

            <p className="mb-10 max-w-xs text-base leading-relaxed text-muted-foreground">
              Turn your desires into powerful manifestation audio you can listen to every day.
            </p>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSubStep("category")}
              className="w-full max-w-xs rounded-2xl gradient-sunrise px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg glow-coral transition-all animate-breathe"
            >
              Create My Manifestation
            </motion.button>

            <p className="mt-6 text-xs text-muted-foreground/60">
              Speak your dreams. Listen to your future.
            </p>
          </motion.div>
        )}

        {subStep === "category" && (
          <motion.div
            key="category"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 flex w-full flex-col items-center px-8 pb-16 text-center"
          >
            <p className="mb-2 text-xs font-medium tracking-[0.3em] uppercase text-secondary">
              Step 1 of 2
            </p>
            <h2 className="mb-2 text-2xl font-semibold text-foreground">
              What do you want
              <br />
              <span className="italic text-gradient-sunrise">to manifest?</span>
            </h2>
            <p className="mb-8 text-sm text-muted-foreground">
              Choose a focus for your manifestation
            </p>

            <div className="grid w-full max-w-xs grid-cols-2 gap-3 mb-8">
              {categories.map((cat, i) => (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  onClick={() => setSelected(cat.id)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-5 transition-all ${
                    selected === cat.id
                      ? "border-primary bg-primary/10 glow-coral"
                      : "border-border/50 bg-card/60 hover:border-primary/30"
                  }`}
                >
                  <cat.icon className={`h-6 w-6 ${selected === cat.id ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-medium ${selected === cat.id ? "text-foreground" : "text-muted-foreground"}`}>
                    {cat.label}
                  </span>
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCategoryNext}
              disabled={!selected}
              className="w-full max-w-xs rounded-2xl gradient-sunrise px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg glow-coral transition-all disabled:opacity-40 disabled:shadow-none"
            >
              Continue
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OnboardingScreen;
