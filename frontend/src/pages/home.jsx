// src/pages/home.jsx
import PatientChatPage from "./patientchatbot.jsx";
import SummaryPage from "./summarypage.jsx";

function CRSIntro() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {/* Hero Gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.55),transparent_55%),radial-gradient(circle_at_center,_rgba(129,140,248,0.4),transparent_60%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.35),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black" />

      {/* Pill Label */}
      <div className="relative mb-6 flex flex-col items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-500/10 px-3 py-1 text-[11px] text-violet-100">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          CRS Studio is now in beta
        </span>
      </div>

      {/* Main Text */}
      <div className="relative flex flex-col items-center gap-5 text-center px-4">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-50">
          The Clinic Record <span className="text-violet-300">Framework</span>
        </h1>

        <p className="max-w-xl text-sm md:text-base text-slate-300">
          One workspace for summaries, investigations, and patient chat. 
          Set it up once for your clinic and get structured, readable 
          information for every visit.
        </p>

        {/* Buttons */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs">
          <a
            href="#summary"
            className="rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-400 px-5 py-2 font-semibold text-slate-950 shadow-[0_0_30px_rgba(168,85,247,0.8)] hover:brightness-110"
          >
            Get started
          </a>

          <a
            href="#chatbot"
            className="rounded-full border border-slate-500/70 bg-white/5 px-5 py-2 font-medium text-slate-200 hover:border-violet-300 hover:text-violet-100"
          >
            Open patient chat
          </a>
        </div>
      </div>

      {/* Bottom Shape */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-40 w-[80%] -translate-x-1/2 rounded-t-[3rem] bg-gradient-to-t from-black via-slate-950/80 to-transparent border-t border-white/10" />
    </div>
  );
}

function SummarySection() {
  return (
    <div className="w-full max-w-5xl px-6 md:px-10 lg:px-16">
      <SummaryPage />
    </div>
  );
}

export default function Home() {
  return (
    <div className="h-screen w-full overflow-y-scroll scroll-smooth snap-y snap-mandatory bg-[#020314] text-slate-100">

      {/* 1. Neon CRS Landing Hero */}
      <section
        id="intro"
        className="snap-start h-screen flex items-center justify-center px-4"
      >
        <CRSIntro />
      </section>

      {/* 2. Doctor Summary Section */}
      <section
        id="summary"
        className="snap-start h-screen flex items-center justify-center border-t border-white/5 px-4"
      >
        <SummarySection />
      </section>

      {/* 3. Chatbot Section */}
      <section
        id="chatbot"
        className="snap-start h-screen flex items-center justify-center border-t border-white/5 px-4"
      >
        <div className="w-full max-w-5xl flex justify-center scale-90 md:scale-100">
          <PatientChatPage />
        </div>
      </section>

    </div>
  );
}