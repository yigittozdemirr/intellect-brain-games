export default function PixelTower() {
  return (
    <div
      className="absolute bottom-[30%] left-[6%] md:left-[10%] pointer-events-none"
      aria-hidden="true"
    >
      <svg
        width="40"
        height="80"
        viewBox="0 0 20 40"
        shapeRendering="crispEdges"
        className="pixel-art w-8 h-16 md:w-10 md:h-20"
      >
        {/* Tower body */}
        <rect x="6" y="12" width="8" height="28" fill="#2d1b4e" />
        <rect x="5" y="12" width="1" height="28" fill="#231440" />
        <rect x="14" y="12" width="1" height="28" fill="#231440" />

        {/* Tower top / battlements */}
        <rect x="4" y="10" width="12" height="2" fill="#2d1b4e" />
        <rect x="4" y="8" width="2" height="2" fill="#2d1b4e" />
        <rect x="9" y="8" width="2" height="2" fill="#2d1b4e" />
        <rect x="14" y="8" width="2" height="2" fill="#2d1b4e" />

        {/* Window */}
        <rect x="8" y="20" width="4" height="4" fill="#1a1030" />
        <rect x="9" y="21" width="2" height="2" fill="#5b7cfa" opacity="0.5" />

        {/* Window 2 */}
        <rect x="8" y="28" width="4" height="4" fill="#1a1030" />
        <rect x="9" y="29" width="2" height="2" fill="#ffa62b" opacity="0.4" />

        {/* Door */}
        <rect x="8" y="35" width="4" height="5" fill="#1a1030" />

        {/* Flame on top */}
        <rect x="9" y="4" width="2" height="2" fill="#ffa62b" className="animate-flame-flicker" />
        <rect x="9" y="2" width="2" height="2" fill="#ffd23f" className="animate-flame-flicker-alt" />
        <rect x="10" y="1" width="1" height="1" fill="#ff5c8a" className="animate-flame-flicker" />
      </svg>
    </div>
  );
}
