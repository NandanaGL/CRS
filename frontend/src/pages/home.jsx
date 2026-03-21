import { useEffect, useState, Suspense, lazy, memo } from "react";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

// Lazy loading heavy modules
const SummaryPage = lazy(() => import("./summarypage.jsx"));
const PatientChatPage = lazy(() => import("./patientchatbot.jsx"));

/* ---------- REFINED HUD STYLES ---------- */
const getHomeStyles = (isDark) => `
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: ${isDark ? "rgba(167, 139, 246, 0.3)" : "rgba(109, 40, 217, 0.3)"};
    border-radius: 10px;
  }

  .snap-container {
    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${isDark ? "%23a78bfa" : "%236d28d9"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M2 12h20"></path></svg>') 12 12, crosshair !important;
  }

  @keyframes scanline {
    0% { top: 0%; opacity: 0; }
    5% { opacity: ${isDark ? "0.05" : "0.03"}; }
    95% { opacity: ${isDark ? "0.05" : "0.03"}; }
    100% { top: 100%; opacity: 0; }
  }
  .hud-scanline {
    position: absolute;
    width: 100%;
    height: 1px;
    background: linear-gradient(to right, transparent, ${isDark ? "#a78bfa" : "#7c3aed"}, transparent);
    animation: scanline 10s linear infinite;
    z-index: 10;
    pointer-events: none;
  }

  .btn-hover-effect:hover {
    box-shadow: 0 0 30px ${isDark ? "rgba(139, 92, 246, 0.4)" : "rgba(109, 40, 217, 0.35)"};
    transform: translateY(-2px);
  }

  .silver-text {
    background: ${
      isDark
        ? "linear-gradient(180deg, #ffffff 0%, #c0c0c0 40%, #888888 100%)"
        : "linear-gradient(180deg, #1a1a2e 0%, #4a4a6a 40%, #2d2d4e 100%)"
    };
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const CRSIntro = memo(({ isDark }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* HUD Frame Brackets */}
      <div className={`absolute top-12 left-12 w-8 h-8 border-t-2 border-l-2 z-20 transition-colors duration-500 ${isDark ? "border-white/5" : "border-violet-300/40"}`} />
      <div className={`absolute top-12 right-12 w-8 h-8 border-t-2 border-r-2 z-20 transition-colors duration-500 ${isDark ? "border-white/5" : "border-violet-300/40"}`} />
      <div className={`absolute bottom-12 left-12 w-8 h-8 border-b-2 border-l-2 z-20 transition-colors duration-500 ${isDark ? "border-white/5" : "border-violet-300/40"}`} />
      <div className={`absolute bottom-12 right-12 w-8 h-8 border-b-2 border-r-2 z-20 transition-colors duration-500 ${isDark ? "border-white/5" : "border-violet-300/40"}`} />

      {/* Subtle Grid Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-30 flex flex-col items-center text-center px-6 max-w-5xl animate-in fade-in duration-1000">
        <div className="mb-10 flex flex-col items-center">
          <h1 className="silver-text text-7xl md:text-9xl font-black tracking-tighter leading-none mb-2">
            CLINICAL
          </h1>
          <h2 className={`text-4xl md:text-6xl font-light tracking-[0.25em] uppercase transition-colors duration-500 ${isDark ? "text-violet-400" : "text-violet-700"}`}>
            REVIEW SYSTEM
          </h2>
          <div className={`mt-8 h-[1px] w-24 transition-colors duration-500 ${isDark ? "bg-white/10" : "bg-violet-200"}`} />
        </div>

        <p className={`max-w-md text-[11px] md:text-xs leading-relaxed uppercase tracking-[0.2em] mb-12 transition-colors duration-500 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
          Transforming complex clinical data into structured, actionable intelligence. Secure, precise, and built for modern healthcare documentation
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <a
            href="#summary"
            className={`btn-hover-effect min-w-[220px] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] rounded-sm transition-all ${
              isDark ? "bg-violet-600 text-white" : "bg-violet-700 text-white"
            }`}
          >
            Initialize Review
          </a>
          <a
            href="#chatbot"
            className={`min-w-[220px] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] rounded-sm transition-all ${
              isDark
                ? "border border-white/10 text-white hover:bg-white/5"
                : "border border-violet-300 text-violet-800 hover:bg-violet-50"
            }`}
          >
            Open Patient Portal
          </a>
        </div>
      </div>

      <div className="hud-scanline" />
    </div>
  );
});

