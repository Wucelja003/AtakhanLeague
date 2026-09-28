import { Link } from 'react-router-dom';
import RegistrationWizard from './RegistrationWizard';
import { REGISTRATION_OPEN, CANCELLED_NOTE } from '../utils/tournaments';

export default function Registration() {
  return (
    <section className="relative z-[2] mt-[100px] px-5 py-4">
      <div className="flex flex-col items-center text-center">
        <span className="font-slogan text-[15px] font-bold uppercase tracking-[5px] text-secondary">
          Registration
        </span>
        <h2 className="mt-3 font-heading text-[48px] leading-none tracking-[2px] text-transparent bg-clip-text bg-[linear-gradient(90deg,#660000,#DC143C,#660000)] [filter:drop-shadow(0_0_18px_rgba(139,0,0,0.5))] sm:text-[60px]">
          {REGISTRATION_OPEN ? 'Enter the Rift' : 'Registration Closed'}
        </h2>
        <span className="mt-5 h-[2px] w-24 rounded-full bg-[linear-gradient(90deg,transparent,#DC143C,transparent)]" />
      </div>

      <div className="mt-[50px]">
        {/* The form is taken down rather than disabled — a greyed-out wizard
            still invites someone to work through it before it refuses them. */}
        {REGISTRATION_OPEN ? (
          <RegistrationWizard />
        ) : (
          <div className="mx-auto max-w-2xl rounded-2xl border border-[rgba(102,0,0,0.45)] bg-[rgba(10,10,10,0.7)] px-6 py-10 text-center backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.22),inset_0_0_24px_rgba(102,0,0,0.06)]">
            <p className="font-slogan text-[12px] font-bold uppercase tracking-[4px] text-[#DC143C]">
              No tournaments open
            </p>
            <p className="mx-auto mt-4 max-w-lg font-body text-[15px] leading-relaxed text-neutral-300">
              {CANCELLED_NOTE}
            </p>
            <Link
              to="/contact-us"
              className="mt-7 inline-block rounded-[20px] border border-[rgba(139,0,0,0.6)] bg-[rgba(123,26,26,0.15)] px-8 py-3 font-slogan text-[12px] font-bold uppercase tracking-[3px] text-[#cc3333] transition-colors duration-300 hover:border-[#DC143C] hover:text-white"
            >
              Contact us
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
