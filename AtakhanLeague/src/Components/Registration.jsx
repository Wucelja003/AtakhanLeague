import RegistrationWizard from './RegistrationWizard';

export default function Registration() {
  return (
    <section className="relative z-[2] mt-[100px] px-5 py-4">
      <div className="flex flex-col items-center text-center">
        <span className="font-slogan text-[15px] font-bold uppercase tracking-[5px] text-secondary">
          Registration
        </span>
        <h2 className="mt-3 font-heading text-[48px] leading-none tracking-[2px] text-transparent bg-clip-text bg-[linear-gradient(90deg,#660000,#DC143C,#660000)] [filter:drop-shadow(0_0_18px_rgba(139,0,0,0.5))] sm:text-[60px]">
          Enter the Rift
        </h2>
        <span className="mt-5 h-[2px] w-24 rounded-full bg-[linear-gradient(90deg,transparent,#DC143C,transparent)]" />
      </div>

      <div className="mt-[50px]">
        <RegistrationWizard />
      </div>
    </section>
  );
}
