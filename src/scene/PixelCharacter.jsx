export default function PixelCharacter() {
  return (
    <div
      className="absolute bottom-[30%] right-[8%] md:right-[12%] animate-character-bob pointer-events-none"
      aria-hidden="true"
    >
      <svg
        width="32"
        height="40"
        viewBox="0 0 16 20"
        shapeRendering="crispEdges"
        className="pixel-art w-6 h-8 md:w-8 md:h-10"
      >
        {/* Hat */}
        <rect x="5" y="0" width="6" height="2" fill="#c13cff" />
        <rect x="4" y="2" width="8" height="1" fill="#c13cff" />

        {/* Head */}
        <rect x="5" y="3" width="6" height="5" fill="#ffd23f" />
        {/* Eyes */}
        <rect x="6" y="5" width="1" height="1" fill="#1a1030" />
        <rect x="9" y="5" width="1" height="1" fill="#1a1030" />
        {/* Mouth */}
        <rect x="7" y="7" width="2" height="1" fill="#1a1030" />

        {/* Body */}
        <rect x="5" y="8" width="6" height="6" fill="#5b7cfa" />
        {/* Belt */}
        <rect x="5" y="12" width="6" height="1" fill="#ffa62b" />

        {/* Arms */}
        <rect x="3" y="9" width="2" height="4" fill="#ffd23f" />
        <rect x="11" y="9" width="2" height="4" fill="#ffd23f" />

        {/* Legs */}
        <rect x="5" y="14" width="2" height="4" fill="#2d1b4e" />
        <rect x="9" y="14" width="2" height="4" fill="#2d1b4e" />

        {/* Boots */}
        <rect x="4" y="18" width="3" height="2" fill="#1a1030" />
        <rect x="9" y="18" width="3" height="2" fill="#1a1030" />
      </svg>
    </div>
  );
}
