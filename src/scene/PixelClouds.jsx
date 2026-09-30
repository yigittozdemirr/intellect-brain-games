export default function PixelClouds() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block" aria-hidden="true">
      {/* Cloud 1 */}
      <div className="absolute top-[12%] animate-cloud-drift-1" style={{ animationDuration: "35s" }}>
        <svg width="64" height="28" viewBox="0 0 32 14" shapeRendering="crispEdges" className="pixel-art opacity-30">
          <rect x="8" y="2" width="12" height="2" fill="#fff3d6" />
          <rect x="6" y="4" width="18" height="2" fill="#fff3d6" />
          <rect x="4" y="6" width="24" height="2" fill="#fff3d6" />
          <rect x="2" y="8" width="28" height="2" fill="#fff3d6" />
          <rect x="6" y="10" width="20" height="2" fill="#fff3d6" />
        </svg>
      </div>
      {/* Cloud 2 */}
      <div className="absolute top-[22%] animate-cloud-drift-2" style={{ animationDuration: "45s" }}>
        <svg width="48" height="20" viewBox="0 0 24 10" shapeRendering="crispEdges" className="pixel-art opacity-20">
          <rect x="6" y="0" width="8" height="2" fill="#fff3d6" />
          <rect x="4" y="2" width="14" height="2" fill="#fff3d6" />
          <rect x="2" y="4" width="20" height="2" fill="#fff3d6" />
          <rect x="4" y="6" width="16" height="2" fill="#fff3d6" />
        </svg>
      </div>
      {/* Cloud 3 */}
      <div className="absolute top-[8%] animate-cloud-drift-3" style={{ animationDuration: "55s" }}>
        <svg width="40" height="16" viewBox="0 0 20 8" shapeRendering="crispEdges" className="pixel-art opacity-15">
          <rect x="4" y="0" width="8" height="2" fill="#fff3d6" />
          <rect x="2" y="2" width="14" height="2" fill="#fff3d6" />
          <rect x="0" y="4" width="18" height="2" fill="#fff3d6" />
          <rect x="4" y="6" width="12" height="2" fill="#fff3d6" />
        </svg>
      </div>
    </div>
  );
}
