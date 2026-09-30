import { motion } from "framer-motion";

const variants = {
  orange:
    "bg-pixel-orange text-pixel-dark border-pixel-dark shadow-[4px_4px_0px_0px_#1a1030] hover:bg-pixel-yellow active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
  blue: "bg-pixel-blue text-pixel-cream border-pixel-dark shadow-[4px_4px_0px_0px_#1a1030] hover:bg-[#7b9aff] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
  ghost:
    "bg-transparent text-pixel-cream border-pixel-cream/40 shadow-[3px_3px_0px_0px_rgba(255,243,214,0.2)] hover:border-pixel-cream hover:bg-pixel-cream/10 active:shadow-none active:translate-x-[3px] active:translate-y-[3px]",
  pink: "bg-pixel-pink text-pixel-cream border-pixel-dark shadow-[4px_4px_0px_0px_#1a1030] hover:bg-[#ff7ea6] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
};

export default function PixelButton({
  children,
  variant = "orange",
  className = "",
  ...props
}) {
  return (
    <motion.button
      whileHover={{ y: -3 }}
      whileTap={{ y: 2 }}
      className={`
        font-pixel-body text-sm md:text-base
        px-6 py-3 border-[3px] rounded-[4px]
        cursor-pointer select-none transition-colors duration-100
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pixel-magenta focus-visible:ring-offset-2 focus-visible:ring-offset-pixel-dark
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:shadow-[4px_4px_0px_0px_#1a1030] disabled:active:translate-x-0 disabled:active:translate-y-0
        ${variants[variant] || variants.orange}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
}
