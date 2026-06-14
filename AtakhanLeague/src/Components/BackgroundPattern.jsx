// Subtle, barely-visible tiled LoL role icons behind the whole site.
// Fixed full-viewport, non-interactive, very low opacity.
const ICONS = [
  '/Icons/Top_icon.png',
  '/Icons/Jungle_icon.png',
  '/Icons/Middle_icon.png',
  '/Icons/Bottom_icon.png',
  '/Icons/Support_icon.png',
];

// Enough tiles to comfortably cover large screens; the grid auto-fills.
const TILE_COUNT = 160;

export default function BackgroundPattern() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
    >
      <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-10 sm:gap-14 p-8 w-full h-full">
        {Array.from({ length: TILE_COUNT }).map((_, i) => (
          <img
            key={i}
            src={ICONS[i % ICONS.length]}
            alt=""
            className="w-7 h-7 sm:w-9 sm:h-9 object-contain opacity-[0.035] [filter:grayscale(1)]"
            style={{ transform: `rotate(${(i % 4) * 15 - 22}deg)` }}
          />
        ))}
      </div>
    </div>
  );
}
