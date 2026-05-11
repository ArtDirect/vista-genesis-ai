import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";

const LoginPage = () => {
  const { signInWithMagicLink, signInWithPassword, signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"magic" | "password" | "signup">("magic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "magic") {
      const res = await signInWithMagicLink(email.trim());
      if (res.error) {
        setError(res.error);
      } else {
        setMagicSent(true);
      }
    } else if (mode === "password") {
      const res = await signInWithPassword(email.trim(), password);
      if (res.error) {
        setError(res.error);
      } else {
        navigate("/ritual");
      }
    } else {
      const res = await signUp(email.trim(), password);
      if (res.error) {
        setError(res.error);
      } else {
        setMagicSent(true); // Supabase sends confirmation email
      }
    }

    setLoading(false);
  };

  if (magicSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="text-4xl mb-4">✉️</div>
          <h1 className="text-2xl font-serif mb-3">Check your email</h1>
          <p className="text-sm text-muted-foreground mb-6">
            We sent a {mode === "magic" ? "magic link" : "confirmation email"} to <strong>{email}</strong>.
            Click the link to {mode === "magic" ? "sign in" : "verify your account"}.
          </p>
          <button
            onClick={() => { setMagicSent(false); setEmail(""); }}
            className="text-sm text-primary hover:underline"
          >
            Use a different email
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link to="/" className="block text-center mb-8">
          <h1 className="text-3xl font-serif italic text-primary">ManifestFlow</h1>
        </Link>

        <h2 className="text-xl font-serif text-center mb-2">
          {mode === "magic" && "Sign in with magic link"}
          {mode === "password" && "Sign in"}
          {mode === "signup" && "Create account"}
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {mode === "magic" && "We'll email you a link — no password needed."}
          {mode === "password" && "Enter your email and password."}
          {mode === "signup" && "Create an account to save your rituals."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {(mode === "password" || mode === "signup") && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          )}
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          <button
            disabled={loading}
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {loading
              ? "..."
              : mode === "magic"
              ? "Send magic link"
              : mode === "signup"
              ? "Create account"
              : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground space-y-2">
          {mode === "magic" && (
            <>
              <button onClick={() => setMode("password")} className="hover:text-foreground">
                Sign in with password instead
              </button>
              <span className="block">or</span>
              <button onClick={() => setMode("signup")} className="hover:text-foreground">
                Create a new account
              </button>
            </>
          )}
          {mode === "password" && (
            <>
              <button onClick={() => setMode("magic")} className="hover:text-foreground">
                Use magic link instead
              </button>
              <span className="block">or</span>
              <button onClick={() => setMode("signup")} className="hover:text-foreground">
                Create a new account
              </button>
            </>
          )}
          {mode === "signup" && (
            <button onClick={() => setMode("magic")} className="hover:text-foreground">
              Already have an account? Sign in
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
