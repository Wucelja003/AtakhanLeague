import { useEffect, useState } from 'react';

// Rotating League of Legends champion quotes. One quote at a time:
// fade out → swap → fade in, cycling every 6s.
const quotes = [
  { text: 'Death is like the wind — always by my side.', champion: 'Yasuo' },
  { text: 'Ignore death. Achieve immortality.', champion: 'Zed' },
  { text: 'Welcome to the League of Draven!', champion: 'Draven' },
  { text: 'The cycle of life and death continues. We will live, they will die.', champion: 'Nasus' },
  { text: 'In the darkest hour, we are the light.', champion: 'Lux' },
  { text: 'A sword is only as good as the one who wields it.', champion: 'Fiora' },
  { text: 'The strength of Wuju flows through me.', champion: 'Master Yi' },
  { text: 'Rules are made to be broken… like buildings, or people!', champion: 'Jinx' },
];

const FADE_MS = 550;
const HOLD_MS = 6000;

export default function ChampionQuotes() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false); // fade current out
      const swap = setTimeout(() => {
        setIndex((prev) => (prev + 1) % quotes.length);
        setVisible(true); // fade next in
      }, FADE_MS);
      return () => clearTimeout(swap);
    }, HOLD_MS);
    return () => clearInterval(id);
  }, []);

  const q = quotes[index];

  return (
    <section
      aria-label="Champion quotes"
      className="relative z-[2] py-20 sm:py-28 px-5 flex justify-center overflow-hidden"
    >
      <div className="relative w-full max-w-3xl text-center">
        {/* Decorative opening quote mark */}
        <span
          aria-hidden="true"
          className="font-heading text-[#DC143C] text-[72px] sm:text-[96px] leading-[0.5] opacity-30 [text-shadow:0_0_24px_rgba(220,20,60,0.5)]"
        >
          &ldquo;
        </span>

        {/* Rotating quote — crossfades on change */}
        <div
          className="min-h-[150px] sm:min-h-[170px] flex flex-col items-center justify-center transition-all ease-out"
          style={{
            transitionDuration: `${FADE_MS}ms`,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(12px)',
          }}
        >
          <p
            style={{ fontFamily: "'Cinzel', serif" }}
            className="text-white text-[22px] sm:text-[32px] md:text-[38px] font-medium leading-snug tracking-wide [text-shadow:0_0_20px_rgba(139,0,0,0.5)]"
          >
            {q.text}
          </p>
          <p className="mt-6 font-slogan text-[13px] sm:text-[14px] font-bold uppercase tracking-[4px] text-[#DC143C]">
            — {q.champion}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {quotes.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index
                  ? 'w-6 bg-[#DC143C] shadow-[0_0_8px_rgba(220,20,60,0.7)]'
                  : 'w-1.5 bg-[rgba(102,0,0,0.5)]'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
