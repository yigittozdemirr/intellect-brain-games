export default function PixelPanel({ children, className = "", ...props }) {
  return (
    <div
      className={`
        bg-pixel-purple/90 backdrop-blur-sm
        border-[3px] border-pixel-cream/20 rounded-[6px]
        shadow-[6px_6px_0px_0px_rgba(26,16,48,0.8)]
        p-6 md:p-8
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
