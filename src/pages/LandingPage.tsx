import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Mic, Sparkles, Headphones } from "lucide-react";
import { trackEvent } from "@/lib/events";

const steps = [
  { icon: Mic, num: "1", title: "Record your manifestation", desc: "Messy is fine. Just speak from the heart." },
  { icon: Sparkles, num: "2", title: "We perfect your script", desc: "Clear, powerful, in your voice." },
  { icon: Headphones, num: "3", title: "Get your audio", desc: "A daily track you'll actually replay." },
];

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent("page_view", "/");
  }, []);

  const handleCTA = () => {
    trackEvent("cta_clicked", "/");
    navigate("/create");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mb-6 max-w-xl text-3xl font-serif leading-tight md:text-5xl"
        >
          Record Your Manifestation.{" "}
          <span className="text-primary italic">We'll Turn It Into Daily Audio.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mb-10 max-w-md text-base text-muted-foreground leading-relaxed md:text-lg"
        >
          Speak your dream life in your own words. We'll perfect it into a powerful script and send it back as audio you can listen to every day.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCTA}
          className="flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-lg shadow-primary/20"
        >
          Start My Recording
          <ArrowRight className="h-4 w-4" />
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-4 text-xs text-muted-foreground"
        >
          Limited beta — we're crafting the first 50 audios personally.
        </motion.p>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
          className="mt-8 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          See how it works
        </motion.button>
      </section>

      {/* How It Works */}
      <section id="how" className="py-24 px-6">
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

      {/* Bottom CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="mb-4 text-2xl font-serif">Ready to start?</h2>
        <p className="mb-8 text-muted-foreground">Your daily ritual is one step away.</p>
        <button
          onClick={handleCTA}
          className="rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-lg shadow-primary/20"
        >
          Start My Recording
        </button>
      </section>

      <footer className="border-t border-border py-8 text-center">
        <p className="text-xs text-muted-foreground">© 2026 ManifestFlow</p>
      </footer>
    </div>
  );
};

export default LandingPage;
