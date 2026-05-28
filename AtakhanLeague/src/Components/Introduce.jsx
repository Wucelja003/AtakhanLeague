export default function Introduce() {
  return (
    <section className="relative z-[2] mt-[100px] px-5 py-20">
      <div className="mx-auto flex max-w-6xl items-center gap-[60px]">
        <div className="flex-1 border-l-[3px] border-[#660000] pl-7 animate-slide-in-left">
          <h2 className="relative inline-block font-heading text-[44px] text-white pb-3.5 mb-7 [text-shadow:0_0_18px_rgba(139,0,0,0.9),0_0_40px_rgba(102,0,0,0.5)] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:rounded-sm after:bg-[linear-gradient(90deg,#660000,#DC143C,#8B0000,#660000)]">
            What is Atakhan League?
          </h2>

          <p className="font-body text-[18px] leading-8 text-neutral-300">
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

        <img
          src="/mainDemon-removebg-preview.png"
          alt="Atakhan Demon"
          className="flex-1 w-full max-w-[480px] animate-slide-in-right"
        />
      </div>
      <hr className="mt-20 border-0 h-[2px] bg-[linear-gradient(90deg,transparent,#DC143C,#8B0000,#DC143C,transparent)] shadow-[0_0_12px_rgba(220,20,60,0.5)]" />
    </section>
  );
}
