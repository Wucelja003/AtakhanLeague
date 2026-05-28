const steps = [
  {
    title: 'Register',
    desc: 'Fill out the registration form — as a full team or as an individual looking to compete.',
  },
  {
    title: 'Confirmation',
    desc: 'Receive an email confirmation with your registration details and payment information.',
  },
  {
    title: 'Team Assignment',
    tag: 'Individual players',
    desc: 'Solo registrants get assigned to a team by our organizers before the tournament kicks off.',
  },
  {
    title: 'Draw & Schedule',
    desc: 'Teams are drawn and the full match schedule is published. Study your bracket, Summoner.',
  },
  {
    title: 'Check-In',
    desc: 'Check in on Discord or the site at least 30 minutes before your scheduled match.',
  },
  {
    title: 'Play',
    desc: "The Rift awaits. Give everything you've got. Good luck, Summoner.",
  },
];

export default function Journey() {
  return (
    <section className="relative z-[2] mt-[120px] px-5 pb-20">
      <div className="mx-auto max-w-[860px]">
        <div className="text-center mb-[72px]">
          <h2 className="font-heading text-white text-[64px] mb-3 [text-shadow:0_0_18px_rgba(139,0,0,0.9),0_0_40px_rgba(102,0,0,0.5)]">
            Tournament Journey
          </h2>
          <p className="font-body text-[18px] text-neutral-400">
            Everything you need to know — from sign-up to the Rift.
          </p>
        </div>

        <div className="flex flex-col items-center">
          {steps.map((step, i) => (
            <div
              key={i}
              className="group grid grid-cols-[64px_40px_1fr] items-stretch w-full"
            >
              <div className="self-start mt-1.5 w-[52px] h-[52px] rounded-full bg-secondary text-white font-heading text-2xl flex items-center justify-center shadow-[0_0_18px_rgba(139,0,0,0.55),0_0_36px_rgba(139,0,0,0.3)] transition-all duration-200 group-hover:scale-110 group-hover:shadow-[0_0_28px_rgba(139,0,0,0.7),0_0_50px_rgba(139,0,0,0.4)]">
                {i + 1}
              </div>

              <div
                className={`mx-auto w-[2px] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] ${
                  i === steps.length - 1 ? 'opacity-0' : ''
                }`}
              />

              <div className="mb-4 px-7 py-6 rounded-xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.3)] backdrop-blur-md transition-all duration-300 hover:border-[rgba(139,0,0,0.6)] hover:shadow-[0_0_32px_rgba(102,0,0,0.2)]">
                <h3 className="flex flex-wrap items-center gap-2.5 mb-2 font-slogan text-[17px] font-bold tracking-wider text-white">
                  {step.title}
                  {step.tag && (
                    <span className="font-slogan text-[10px] font-bold tracking-[2px] uppercase text-accent-gold border border-accent-gold rounded px-2 py-0.5 opacity-85">
                      {step.tag}
                    </span>
                  )}
                </h3>
                <p className="font-body text-[15px] leading-6 text-neutral-400">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
