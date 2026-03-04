// src/pages/home.jsx
import { useEffect } from "react"; // <-- Added import here
import PatientChatPage from "./patientchatbot.jsx";
import SummaryPage from "./summarypage.jsx";

function CRSIntro() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {/* Hero Gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.55),transparent_55%),radial-gradient(circle_at_center,_rgba(129,140,248,0.4),transparent_60%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.35),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black" />

      {/* Animated Background Orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 left-1/4 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      

      {/* Main Text */}
      <div className="relative flex flex-col items-center gap-6 text-center px-4 z-10 max-w-4xl">
        <h6 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-50 leading-tight">
          The Clinic Record <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-sky-400">Framework</span>
        </h6>

        <p className="max-w-2xl text-base md:text-lg text-slate-300 leading-relaxed">
          One workspace for summaries, investigations, and patient chat. 
          Set it up once for your clinic and get structured, readable 
          information for every visit.
        </p>

        
        {/* Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
          <a
            href="#summary"
            className="group relative rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-400 px-8 py-3 font-semibold text-slate-950 shadow-[0_0_30px_rgba(168,85,247,0.8)] hover:shadow-[0_0_40px_rgba(168,85,247,1)] transition-all duration-300 hover:scale-105"
          >
            <span className="relative z-10">Get started</span>
            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          <a
            href="#chatbot"
            className="group rounded-full border-2 border-slate-500/70 bg-white/5 px-8 py-3 font-semibold text-slate-200 hover:border-violet-400 hover:bg-white/10 hover:text-violet-100 transition-all duration-300 backdrop-blur-sm"
          >
            Open patient chat
          </a>
        </div>

        {/* Stats or Info */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-center opacity-80">
          <div>
            <div className="text-2xl font-bold text-violet-400">Fast</div>
            <div className="text-xs text-slate-500">Processing</div>
          </div>
          <div className="h-8 w-px bg-slate-700/50" />
          <div>
            <div className="text-2xl font-bold text-fuchsia-400">Secure</div>
            <div className="text-xs text-slate-500">Data Handling</div>
          </div>
          <div className="h-8 w-px bg-slate-700/50" />
          <div>
            <div className="text-2xl font-bold text-sky-400">Smart</div>
            <div className="text-xs text-slate-500">AI Analysis</div>
          </div>
        </div>
      </div>

      {/* Bottom Shape */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-40 w-[80%] -translate-x-1/2 rounded-t-[3rem] bg-gradient-to-t from-black via-slate-950/80 to-transparent" />
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
  // <-- Added this useEffect block
  useEffect(() => {
    // 1. Force the window to scroll to the top immediately
    window.scrollTo(0, 0);
    
    // 2. Clean the URL so the hash doesn't trigger a jump on reload
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  return (
    <div className="h-screen w-full overflow-y-scroll scroll-smooth snap-y snap-mandatory bg-[#020314] text-slate-100">

      {/* 1. Neon CRS Landing Hero */}
      <section
        id="intro"
        className="snap-start h-screen flex items-center justify-center px-4"
        style={{ minHeight: '100vh' }}
      >
        <CRSIntro />
      </section>

      {/* 2. Doctor Summary Section */}
      <section
        id="summary"
        className="snap-start h-screen flex items-center justify-center border-t border-white/5 px-4"
        style={{ minHeight: '100vh' }}
      >
        <SummarySection />
      </section>

      {/* 3. Chatbot Section */}
      <section
        id="chatbot"
        className="snap-start h-screen flex items-center justify-center border-t border-white/5 px-4"
        style={{ minHeight: '100vh' }}
      >
        <div className="w-full max-w-5xl flex justify-center scale-90 md:scale-100">
          <PatientChatPage />
        </div>
      </section>

    </div>
  );
}