import { useMemo } from "react";

function Bush({ x }) {
  return (
    <svg
      width="24"
      height="16"
      viewBox="0 0 12 8"
      shapeRendering="crispEdges"
      className="pixel-art absolute bottom-0"
      style={{ left: `${x}%` }}
    >
      <rect x="2" y="2" width="8" height="4" fill="#4cd964" />
      <rect x="4" y="0" width="4" height="2" fill="#4cd964" />
      <rect x="0" y="4" width="2" height="2" fill="#3ab54e" />
      <rect x="10" y="4" width="2" height="2" fill="#3ab54e" />
      <rect x="2" y="6" width="8" height="2" fill="#2d8a3e" />
    </svg>
  );
}

function Flower({ x, color }) {
  return (
    <svg
      width="10"
      height="14"
      viewBox="0 0 5 7"
      shapeRendering="crispEdges"
      className="pixel-art absolute bottom-0"
      style={{ left: `${x}%` }}
    >
      <rect x="2" y="0" width="1" height="1" fill={color} />
      <rect x="1" y="1" width="1" height="1" fill={color} />
      <rect x="3" y="1" width="1" height="1" fill={color} />
      <rect x="2" y="1" width="1" height="1" fill="#ffd23f" />
      <rect x="2" y="2" width="1" height="4" fill="#4cd964" />
      <rect x="1" y="4" width="1" height="1" fill="#4cd964" />
    </svg>
  );
}

export default function PixelFoliage() {
  const items = useMemo(
    () => [
      { type: "bush", x: 5 },
      { type: "flower", x: 15, color: "#ff5c8a" },
      { type: "bush", x: 25 },
      { type: "flower", x: 35, color: "#ffd23f" },
      { type: "flower", x: 45, color: "#c13cff" },
      { type: "bush", x: 55 },
      { type: "flower", x: 65, color: "#ff5c8a" },
      { type: "bush", x: 75 },
      { type: "flower", x: 85, color: "#ffd23f" },
      { type: "bush", x: 92 },
    ],
    []
  );

  return (
    <div
      className="absolute bottom-[29%] left-0 right-0 h-6 pointer-events-none"
      aria-hidden="true"
    >
      {items.map((item, i) =>
        item.type === "bush" ? (
          <Bush key={i} x={item.x} />
        ) : (
          <Flower key={i} x={item.x} color={item.color} />
        )
      )}
    </div>
  );
}
