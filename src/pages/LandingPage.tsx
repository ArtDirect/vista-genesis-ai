import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Mic, Headphones, Eye } from "lucide-react";
import heroDawn from "@/assets/hero-dawn.jpg";
import vizHorizon from "@/assets/viz-horizon.jpg";
import vizFutureHome from "@/assets/viz-future-home.jpg";
import vizReflection from "@/assets/viz-reflection.jpg";

const steps = [
  {
    icon: Mic,
    num: "01",
    title: "Whisper your dream",
    desc: "Speak about the life you want. Your voice becomes the seed of your future.",
  },
  {
    icon: Sparkles,
    num: "02",
    title: "Watch it take shape",
    desc: "AI transforms your words into a vivid, emotionally rich visualization script.",
  },
  {
    icon: Eye,
    num: "03",
    title: "Experience your future",
    desc: "Cinematic scenes and narration bring your imagined life to life — every day.",
  },
];

const testimonials = [
  {
    quote: "For the first time, I could actually see my future. Not as a dream, but as something real and waiting for me.",
    name: "Sarah M.",
    role: "Founder",
  },
  {
    quote: "It's like having a private cinema for my imagination. I listen every morning and it changes how I move through the day.",
    name: "James K.",
    role: "Creative Director",
  },
  {
    quote: "Most manifestation tools feel like homework. This feels like an experience. I actually look forward to it.",
    name: "Priya L.",
    role: "Wellness Coach",
  },
];

interface LandingPageProps {
  onStart: () => void;
}

const slow = { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] };
const slowUp = { ...slow, delay: 0.3 };

const LandingPage = ({ onStart }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="text-lg font-medium tracking-wide font-serif text-gradient-dawn">
            ManifestFlow
          </span>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="rounded-full gradient-dawn px-6 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Begin
          </motion.button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-[100dvh] items-end overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img src={heroDawn} alt="Dawn over the ocean" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/50 to-transparent" />
        </motion.div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24 pt-32 md:pb-32">
          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1.5 }}
              className="mb-6 text-xs font-medium tracking-[0.4em] uppercase text-secondary/80"
            >
              A cinematic imagination engine
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="mb-8 text-4xl font-medium leading-[1.15] tracking-tight md:text-6xl lg:text-7xl"
            >
              See the life
              <br />
              you're creating.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 1.5 }}
              className="mb-12 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              Whisper your dreams. Watch your future emerge. A daily ritual for
              designing the life you imagine.
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2, duration: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStart}
              className="group flex items-center gap-3 rounded-2xl gradient-dawn px-8 py-4 text-base font-medium text-primary-foreground glow-sunrise"
            >
              Begin your visualization
              <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 md:py-40">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={slow}
            className="mb-20"
          >
            <p className="mb-4 text-xs font-medium tracking-[0.4em] uppercase text-secondary/60">
              The ritual
            </p>
            <h2 className="max-w-lg text-3xl font-medium leading-tight md:text-4xl lg:text-5xl">
              Your future begins
              <br />
              <span className="italic text-gradient-dawn">with one whisper.</span>
            </h2>
          </motion.div>

          <div className="grid gap-16 md:gap-12 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...slow, delay: i * 0.2 }}
              >
                <p className="mb-4 text-xs font-medium tracking-[0.3em] text-primary/60">
                  {step.num}
                </p>
                <h3 className="mb-3 text-xl font-medium font-serif">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Experience */}
      <section className="py-32 md:py-40">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={slow}
            className="mb-20 text-center"
          >
            <p className="mb-4 text-xs font-medium tracking-[0.4em] uppercase text-secondary/60">
              Dreamlike realism
            </p>
            <h2 className="mx-auto max-w-lg text-3xl font-medium md:text-4xl lg:text-5xl">
              <span className="italic text-gradient-dawn">Step inside</span>
              <br />
              your imagined life.
            </h2>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { src: vizFutureHome, title: "The space you'll inhabit" },
              { src: vizHorizon, title: "The moment of possibility" },
              { src: vizReflection, title: "The stillness of knowing" },
            ].map((scene, i) => (
              <motion.div
                key={scene.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...slow, delay: i * 0.2 }}
                className="group relative overflow-hidden rounded-2xl"
              >
                <img
                  src={scene.src}
                  alt={scene.title}
                  className="aspect-[3/4] w-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-sm font-medium text-foreground/80 font-serif italic">
                    {scene.title}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote / Insight */}
      <section className="py-32 md:py-40">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={slow}
          >
            <p className="mb-8 text-xs font-medium tracking-[0.4em] uppercase text-secondary/60">
              The insight
            </p>
            <blockquote className="text-2xl font-medium leading-relaxed font-serif italic text-foreground/80 md:text-3xl lg:text-4xl">
              "People don't need more affirmations.
              <br />
              They need help <span className="text-gradient-dawn">imagining</span> their future clearly."
            </blockquote>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 md:py-40 gradient-twilight">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={slow}
            className="mb-16"
          >
            <p className="mb-4 text-xs font-medium tracking-[0.4em] uppercase text-secondary/60">
              Voices
            </p>
            <h2 className="text-3xl font-medium md:text-4xl">
              What it <span className="italic text-gradient-dawn">feels</span> like.
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...slow, delay: i * 0.15 }}
                className="rounded-2xl border border-border/30 bg-card/40 p-8 backdrop-blur-sm"
              >
                <p className="mb-6 text-sm italic leading-relaxed text-foreground/70">
                  "{t.quote}"
                </p>
                <div>
                  <p className="text-sm font-medium text-foreground/90">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 md:py-40">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={slow}
          >
            <h2 className="mb-6 text-3xl font-medium md:text-5xl">
              Your future is
              <br />
              <span className="italic text-gradient-dawn">waiting to be seen.</span>
            </h2>
            <p className="mb-12 text-base text-muted-foreground md:text-lg">
              Close your eyes. Whisper what you want. Let it appear.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStart}
              className="group mx-auto flex items-center gap-3 rounded-2xl gradient-dawn px-10 py-5 text-base font-medium text-primary-foreground glow-sunrise"
            >
              Begin your visualization
              <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/10 py-10">
        <div className="mx-auto max-w-6xl px-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <span className="text-sm font-medium font-serif text-gradient-dawn">ManifestFlow</span>
          <p className="text-xs text-muted-foreground/40">
            © 2026 ManifestFlow. A cinematic imagination engine.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
