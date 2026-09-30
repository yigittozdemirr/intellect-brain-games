/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pixel: {
          dark:    "#1a1030",
          purple:  "#2d1b4e",
          magenta: "#c13cff",
          cream:   "#fff3d6",
          orange:  "#ffa62b",
          yellow:  "#ffd23f",
          blue:    "#5b7cfa",
          pink:    "#ff5c8a",
          green:   "#4cd964",
        },
      },
      fontFamily: {
        "pixel-body":  ['"Pixelify Sans"', "cursive"],
        "pixel-label": ['"Press Start 2P"', "cursive"],
      },
      animation: {
        twinkle:             "twinkle 2s ease-in-out infinite alternate",
        "moon-float":        "moonFloat 6s ease-in-out infinite",
        "cloud-drift-1":     "cloudDrift1 35s linear infinite",
        "cloud-drift-2":     "cloudDrift2 45s linear infinite",
        "cloud-drift-3":     "cloudDrift3 55s linear infinite",
        "grid-scroll":       "gridScroll 4s linear infinite",
        "flame-flicker":     "flameFlicker 0.3s steps(2) infinite",
        "flame-flicker-alt": "flameFlickerAlt 0.5s steps(2) infinite",
        "character-bob":     "characterBob 1.2s ease-in-out infinite",
      },
      keyframes: {
        twinkle: {
          "0%":   { opacity: "0.2" },
          "100%": { opacity: "1" },
        },
        moonFloat: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        cloudDrift1: {
          "0%":   { transform: "translateX(-200px)" },
          "100%": { transform: "translateX(calc(100vw + 200px))" },
        },
        cloudDrift2: {
          "0%":   { transform: "translateX(calc(100vw + 100px))" },
          "100%": { transform: "translateX(-200px)" },
        },
        cloudDrift3: {
          "0%":   { transform: "translateX(-300px)" },
          "100%": { transform: "translateX(calc(100vw + 300px))" },
        },
        gridScroll: {
          "0%":   { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 40px" },
        },
        flameFlicker: {
          "0%":   { opacity: "1" },
          "50%":  { opacity: "0.4" },
          "100%": { opacity: "1" },
        },
        flameFlickerAlt: {
          "0%":   { opacity: "0.8", transform: "translateY(0)" },
          "50%":  { opacity: "0.3", transform: "translateY(-1px)" },
          "100%": { opacity: "0.8", transform: "translateY(0)" },
        },
        characterBob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
};
