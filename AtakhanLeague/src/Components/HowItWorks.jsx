import { motion, useMotionValue, useMotionValueEvent, useTransform } from "motion/react";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { ClipboardList, MailCheck, Users, CalendarDays, BadgeCheck, Swords } from "lucide-react";
// Lazy — keeps three.js out of the main bundle
const LightPillar = lazy(() => import("./LightPillar"));

const steps = [
  {
    title: "Register",
    copy: "Fill out the registration form — as a full team or as an individual looking to compete.",
    icon: ClipboardList,
  },
  {
    title: "Confirmation",
    copy: "Receive an email confirmation with your registration details and payment information.",
    icon: MailCheck,
  },
  {
    title: "Team Assignment",
    tag: "Individual players",
    copy: "Solo registrants get assigned to a team by our organizers before the tournament kicks off.",
    icon: Users,
  },
  {
    title: "Draw & Schedule",
    copy: "Teams are drawn and the full match schedule is published. Study your bracket, Summoner.",
    icon: CalendarDays,
  },
  {
    title: "Check-In",
    copy: "Check in on Discord or the site at least 30 minutes before your scheduled match.",
    icon: BadgeCheck,
  },
  {
    title: "Play",
    copy: "The Rift awaits. Give everything you've got. Good luck, Summoner.",
    icon: Swords,
  },
];

