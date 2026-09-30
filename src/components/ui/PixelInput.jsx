import { useState } from "react";

export default function PixelInput({
  label,
  id,
  type = "text",
  error,
  className = "",
  ...props
}) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPw ? "text" : type;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="font-pixel-label text-[10px] md:text-xs text-pixel-cream/80 tracking-wider uppercase"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={inputType}
          autoComplete={isPassword ? "current-password" : undefined}
          className={`
            w-full font-pixel-body text-sm md:text-base
            bg-pixel-dark/80 text-pixel-cream
            border-[3px] rounded-[4px] px-3 py-2.5
            placeholder:text-pixel-cream/30
            focus:outline-none focus:border-pixel-magenta focus:ring-1 focus:ring-pixel-magenta
            transition-colors duration-100
            ${error ? "border-pixel-pink" : "border-pixel-cream/30"}
            ${isPassword ? "pr-12" : ""}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 font-pixel-label text-[9px] text-pixel-cream/60 hover:text-pixel-cream border border-pixel-cream/20 rounded px-1.5 py-0.5 bg-pixel-dark/60 transition-colors"
            tabIndex={-1}
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? "HIDE" : "SHOW"}
          </button>
        )}
      </div>
      {error && (
        <div className="font-pixel-label text-[9px] md:text-[10px] text-pixel-pink bg-pixel-pink/10 border border-pixel-pink/30 rounded px-2 py-1 mt-0.5">
          ⚠ {error}
        </div>
      )}
    </div>
  );
}
