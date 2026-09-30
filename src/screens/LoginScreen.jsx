import { useState } from "react";
import { motion } from "framer-motion";
import PixelButton from "../components/ui/PixelButton";
import PixelInput from "../components/ui/PixelInput";
import PixelPanel from "../components/ui/PixelPanel";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ onNavigate, onSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      onSuccess();
    } else {
      setErrors(result.errors);
    }
  }

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen px-4 py-8"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      <PixelPanel className="w-full max-w-md">
        <h2 className="font-pixel-label text-lg md:text-xl text-pixel-cream mb-6 text-center">
          LOGIN
        </h2>

        {errors.general && (
          <div className="font-pixel-label text-[10px] text-pixel-pink bg-pixel-pink/10 border border-pixel-pink/30 rounded px-3 py-2 mb-4 text-center">
            ⚠ {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <PixelInput
            id="login-email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <PixelInput
            id="login-password"
            label="Password"
            type="password"
            placeholder="••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          <PixelButton type="submit" variant="orange" disabled={loading} className="w-full mt-2">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block w-3 h-3 border-2 border-pixel-dark border-t-transparent rounded-full animate-spin" />
                LOGGING IN...
              </span>
            ) : (
              "LOG IN"
            )}
          </PixelButton>
        </form>

        <div className="flex flex-col items-center gap-2 mt-6">
          <button
            onClick={() => onNavigate("register")}
            className="font-pixel-body text-xs text-pixel-blue hover:text-pixel-cream underline underline-offset-4 transition-colors"
          >
            Don&apos;t have an account? Get Started
          </button>
          <button
            onClick={() => onNavigate("welcome")}
            className="font-pixel-body text-xs text-pixel-cream/50 hover:text-pixel-cream transition-colors"
          >
            ← Back
          </button>
        </div>
      </PixelPanel>
    </motion.div>
  );
}
