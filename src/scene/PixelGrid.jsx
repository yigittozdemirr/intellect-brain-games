export default function PixelGrid() {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-[35%] overflow-hidden pointer-events-none"
      aria-hidden="true"
      style={{ perspective: "400px" }}
    >
      <div
        className="absolute inset-0 animate-grid-scroll"
        style={{
          transformOrigin: "center top",
          transform: "rotateX(55deg)",
          backgroundImage: `
            linear-gradient(rgba(193, 60, 255, 0.25) 1px, transparent 1px),
            linear-gradient(90deg, rgba(193, 60, 255, 0.25) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          imageRendering: "pixelated",
        }}
      />
      {/* Fade at the top of the grid */}
      <div
        className="absolute inset-x-0 top-0 h-16"
        style={{
          background: "linear-gradient(to bottom, #1a1030 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
