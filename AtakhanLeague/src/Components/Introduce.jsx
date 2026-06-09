export default function Introduce() {
  return (
    <section className="relative z-[2] mt-[80px] sm:mt-[100px] px-5 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="border-l-[3px] border-[#660000] pl-5 sm:pl-7 animate-slide-in-left">
          <h2 className="relative inline-block font-heading text-[28px] sm:text-[36px] lg:text-[44px] text-white pb-3 mb-5 sm:mb-7 [text-shadow:0_0_18px_rgba(139,0,0,0.9),0_0_40px_rgba(102,0,0,0.5)] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:rounded-sm after:bg-[linear-gradient(90deg,#660000,#DC143C,#8B0000,#660000)]">
            What is Atakhan League?
          </h2>

          <p className="font-body text-[15px] sm:text-[17px] lg:text-[18px] leading-7 sm:leading-8 text-neutral-300">
            In honor of Atakhan, the ancient demon of bloodshed who once
            roamed the Summoner's Rift, a group of passionate League of
            Legends enthusiasts built a platform worthy of his legacy.
            <br /><br />
            Atakhan League was created for every player who lives and
            breathes League of Legends — regardless of rank, regardless
            of division. Here, every summoner gets a real shot at
            competing, climbing, and walking away with prizes that
            match their hunger for victory.
            <br /><br />
            This is not just a platform. This is your Rift.
          </p>
        </div>

      </div>
      <hr className="mt-16 sm:mt-20 border-0 h-[2px] bg-[linear-gradient(90deg,transparent,#DC143C,#8B0000,#DC143C,transparent)] shadow-[0_0_12px_rgba(220,20,60,0.5)]" />
    </section>
  );
}