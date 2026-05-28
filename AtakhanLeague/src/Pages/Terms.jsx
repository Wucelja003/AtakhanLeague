const sections = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using the Atakhan League website, services, tournaments, or community channels, you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, you must not use the platform.`,
  },
  {
    title: '2. Eligibility',
    body: `You must be at least 13 years of age to create an account. By registering, you confirm that the information you provide is accurate and that you own the Riot Games account associated with the Summoner Name you register.`,
  },
  {
    title: '3. Tournament Rules',
    body: `All participants must follow the official ruleset published before each tournament. Cheating, scripting, account sharing, or any form of toxic behavior toward other players, casters, or organizers will result in disqualification and a permanent ban.`,
  },
  {
    title: '4. Account Responsibility',
    body: `You are responsible for keeping your login credentials secure. Any actions performed under your account are your responsibility. Atakhan League is not liable for losses resulting from unauthorized access to your account.`,
  },
  {
    title: '5. Fair Play',
    body: `We have zero tolerance for boosting, smurfing in lower divisions, win-trading, match-fixing, or any other behavior that compromises the integrity of competition. Suspected violations will be investigated and may result in immediate removal from the tournament.`,
  },
  {
    title: '6. Prizes & Rewards',
    body: `Prize distribution will be detailed prior to each tournament. Atakhan League reserves the right to delay or cancel prize delivery in case of suspected rule violations or disputes pending investigation.`,
  },
  {
    title: '7. User Content',
    body: `By submitting content (team name, summoner name, messages, profile information) you grant Atakhan League a non-exclusive license to display it across our platform and social channels for the purpose of running tournaments and promoting events.`,
  },
  {
    title: '8. Privacy',
    body: `We collect and process personal data (email, summoner name, account activity) solely for the purpose of running the platform and tournaments. We do not sell your data to third parties. For details, see our Privacy Policy.`,
  },
  {
    title: '9. Changes to Terms',
    body: `Atakhan League reserves the right to update these Terms at any time. Continued use of the platform after changes are posted constitutes acceptance of the revised Terms.`,
  },
  {
    title: '10. Disclaimer',
    body: `Atakhan League is an independent community-run tournament platform and is not endorsed by, sponsored by, or affiliated with Riot Games, Inc. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc.`,
  },
];

export default function Terms() {
  return (
    <section className="relative z-[2] min-h-[calc(100vh-200px)] px-5 py-16">
      <div className="mx-auto max-w-3xl">
        {/* Heading */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5 border border-[rgba(220,20,60,0.4)] bg-[rgba(220,20,60,0.12)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC143C]" />
            <span className="font-slogan text-xs font-bold uppercase tracking-[3px] text-[#DC143C]">
              Legal
            </span>
          </div>
          <h1 className="font-heading text-white text-[clamp(2.5rem,5vw,3.5rem)] leading-none tracking-wide [text-shadow:0_0_18px_rgba(139,0,0,0.8),0_0_40px_rgba(102,0,0,0.4)]">
            Terms & Conditions
          </h1>
          <p className="font-slogan text-[11px] tracking-[3px] uppercase text-neutral-500 mt-5">
            Last updated: 26 May 2026
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-10 py-10 backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.22),inset_0_0_24px_rgba(102,0,0,0.06)] animate-form-fade-in">
          <p className="font-body text-[16px] leading-8 text-neutral-300 mb-8 pb-8 border-b border-[rgba(102,0,0,0.3)]">
            Welcome to Atakhan League. These Terms of Use govern your access to and use
            of our platform, tournaments, and services. Please read them carefully.
          </p>

          <div className="flex flex-col gap-8">
            {sections.map((s, i) => (
              <div key={i}>
                <h2 className="font-slogan text-[14px] font-bold uppercase tracking-[2px] text-white mb-3 [text-shadow:0_0_10px_rgba(220,20,60,0.3)]">
                  {s.title}
                </h2>
                <p className="font-body text-[15px] leading-7 text-neutral-400">
                  {s.body}
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-[rgba(102,0,0,0.3)] text-center">
            <p className="font-body text-sm text-neutral-500">
              For any questions about these Terms, contact us at{' '}
              <a
                href="mailto:admin@atakhanleague.com"
                className="text-secondary hover:text-[#DC143C] transition-colors"
              >
                admin@atakhanleague.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
