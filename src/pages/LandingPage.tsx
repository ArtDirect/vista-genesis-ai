import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Eye, Headphones, Flame, Star } from "lucide-react";
import heroImage from "@/assets/hero-sunrise.jpg";
import vizWorkspace from "@/assets/viz-workspace.jpg";
import vizPeaceful from "@/assets/viz-peaceful.jpg";
import vizSpeaking from "@/assets/viz-speaking.jpg";

const steps = [
  {
    icon: Sparkles,
    title: "Speak Your Dreams",
    desc: "Describe the life you want to create using voice or text.",
  },
  {
    icon: Eye,
    title: "AI Generates Your Vision",
    desc: "We craft personalized scripts, audio, and cinematic scenes.",
  },
  {
    icon: Headphones,
    title: "Experience Daily",
    desc: "Replay your immersive visualization ritual every morning.",
  },
  {
    icon: Flame,
    title: "Transform Your Life",
    desc: "Build belief, clarity, and momentum toward your future self.",
  },
];

const benefits = [
  "Stronger belief in your goals",
  "Emotional connection to your future",
  "Daily motivation & consistency",
  "A clear vision of your future identity",
];

const testimonials = [
  {
    quote: "FutureSelf changed the way I think about my goals. It's like meditating on my dream life every morning.",
    name: "Sarah M.",
    role: "Entrepreneur",
  },
  {
    quote: "The visualization scenes feel so real. I've never been this emotionally connected to my future.",
    name: "James K.",
    role: "Creative Director",
  },
  {
    quote: "I replaced my morning scroll with FutureSelf. My focus and clarity have never been higher.",
    name: "Priya L.",
    role: "Wellness Coach",
  },
];

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage = ({ onStart }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-wide font-serif text-gradient-sunrise">
            FutureSelf
          </span>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="rounded-full gradient-sunrise px-5 py-2 text-sm font-semibold text-primary-foreground"
          >
            Get Started
          </motion.button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Ocean sunrise" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-4 text-sm font-medium tracking-[0.3em] uppercase text-secondary"
            >
              AI-Powered Visualization
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mb-6 text-4xl font-semibold leading-tight tracking-tight md:text-6xl lg:text-7xl"
            >
              Experience Your Future
              <br />
              <span className="italic text-gradient-sunrise">Before It Happens</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-10 max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl"
            >
              Speak your dreams and turn them into immersive daily visualizations powered by AI.
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
              className="group flex items-center gap-3 rounded-2xl gradient-sunrise px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg glow-coral"
            >
              Start Creating Your Future
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p className="mb-3 text-xs font-medium tracking-[0.3em] uppercase text-secondary">
              How It Works
            </p>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Four steps to your <span className="italic text-gradient-sunrise">future self</span>
            </h2>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-sm"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-sunrise">
                  <step.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold font-serif">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Visualization */}
      <section className="py-24 md:py-32 gradient-ocean">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p className="mb-3 text-xs font-medium tracking-[0.3em] uppercase text-secondary">
              Example Experience
            </p>
            <h2 className="text-3xl font-semibold md:text-4xl">
              What your <span className="italic text-gradient-sunrise">visualization</span> looks like
            </h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { src: vizWorkspace, title: "Your Dream Workspace" },
              { src: vizSpeaking, title: "Confident Speaking" },
              { src: vizPeaceful, title: "Peaceful Living" },
            ].map((scene, i) => (
              <motion.div
                key={scene.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group relative overflow-hidden rounded-2xl"
              >
                <img
                  src={scene.src}
                  alt={scene.title}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-sm font-semibold">{scene.title}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Script preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mt-12 max-w-2xl rounded-2xl border border-border/50 bg-card/60 p-8 backdrop-blur-sm"
          >
            <Sparkles className="mb-4 h-5 w-5 text-gold" />
            <p className="font-serif italic text-lg leading-relaxed text-foreground/80">
              "You wake up calm and energized. The morning light warms your face as you step into your
              workspace overlooking the ocean. Your work feels meaningful. Your ideas are turning into
              successful projects that impact thousands of lives."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="mb-3 text-xs font-medium tracking-[0.3em] uppercase text-secondary">
                Benefits
              </p>
              <h2 className="mb-8 text-3xl font-semibold md:text-4xl">
                Why daily visualization{" "}
                <span className="italic text-gradient-sunrise">transforms lives</span>
              </h2>
              <ul className="space-y-4">
                {benefits.map((b, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-sunrise">
                      <Star className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-foreground">{b}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src={vizPeaceful}
                alt="Peaceful visualization"
                className="rounded-2xl object-cover w-full aspect-square"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-background/40 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32 gradient-ocean">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p className="mb-3 text-xs font-medium tracking-[0.3em] uppercase text-secondary">
              Testimonials
            </p>
            <h2 className="text-3xl font-semibold md:text-4xl">
              What people are <span className="italic text-gradient-sunrise">saying</span>
            </h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-sm"
              >
                <p className="mb-4 text-sm italic leading-relaxed text-foreground/80">
                  "{t.quote}"
                </p>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-3xl font-semibold md:text-5xl">
              Your future is <span className="italic text-gradient-sunrise">waiting</span>
            </h2>
            <p className="mb-10 text-lg text-muted-foreground">
              Step into the life you're creating. Start your daily visualization ritual today.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
              className="group mx-auto flex items-center gap-3 rounded-2xl gradient-sunrise px-10 py-5 text-lg font-semibold text-primary-foreground shadow-lg glow-coral"
            >
              Start Creating Your Future
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <span className="text-sm font-semibold font-serif text-gradient-sunrise">FutureSelf</span>
          <p className="text-xs text-muted-foreground">
            © 2026 FutureSelf. Experience your future before it happens.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
