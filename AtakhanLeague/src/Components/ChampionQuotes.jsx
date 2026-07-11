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

  { text: 'The unseen blade is the deadliest.', champion: 'Zed' },
  { text: 'Hesitation is the seed of defeat.', champion: 'Akali' },
  { text: 'Everybody dies. Some just need a little help.', champion: 'Lucian' },
  { text: 'Ok.', champion: 'Rammus' },
  { text: 'Precision is the difference between a butcher and a surgeon.', champion: 'Camille' },
  { text: 'In carnage, I bloom, like a flower in the dawn.', champion: 'Jhin' },
  { text: 'Never one without the other.', champion: 'Kindred' },
  { text: 'A true master is an eternal student.', champion: 'Master Yi' },
  { text: 'A wanderer is never truly lost.', champion: 'Yasuo' },
  { text: 'The heart is the strongest muscle.', champion: 'Braum' },
  { text: 'Fortune doesn’t favor fools.', champion: 'Miss Fortune' },
  { text: 'Fear is the first of many foes.', champion: 'Garen' },
  { text: 'Balance is a fool’s master.', champion: 'Zed' },
  { text: 'Tomorrow is a hope, never a promise.', champion: 'Kindred' },
  { text: 'What is broken can be reforged.', champion: 'Riven' },
  { text: 'The darker the night, the brighter the stars.', champion: 'Braum' },
  { text: 'Tradition is the corpse of wisdom.', champion: 'Zed' },
  { text: 'Smile, everyone is watching.', champion: 'Jhin' },
  { text: 'Never look back.', champion: 'Jayce' },

  { text: 'Victory is not won when the enemy falls, but when fear leaves your heart.', champion: 'Pantheon' },
  { text: 'A blade may end a life, but only resolve decides the battle.', champion: 'Yasuo' },
  { text: 'War does not ask who is ready. It only asks who survives.', champion: 'Darius' },
  { text: 'In the clash of steel, you do not find honor. You find truth.', champion: 'Riven' },
  { text: 'Courage is fighting when even your shadow wants to run.', champion: 'Garen' },
  { text: 'We are all bound by chains; some are forged by others, some by ourselves.', champion: 'Sylas' },
  { text: 'Death is not the end. It is the question you must answer with your life.', champion: 'Kindred' },
  { text: 'The past is a weight we carry or a lesson we learn. You choose which.', champion: 'Yone' },
  { text: 'You cannot outrun your mistakes. You can only walk further from who made them.', champion: 'Lucian' },
  { text: 'The world is not broken. It is merely honest.', champion: 'Swain' },
  { text: 'Time does not heal all wounds. It simply buries those who carry them.', champion: 'Zilean' },
  { text: 'Change is a storm. Those who hide from it are swept away.', champion: 'Karma' },
  { text: 'Every choice closes a door behind you. Some doors never reopen.', champion: 'Thresh' },
  { text: 'Tomorrow is built on the courage you find today.', champion: 'Irelia' },
  { text: 'The future is not written in stars, but in scars.', champion: 'Viktor' },
  { text: 'Light is most blinding to those who never left the dark.', champion: 'Lux' },
  { text: 'Monsters are born when people forget the face behind the mask.', champion: 'Nocturne' },
  { text: 'Balance does not mean silence. It means knowing which voice to follow.', champion: 'Lee Sin' },
  { text: 'Hope is a fragile weapon, but it is the only one that cuts through despair.', champion: 'Senna' },
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
      </div>
    </section>
  );
}