export default function Home() {
  const [activeSection, setActiveSection] = useState("intro");
  const { isDark } = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.4 }
    );
    document.querySelectorAll("section").forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      id="main-snap-container"
      className={`snap-container h-screen w-full overflow-y-scroll scroll-smooth snap-y snap-mandatory custom-scrollbar relative transition-colors duration-500 ${
        isDark ? "bg-[#010103] text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      <style>{getHomeStyles(isDark)}</style>

      <ThemeToggle />

      {/* HUD SIDEBAR NAVIGATION */}
      <div className="fixed right-10 top-1/2 -translate-y-1/2 z-[100] flex flex-col items-center gap-10">
        {["intro", "summary", "chatbot"].map((id) => (
          <a key={id} href={`#${id}`} className="group relative flex items-center justify-center">
            <span
              className={`absolute right-10 text-[9px] font-black uppercase tracking-[0.4em] transition-all duration-500 whitespace-nowrap ${
                activeSection === id
                  ? `opacity-100 translate-x-0 ${isDark ? "text-violet-400" : "text-violet-700"}`
                  : `opacity-0 translate-x-4 pointer-events-none ${isDark ? "text-slate-600" : "text-slate-400"}`
              }`}
            >
              {id === "intro" ? "LOG_01" : id === "summary" ? "ANLYS_02" : "PORTAL_03"}
            </span>
            <div
              className={`h-1.5 w-1.5 rounded-full border transition-all duration-500 ${
                activeSection === id
                  ? `scale-150 ${
                      isDark
                        ? "bg-violet-500 border-violet-500 shadow-[0_0_12px_#8b5cf6]"
                        : "bg-violet-700 border-violet-700 shadow-[0_0_12px_rgba(109,40,217,0.5)]"
                    }`
                  : `bg-transparent ${isDark ? "border-white/20 group-hover:border-white/50" : "border-slate-300 group-hover:border-violet-500"}`
              }`}
            />
          </a>
        ))}
      </div>

      <section id="intro" className="snap-start h-screen w-full flex items-center justify-center">
        <CRSIntro isDark={isDark} />
      </section>

      <section
        id="summary"
        className={`snap-start h-screen w-full flex items-center justify-center px-12 lg:px-24 transition-colors duration-500 ${isDark ? "" : "bg-slate-50"}`}
      >
        <Suspense fallback={<div className={`text-[10px] uppercase ${isDark ? "text-violet-500" : "text-violet-700"}`}>Decrypting...</div>}>
          <div
            className={`w-full max-w-[1500px] transition-all duration-700 transform ${
              activeSection === "summary" ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 translate-x-8"
            }`}
          >
            <SummaryPage />
          </div>
        </Suspense>
      </section>

      <section
        id="chatbot"
        className={`snap-start h-screen w-full flex items-center justify-center px-12 lg:px-24 transition-colors duration-500 ${isDark ? "" : "bg-slate-50"}`}
      >
        <Suspense fallback={<div className={`text-[10px] uppercase ${isDark ? "text-sky-500" : "text-sky-700"}`}>Connecting...</div>}>
          <div
            className={`w-full max-w-[1500px] flex justify-center transition-all duration-700 transform ${
              activeSection === "chatbot" ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 translate-x-8"
            }`}
          >
            <PatientChatPage />
          </div>
        </Suspense>
      </section>
    </div>
  );
}