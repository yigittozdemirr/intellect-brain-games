import { motion } from "framer-motion";
import PixelButton from "../components/ui/PixelButton";
import { SITE_NAME } from "../constants";

export default function WelcomeScreen({ onNavigate }) {
  return (
    <motion.div
      className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Logo frame */}
      <div className="mb-10 md:mb-14">
        {/* Outer pixel frame */}
        <div className="relative border-[4px] border-pixel-magenta/60 rounded-[2px] p-1 shadow-[0_0_30px_rgba(193,60,255,0.3)]">
          <div className="border-[3px] border-pixel-cream/20 rounded-[2px] px-6 py-4 md:px-10 md:py-6 bg-pixel-dark/60 backdrop-blur-sm">
            {/* Decorative corner pixels */}
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-pixel-magenta" />
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-pixel-magenta" />
            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-pixel-magenta" />
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-pixel-magenta" />

            <h1 className="font-pixel-label text-2xl md:text-4xl lg:text-5xl text-pixel-cream tracking-[0.15em] text-center select-none">
              {SITE_NAME}
            </h1>
            <p className="font-pixel-body text-xs md:text-sm text-pixel-magenta text-center mt-2 tracking-wider">
              Train Your Brain
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
        <PixelButton
          variant="orange"
          onClick={() => onNavigate("login")}
          className="w-full sm:w-auto min-w-[160px]"
        >
          LOGIN
        </PixelButton>
        <PixelButton
          variant="blue"
          onClick={() => onNavigate("register")}
          className="w-full sm:w-auto min-w-[160px]"
        >
          GET STARTED
        </PixelButton>
        <PixelButton
          variant="ghost"
          onClick={() => onNavigate("games")}
          className="w-full sm:w-auto min-w-[160px]"
        >
          GAMES
        </PixelButton>
      </div>
    </motion.div>
  );
}
