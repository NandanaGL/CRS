import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import { 
  FileText, Trash2, Download, AlertTriangle, CheckCircle, 
  Stethoscope, Pill, Microscope, ClipboardList, Activity,
  Info, Zap, UploadCloud, User 
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

/* ---------- CUSTOM GLOBAL STYLES ---------- */
const getCustomGlobalStyles = (isDark) => `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: ${isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.04)"};
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: ${isDark ? "rgba(139,92,246,0.3)" : "rgba(109,40,217,0.25)"};
    border-radius: 10px;
  }
  .custom-scrollbar:hover::-webkit-scrollbar-thumb {
    background: ${isDark ? "rgba(139,92,246,0.6)" : "rgba(109,40,217,0.5)"};
  }
  body {
    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${isDark ? "%23a78bfa" : "%236d28d9"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M2 12h20"></path></svg>') 12 12, crosshair !important;
  }
  button, a, input, select, textarea, .cursor-pointer {
    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2338bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4" fill="%2338bdf8"></circle></svg>') 12 12, pointer !important;
  }
`;

/* ---------- SCROLL REVEAL ANIMATION WRAPPER ---------- */
function ScrollReveal({ children, animationStyle = "fade-up", delay = 0, className = "" }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const styles = {
    "fade-up": isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
    "zoom-in": isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90",
    "slide-right": isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12",
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${styles[animationStyle]} w-full h-full ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ---------- SECTION CARD ---------- */
function Section({ title, text, icon: Icon, accent = "violet", isDark, className = "" }) {
  if (!text || text === "Not mentioned") return null;

  const accentMap = {
    violet: {
      border: isDark ? "border-violet-500/20" : "border-violet-300/60",
      glow: isDark ? "bg-violet-500/10" : "bg-violet-100",
      text: isDark ? "text-violet-400" : "text-violet-700",
      iconBg: isDark ? "bg-violet-500/10" : "bg-violet-100",
    },
    blue: {
      border: isDark ? "border-sky-500/20" : "border-sky-300/60",
      glow: isDark ? "bg-sky-500/10" : "bg-sky-100",
      text: isDark ? "text-sky-400" : "text-sky-700",
      iconBg: isDark ? "bg-sky-500/10" : "bg-sky-100",
    },
    emerald: {
      border: isDark ? "border-emerald-500/20" : "border-emerald-300/60",
      glow: isDark ? "bg-emerald-500/10" : "bg-emerald-100",
      text: isDark ? "text-emerald-400" : "text-emerald-700",
      iconBg: isDark ? "bg-emerald-500/10" : "bg-emerald-100",
    },
    amber: {
      border: isDark ? "border-amber-500/20" : "border-amber-300/60",
      glow: isDark ? "bg-amber-500/10" : "bg-amber-100",
      text: isDark ? "text-amber-400" : "text-amber-700",
      iconBg: isDark ? "bg-amber-500/10" : "bg-amber-100",
    },
  };

  const theme = accentMap[accent];

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-[2rem] backdrop-blur-md border transition-all duration-300 p-6 ${
        isDark
          ? `bg-[#0a0a14]/80 border-white/[0.05] hover:border-white/[0.1] hover:bg-[#0f0f1c] hover:shadow-xl`
          : `bg-white/80 border-slate-200 hover:border-violet-200 hover:shadow-lg shadow-sm`
      } ${className}`}
    >
      <div className={`absolute -top-10 -left-10 h-32 w-32 rounded-full blur-[50px] opacity-30 transition-opacity duration-500 group-hover:opacity-60 pointer-events-none ${theme.glow}`} />

      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className={`p-2 rounded-xl border ${theme.iconBg} ${theme.text} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className={`text-[13px] font-bold uppercase tracking-widest ${isDark ? "text-slate-200" : "text-slate-700"}`}>
          {title}
        </h3>
      </div>

      <div className="relative z-10 pl-1 flex-1">
        <p className={`text-[14px] leading-relaxed font-medium whitespace-pre-wrap break-words ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          {text}
        </p>
      </div>
    </div>
  );
}

/* ---------- MAIN CONTENT ---------- */
export function SummaryContent() {
  const [files, setFiles] = useState([]);
  const [summary, setSummary] = useState(null);
  const [riskLevel, setRiskLevel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [patientName, setPatientName] = useState("");
  const { isDark } = useTheme();

  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.length) return;
    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      const res = await fetch("http://127.0.0.1:8000/summarize-multi", { method: "POST", body: formData });
      const data = await res.json();
      setSummary(data.summary);
      setRiskLevel(data.risk_level);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    const pdfTitle = patientName.trim() ? `${patientName}'s Medical Record` : "Patient Medical Record";
    doc.setFontSize(22);
    doc.text(pdfTitle, 20, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Status: ${riskLevel || "Stable"}`, 20, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 36);
    doc.setTextColor(0);

    let y = 50;
    const sections = [
      ["Presenting Complaint", summary.presenting_complaint],
      ["Medical History", summary.history],
      ["Medications & Allergies", summary.meds_allergies],
      ["Investigations", summary.investigations_timeline],
      ["Physician Remarks", doctorNotes],
    ];

    sections.forEach(([label, content]) => {
      if (!content) return;
      doc.setFont(undefined, "bold");
      doc.text(label.toUpperCase(), 20, y);
      doc.setFont(undefined, "normal");
      const splitText = doc.splitTextToSize(content, 170);
      doc.text(splitText, 20, y + 8);
      y += splitText.length * 6 + 16;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    const fileName = patientName.trim()
      ? `${patientName.replace(/\s+/g, "_")}_Medical_Record.pdf`
      : "Clinical_Report.pdf";
    doc.save(fileName);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-8 lg:flex-row h-[calc(100vh-80px)]">
      
      {/* LEFT: UPLOAD PANEL */}
      <section className="flex w-full flex-col gap-6 lg:w-[280px] h-full shrink-0">
        
        <div className="space-y-1 animate-in fade-in slide-in-from-left-8 duration-700">
          <h1 className={`text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r ${isDark ? "from-white to-slate-400" : "from-slate-800 to-slate-500"}`}>
            REPORTS
          </h1>
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Automated Clinical Synthesis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-5">
          <div className="space-y-3 animate-in fade-in slide-in-from-left-8 duration-700 delay-100 fill-mode-both">
            <label className={`text-[10px] font-black uppercase tracking-widest pl-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Patient Details
            </label>
            <div className="relative group">
              <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isDark ? "text-slate-500 group-focus-within:text-violet-400" : "text-slate-400 group-focus-within:text-violet-600"}`} />
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Patient Name (Optional)"
                className={`w-full rounded-[1.5rem] py-3.5 pl-11 pr-4 text-sm outline-none transition-all shadow-inner ${
                  isDark
                    ? "bg-white/[0.02] border border-white/[0.08] text-slate-200 focus:border-violet-500/50 focus:bg-white/[0.04] placeholder:text-slate-600"
                    : "bg-white border border-slate-200 text-slate-800 focus:border-violet-400 focus:bg-violet-50/30 placeholder:text-slate-400"
                }`}
              />
            </div>
          </div>

          <div
            className={`group relative flex-1 flex flex-col items-center justify-center rounded-[2.5rem] border p-8 text-center cursor-pointer transition-all overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both ${
              isDark
                ? "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"
                : "border-slate-200 bg-white hover:bg-violet-50/30 hover:border-violet-300 shadow-sm"
            }`}
            onClick={() => !loading && fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files))} />
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none ${isDark ? "bg-violet-500/5" : "bg-violet-100/50"}`} />
            <div className="relative z-10 pointer-events-none">
              <div className={`mb-5 mx-auto w-14 h-14 rounded-[1.5rem] border flex items-center justify-center transition-all duration-500 shadow-xl group-hover:scale-110 ${
                isDark
                  ? "bg-white/[0.03] border-white/[0.08] text-violet-400 group-hover:text-white"
                  : "bg-violet-50 border-violet-200 text-violet-600 group-hover:text-violet-800"
              }`}>
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className={`text-[13px] font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>Import Files</p>
              <p className={`text-[9px] mt-2 uppercase tracking-widest font-black ${isDark ? "text-slate-600" : "text-slate-400"}`}>PDF • TXT • CSV</p>
            </div>
            <div className="w-full mt-6 space-y-2 overflow-y-auto max-h-[120px] custom-scrollbar relative z-10">
              {files.map((file, index) => (
                <div key={index} className={`flex justify-between items-center px-3 py-2 rounded-xl border text-[10px] animate-in zoom-in duration-300 ${
                  isDark ? "bg-black/60 border-white/[0.05] text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
                }`}>
                  <span className="truncate max-w-[150px] italic">{file.name}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !files.length}
            className={`group w-full rounded-[2rem] px-4 py-4 text-[11px] font-black transition-all hover:tracking-widest active:scale-95 disabled:opacity-20 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.1)] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both cursor-pointer ${
              isDark ? "bg-white text-black" : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {loading ? "PROCESSING..." : "RUN ANALYSIS"}
            {!loading && <Zap className={`w-3.5 h-3.5 fill-current transition-colors pointer-events-none ${isDark ? "group-hover:text-violet-600" : "group-hover:text-violet-400"}`} />}
          </button>
        </form>
      </section>

      {/* RIGHT: BENTO GRID DASHBOARD */}
      <section className={`flex-1 rounded-[3rem] border p-6 lg:p-8 flex flex-col relative overflow-hidden transition-colors duration-500 ${
        isDark
          ? "border-white/[0.05] bg-[#03030b]/80 backdrop-blur-2xl shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"
          : "border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm"
      }`}>
        
        {summary && !loading && (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-6 duration-700">
            
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 mb-6 border-b shrink-0 animate-in fade-in slide-in-from-top-4 duration-700 delay-150 fill-mode-both ${isDark ? "border-white/[0.05]" : "border-slate-200"}`}>
              
              {/* STATUS PILL */}
              <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border backdrop-blur-md transition-all duration-500 hover:scale-105 ${
                riskLevel === "High Risk"
                  ? isDark ? "border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)] bg-black/50" : "border-red-300 text-red-600 bg-red-50 shadow-sm"
                  : isDark ? "border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-black/50" : "border-emerald-300 text-emerald-600 bg-emerald-50 shadow-sm"
              }`}>
                <div className="flex h-1.5 w-1.5 relative">
                  <span className={`animate-ping absolute h-full w-full rounded-full opacity-75 ${riskLevel === "High Risk" ? "bg-red-500" : "bg-emerald-500"}`}></span>
                  <span className={`relative rounded-full h-1.5 w-1.5 ${riskLevel === "High Risk" ? "bg-red-600" : "bg-emerald-600"}`}></span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{riskLevel || "STABLE"} STATUS</span>
              </div>

              {patientName && (
                <div className="text-right animate-in fade-in slide-in-from-right-8 duration-500">
                  <h2 className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-slate-800"}`}>{patientName}</h2>
                  <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>Active File</p>
                </div>
              )}
            </div>

            {/* SCROLLABLE GRID AREA */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 auto-rows-fr">
                <ScrollReveal animationStyle="fade-up" delay={0}>
                  <Section title="Presenting Complaint" text={summary.presenting_complaint} icon={ClipboardList} accent="violet" isDark={isDark} />
                </ScrollReveal>
                <ScrollReveal animationStyle="fade-up" delay={150}>
                  <Section title="History" text={summary.history} icon={Activity} accent="blue" isDark={isDark} />
                </ScrollReveal>
                <ScrollReveal animationStyle="fade-up" delay={300}>
                  <Section title="Medications & Allergies" text={summary.meds_allergies} icon={Pill} accent="emerald" isDark={isDark} />
                </ScrollReveal>
                <ScrollReveal animationStyle="fade-up" delay={450}>
                  <Section title="Investigations" text={summary.investigations_timeline} icon={Microscope} accent="amber" isDark={isDark} />
                </ScrollReveal>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ScrollReveal animationStyle="zoom-in" delay={100} className="lg:col-span-2">
                  <div className={`relative overflow-hidden rounded-[2rem] border p-6 h-full transition-all duration-500 ${
                    isDark
                      ? "bg-black/40 backdrop-blur-md border-white/[0.05] hover:border-white/[0.1] hover:bg-black/60"
                      : "bg-white border-slate-200 hover:border-violet-200 shadow-sm"
                  }`}>
                    <div className="flex items-center gap-2 mb-3 pl-1">
                      <Info className={`w-3.5 h-3.5 ${isDark ? "text-violet-400" : "text-violet-600"}`} />
                      <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Final Remarks</h4>
                    </div>
                    <textarea
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      placeholder="Type additional clinical observations..."
                      className={`w-full rounded-2xl p-4 text-[13px] leading-relaxed outline-none transition-all min-h-[90px] shadow-inner custom-scrollbar cursor-text h-[calc(100%-30px)] ${
                        isDark
                          ? "bg-black/40 border border-white/[0.08] text-slate-300 focus:border-violet-500/50 placeholder:text-slate-700"
                          : "bg-slate-50 border border-slate-200 text-slate-700 focus:border-violet-400 placeholder:text-slate-400"
                      }`}
                    />
                  </div>
                </ScrollReveal>

                <ScrollReveal animationStyle="slide-right" delay={250}>
                  <div className="flex flex-col justify-end h-full">
                    <button
                      onClick={handleDownload}
                      className={`cursor-pointer group flex flex-col items-center justify-center gap-2 h-full min-h-[100px] rounded-[2rem] text-white p-4 transition-all border shadow-lg w-full ${
                        isDark
                          ? "bg-gradient-to-br from-violet-600/20 to-sky-600/20 hover:from-violet-600/40 hover:to-sky-600/40 border-white/10 hover:border-violet-400/50"
                          : "bg-gradient-to-br from-violet-600 to-sky-500 hover:from-violet-700 hover:to-sky-600 border-transparent"
                      }`}
                    >
                      <div className="p-2.5 bg-white/10 rounded-full group-hover:-translate-y-1 transition-transform shadow-md pointer-events-none">
                        <Download className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-center pointer-events-none">
                        Export Report
                      </span>
                    </button>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex h-full items-center justify-center animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-5">
              <div className="relative w-14 h-14">
                <div className={`absolute inset-0 border-[3px] rounded-full ${isDark ? "border-white/5" : "border-slate-200"}`} />
                <div className={`absolute inset-0 border-[3px] border-t-violet-500 rounded-full animate-spin`} />
              </div>
              <p className={`text-[10px] font-black tracking-[0.5em] uppercase animate-pulse ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Computing Data
              </p>
            </div>
          </div>
        )}

        {!summary && !loading && (
          <div className="flex h-full items-center justify-center animate-in fade-in duration-700">
            <div className="flex flex-col items-center gap-5">
              <div className="relative flex items-center justify-center">
                <div className={`absolute h-20 w-20 rounded-full animate-ping ${isDark ? "bg-violet-500/10" : "bg-violet-200/50"}`} />
                <div className={`relative p-6 rounded-full border shadow-2xl ${isDark ? "bg-white/[0.02] border-white/[0.05]" : "bg-violet-50 border-violet-200"}`}>
                  <Stethoscope className={`w-8 h-8 ${isDark ? "text-slate-700" : "text-violet-300"}`} />
                </div>
              </div>
              <p className={`text-[10px] font-black tracking-[0.4em] uppercase ${isDark ? "text-slate-700" : "text-slate-400"}`}>
                Awaiting Upload
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function SummaryPage() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-violet-500/30 transition-colors duration-500 ${isDark ? "bg-[#020205] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      <style>{getCustomGlobalStyles(isDark)}</style>

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute top-[-20%] left-[-10%] h-[60%] w-[50%] rounded-full blur-[150px] ${isDark ? "bg-violet-900/10" : "bg-violet-200/30"}`} />
        <div className={`absolute bottom-[-20%] right-[-10%] h-[60%] w-[50%] rounded-full blur-[150px] ${isDark ? "bg-sky-900/10" : "bg-sky-200/30"}`} />
      </div>
      <main className="relative z-10 flex-1 px-4 py-4 lg:px-8 lg:py-8 overflow-hidden h-screen">
        <SummaryContent />
      </main>
    </div>
  );
}