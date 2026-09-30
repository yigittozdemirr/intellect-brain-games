import PixelStars from "./PixelStars";
import PixelMoon from "./PixelMoon";
import PixelClouds from "./PixelClouds";
import PixelGrid from "./PixelGrid";
import PixelTower from "./PixelTower";
import PixelCharacter from "./PixelCharacter";
import PixelFoliage from "./PixelFoliage";

export default function WelcomeScene() {
  return (
    <div className="absolute inset-0 bg-pixel-dark overflow-hidden" aria-hidden="true">
      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(45,27,78,0.6) 0%, transparent 70%)",
        }}
      />
      <PixelStars />
      <PixelMoon />
      <PixelClouds />
      <PixelTower />
      <PixelCharacter />
      <PixelFoliage />
      <PixelGrid />
    </div>
  );
}