function Node({ progress, at, Icon }) {
  const start = Math.max(0, at - 0.12);
  const mid = Math.min(1, at + 0.02);
  const scale = useTransform(progress, [start, mid], [0.6, 1]);
  const opacity = useTransform(progress, [start, mid], [0.25, 1]);
  const ringOpacity = useTransform(progress, [start, mid], [0, 1]);
  const [reached, setReached] = useState(false);

  useMotionValueEvent(progress, "change", (v) => {
    setReached(v >= mid - 0.001);
  });

  return (
    <div className="relative grid place-items-center">
      <span className="absolute h-14 w-14 rounded-full bg-[#0d0d0d]" />
      <motion.span
        style={{ opacity: ringOpacity }}
        className="absolute h-14 w-14 rounded-full ring-[6px] ring-[rgba(102,0,0,0.3)]"
      />
      {reached && (
        <motion.span
          aria-hidden
          className="absolute h-12 w-12 rounded-full bg-[#DC143C]"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <motion.span
        style={{ scale, opacity }}
        animate={
          reached
            ? { backgroundColor: "rgb(220 20 60)", color: "rgb(255 255 255)" }
            : {}
        }
        transition={{ duration: 0.35 }}
        className="relative grid place-items-center h-12 w-12 rounded-full bg-[rgba(20,20,20,0.9)] text-neutral-400 border border-[rgba(102,0,0,0.45)]"
      >
        <Icon className="h-5 w-5" />
      </motion.span>
    </div>
  );
}

function Card({ step, side }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20%" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`w-full md:w-[44%] rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] backdrop-blur-md shadow-[0_0_32px_rgba(102,0,0,0.18),inset_0_0_24px_rgba(102,0,0,0.05)] overflow-hidden ${
        side === "left" ? "md:mr-auto" : "md:ml-auto"
      }`}
    >
      <div className="p-6 sm:p-7">
        <h3 className="flex flex-wrap items-center gap-2.5 font-heading text-white text-[22px] sm:text-[26px] tracking-[1.5px] leading-none [text-shadow:0_0_14px_rgba(139,0,0,0.6)]">
          {step.title}
          {step.tag && (
            <span className="font-slogan text-[10px] font-bold tracking-[2px] uppercase text-accent-gold border border-accent-gold rounded px-2 py-0.5 opacity-85">
              {step.tag}
            </span>
          )}
        </h3>
        <p className="mt-3 font-body text-[14px] sm:text-[15px] text-neutral-400 leading-relaxed">
          {step.copy}
        </p>
      </div>
    </motion.article>
  );
}

export default function HowItWorks() {
  const ref = useRef(null);
  const firstNodeRef = useRef(null);
  const lastNodeRef = useRef(null);
  const scrollYProgress = useMotionValue(0);
  const [lineBounds, setLineBounds] = useState({ top: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;

    const tick = () => {
      const container = ref.current;
      const first = firstNodeRef.current;
      const last = lastNodeRef.current;
      if (container && first && last) {
        const win = container.ownerDocument.defaultView ?? window;
        const vh =
          win.innerHeight || container.ownerDocument.documentElement.clientHeight;
        const containerRect = container.getBoundingClientRect();
        const firstRect = first.getBoundingClientRect();
        const lastRect = last.getBoundingClientRect();

        const firstCenterY = firstRect.top + firstRect.height / 2;
        const lastCenterY = lastRect.top + lastRect.height / 2;

        const activate = vh * 0.55;

        const span = lastCenterY - firstCenterY;
        if (span > 0) {
          const p = (activate - firstCenterY) / span;
          scrollYProgress.set(Math.min(1, Math.max(0, p)));
        }

        const top = firstCenterY - containerRect.top;
        const height = lastCenterY - firstCenterY;
        setLineBounds((prev) =>
          prev.top === top && prev.height === height ? prev : { top, height }
        );
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scrollYProgress]);

  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="relative z-[2] w-full flex items-start py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Crimson light-pillar backdrop — behind the text, screen-blended so it
          only adds glow and never darkens the copy. */}
      <Suspense fallback={null}>
        <LightPillar
          className="z-0 pointer-events-none opacity-70 [mask-image:linear-gradient(to_bottom,transparent_0%,black_22%,black_78%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_22%,black_78%,transparent_100%)]"
          topColor="#DC143C"
          bottomColor="#7B1A1A"
          intensity={0.65}
          rotationSpeed={0.22}
          glowAmount={0.004}
          pillarWidth={3}
          pillarHeight={0.4}
          noiseIntensity={0.35}
          pillarRotation={20}
          interactive={false}
          mixBlendMode="screen"
          quality="medium"
        />
      </Suspense>

      <div className="relative z-10 max-w-[1200px] mx-auto w-full flex flex-col items-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="font-slogan text-[11px] font-bold tracking-[4px] text-[#DC143C] uppercase"
        >
          How it works
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-5 font-heading text-white text-[40px] sm:text-[56px] md:text-[64px] text-center tracking-[2px] leading-[0.95] max-w-2xl uppercase [text-shadow:0_0_20px_rgba(139,0,0,0.8),0_0_48px_rgba(102,0,0,0.4)]"
        >
          Tournament Journey
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-5 max-w-md text-center font-body text-[15px] sm:text-base text-neutral-400"
        >
          Everything you need to know — from sign-up to the Rift.
        </motion.p>

        <div ref={ref} className="relative mt-20 sm:mt-28 w-full">
          <div
            aria-hidden
            style={{ top: lineBounds.top, height: lineBounds.height }}
            className="absolute left-1/2 -translate-x-1/2 w-px border-l border-dashed border-[rgba(102,0,0,0.35)]"
          />
          <motion.div
            aria-hidden
            style={{
              top: lineBounds.top,
              height: lineBounds.height,
              scaleY: lineScale,
              transformOrigin: "top",
            }}
            className="absolute left-1/2 -translate-x-1/2 w-px bg-[#DC143C] shadow-[0_0_8px_rgba(220,20,60,0.7)]"
          />

          <div className="flex flex-col gap-16 sm:gap-24">
            {steps.map((step, i) => {
              const side = i % 2 === 0 ? "left" : "right";
              const at = i / Math.max(1, steps.length - 1);
              const isFirst = i === 0;
              const isLast = i === steps.length - 1;
              return (
                <div key={step.title} className="relative flex flex-col items-center">
                  <div
                    ref={isFirst ? firstNodeRef : isLast ? lastNodeRef : undefined}
                    className="relative z-10"
                  >
                    <Node progress={scrollYProgress} at={at} Icon={step.icon} />
                  </div>
                  <div className="mt-8 w-full flex">
                    <Card step={step} side={side} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
