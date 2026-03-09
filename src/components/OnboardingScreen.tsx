import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import heroDawn from "@/assets/hero-dawn.jpg";
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

const slow = { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] as const };

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
      transition={{ duration: 1.5 }}
      className="relative flex min-h-[100dvh] flex-col items-center justify-end overflow-hidden"
    >
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <img src={heroDawn} alt="Dawn horizon" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </motion.div>

      <AnimatePresence mode="wait">
        {subStep === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={slow}
            className="relative z-10 flex flex-col items-center px-8 pb-20 text-center"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1.5 }}
              className="mb-4 text-xs font-medium tracking-[0.4em] uppercase text-secondary/70"
            >
              ManifestFlow
            </motion.p>

            <h1 className="mb-5 text-4xl font-medium leading-tight tracking-tight text-foreground md:text-5xl">
              Design your
              <br />
              <span className="text-gradient-dawn italic">future life.</span>
            </h1>

            <p className="mb-12 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Speak your dreams and watch them emerge as a daily
              visualization ritual.
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSubStep("category")}
              className="w-full max-w-xs rounded-2xl gradient-dawn px-8 py-4 text-base font-medium text-primary-foreground glow-sunrise animate-breathe"
            >
              Begin
            </motion.button>
          </motion.div>
        )}

        {subStep === "category" && (
          <motion.div
            key="category"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={slow}
            className="relative z-10 flex w-full flex-col items-center px-8 pb-20 text-center"
          >
            <p className="mb-3 text-xs font-medium tracking-[0.4em] uppercase text-secondary/60">
              Step 1
            </p>
            <h2 className="mb-2 text-2xl font-medium text-foreground">
              What future are you
              <br />
              <span className="italic text-gradient-dawn">imagining?</span>
            </h2>
            <p className="mb-8 text-sm text-muted-foreground">
              Choose a direction for your visualization
            </p>

            <div className="grid w-full max-w-xs grid-cols-2 gap-3 mb-8">
              {categories.map((cat, i) => (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, ...slow }}
                  onClick={() => setSelected(cat.id)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-5 transition-all duration-500 ${
                    selected === cat.id
                      ? "border-primary/40 bg-primary/8 glow-sunrise"
                      : "border-border/30 bg-card/40 hover:border-primary/20"
                  }`}
                >
                  <cat.icon className={`h-5 w-5 transition-colors duration-500 ${selected === cat.id ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-medium transition-colors duration-500 ${selected === cat.id ? "text-foreground" : "text-muted-foreground"}`}>
                    {cat.label}
                  </span>
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCategoryNext}
              disabled={!selected}
              className="w-full max-w-xs rounded-2xl gradient-dawn px-8 py-4 text-base font-medium text-primary-foreground glow-sunrise transition-all disabled:opacity-30 disabled:shadow-none"
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
