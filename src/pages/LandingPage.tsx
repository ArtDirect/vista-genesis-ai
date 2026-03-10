import { motion } from "framer-motion";
import { ArrowRight, Mic, Sparkles, Headphones } from "lucide-react";

const steps = [
  { icon: Mic, title: "Speak your dream", desc: "Describe the future life you want to create, in your own words." },
  { icon: Sparkles, title: "AI builds your ritual", desc: "We turn your words into a manifestation script, visuals, and audio." },
  { icon: Headphones, title: "Listen every day", desc: "A simple morning, midday, and night ritual to stay connected to your goals." },
];

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage = ({ onStart }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="mb-4 text-sm font-medium text-muted-foreground tracking-wide"
        >
          ManifestFlow
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-6 max-w-lg text-4xl font-serif leading-tight md:text-5xl"
        >
          Speak Your Dreams.{" "}
          <span className="text-primary italic">Listen To Your Future.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mb-10 max-w-md text-base text-muted-foreground leading-relaxed"
        >
          Turn your desires into powerful manifestation audio you can listen to every day.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-lg shadow-primary/20 animate-breathe"
        >
          Create My Manifestation
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-16 text-center text-3xl font-serif">How it works</h2>
          <div className="grid gap-10 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                  <step.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-serif">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="mb-4 text-2xl font-serif">Ready to start?</h2>
        <p className="mb-8 text-muted-foreground">Your daily ritual is one step away.</p>
        <button
          onClick={onStart}
          className="rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-lg shadow-primary/20"
        >
          Create My Manifestation
        </button>
      </section>

      <footer className="border-t border-border py-8 text-center">
        <p className="text-xs text-muted-foreground">© 2026 ManifestFlow</p>
      </footer>
    </div>
  );
};

export default LandingPage;
