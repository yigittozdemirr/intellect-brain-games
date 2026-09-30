export default function PixelMoon() {
  return (
    <div
      className="absolute top-[6%] right-[10%] md:right-[15%] animate-moon-float pointer-events-none"
      aria-hidden="true"
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 16 16"
        shapeRendering="crispEdges"
        className="pixel-art w-10 h-10 md:w-12 md:h-12"
      >
        {/* Moon body */}
        <rect x="5" y="1" width="6" height="1" fill="#ffd23f" />
        <rect x="3" y="2" width="2" height="1" fill="#ffd23f" />
        <rect x="11" y="2" width="2" height="1" fill="#ffd23f" />
        <rect x="2" y="3" width="1" height="2" fill="#ffd23f" />
        <rect x="13" y="3" width="1" height="2" fill="#ffd23f" />
        <rect x="1" y="5" width="1" height="6" fill="#ffd23f" />
        <rect x="14" y="5" width="1" height="6" fill="#ffd23f" />
        <rect x="2" y="11" width="1" height="2" fill="#ffd23f" />
        <rect x="13" y="11" width="1" height="2" fill="#ffd23f" />
        <rect x="3" y="13" width="2" height="1" fill="#ffd23f" />
        <rect x="11" y="13" width="2" height="1" fill="#ffd23f" />
        <rect x="5" y="14" width="6" height="1" fill="#ffd23f" />
        {/* Fill */}
        <rect x="3" y="3" width="10" height="10" fill="#ffd23f" />
        {/* Craters */}
        <rect x="5" y="5" width="2" height="2" fill="#e6bc2f" />
        <rect x="9" y="4" width="1" height="1" fill="#e6bc2f" />
        <rect x="7" y="9" width="3" height="2" fill="#e6bc2f" />
        <rect x="4" y="10" width="1" height="1" fill="#e6bc2f" />
        {/* Glow */}
        <rect x="5" y="1" width="6" height="1" fill="#ffd23f" opacity="0.4" />
      </svg>
    </div>
  );
}
