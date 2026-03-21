import { useState, useRef, useEffect } from "react";
import { Loader2, Sparkles, HeartPulse, Stethoscope, ShieldPlus, Activity } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

/* ---------- CUSTOM GLOBAL STYLES ---------- */
const getCustomGlobalStyles = (isDark) => `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: ${isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.03)"};
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: ${isDark ? "rgba(139,92,246,0.3)" : "rgba(109,40,217,0.2)"};
    border-radius: 10px;
  }
  .custom-scrollbar:hover::-webkit-scrollbar-thumb {
    background: ${isDark ? "rgba(139,92,246,0.6)" : "rgba(109,40,217,0.45)"};
  }
  body {
    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${isDark ? "%23a78bfa" : "%236d28d9"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M2 12h20"></path></svg>') 12 12, crosshair !important;
  }
  button, a, input, select, textarea, .cursor-pointer {
    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2338bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4" fill="%2338bdf8"></circle></svg>') 12 12, pointer !important;
  }
`;

function MessageBubble({ role, content, isDark }) {
  const isUser = role === "patient";
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} text-sm mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
      <div
        className={`max-w-[85%] sm:max-w-[80%] px-5 py-3.5 leading-relaxed shadow-xl transition-all duration-300 ${
          isUser
            ? "bg-gradient-to-br from-violet-500 to-sky-500 text-white rounded-[28px] rounded-br-sm shadow-[0_10px_25px_rgba(139,92,246,0.2)]"
            : isDark
              ? "bg-[#0f0f1c]/80 backdrop-blur-md text-slate-200 border border-white/5 rounded-[28px] rounded-bl-sm shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:border-violet-500/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]"
              : "bg-white text-slate-700 border border-slate-200 rounded-[28px] rounded-bl-sm shadow-sm hover:border-violet-200 hover:shadow-md"
        }`}
      >
        <div
          className="whitespace-pre-wrap text-[14px]"
          dangerouslySetInnerHTML={{ __html: formatChat(content) }}
        />
      </div>
    </div>
  );
}

/* ---------- 3D HOLOGRAPHIC CONCEPT CARD ---------- */
function GradientConceptCard({ onSelectPrompt, isDark }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef(null);

  const prompts = [
    "How do I prepare for a blood test?",
    "What should I bring to my appointment?",
    "When should I seek urgent care?",
  ];

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    setRotateX(((y - centerY) / centerY) * -8);
    setRotateY(((x - centerX) / centerX) * 8);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div className="w-full" style={{ perspective: "1000px" }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: "preserve-3d",
        }}
        className={`relative rounded-[28px] p-[1px] shadow-[0_0_30px_rgba(139,92,246,0.15)] transition-transform duration-200 ease-out will-change-transform ${
          isDark
            ? "bg-gradient-to-br from-violet-500/40 via-fuchsia-500/40 to-sky-500/40"
            : "bg-gradient-to-br from-violet-400/60 via-fuchsia-400/60 to-sky-400/60"
        }`}
      >
        <div
          className={`relative rounded-[27px] px-5 py-6 overflow-hidden backdrop-blur-xl border transition-colors duration-500 ${
            isDark ? "bg-[#05030b]/95 border-white/5" : "bg-white/95 border-violet-100"
          }`}
          style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}
        >
          <div
            className="relative z-10 transition-transform duration-200"
            style={{ transform: "translateZ(30px)" }}
          >
            <div className="flex items-center gap-2 text-sky-500 mb-2">
              <Stethoscope className="w-4 h-4" />
              <span className={`text-xs font-semibold tracking-wider uppercase drop-shadow-md ${isDark ? "text-sky-400" : "text-sky-600"}`}>
                Clinical Suggestions
              </span>
            </div>
            <h2 className={`text-lg font-semibold leading-tight mb-4 drop-shadow-lg ${isDark ? "text-white" : "text-slate-800"}`}>
              Not sure where to start?
            </h2>
            <div className="flex flex-col gap-2">
              {prompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onSelectPrompt(p)}
                  className={`cursor-pointer text-left w-full rounded-2xl border px-4 py-2.5 text-[13px] transition-all duration-300 shadow-md ${
                    isDark
                      ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white hover:border-violet-400/50"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-violet-50 hover:text-violet-800 hover:border-violet-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const formatChat = (text) => {
  if (!text) return "";
  let formatted = text;
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  formatted = formatted.replace(/^\s*\*\s+(.*)$/gm, "<li>$1</li>");
  formatted = formatted.replace(/(<li>.*<\/li>)/gs, "<ul class='list-disc ml-5 space-y-1'>$1</ul>");
  formatted = formatted.replace(/^\s*(\d+)\.\s+(.*)$/gm, "<li>$2</li>");
  formatted = formatted.replace(/(<li>.*<\/li>)/gs, "<ol class='list-decimal ml-5 space-y-1'>$1</ol>");
  return formatted;
};

export default function PatientChatPage() {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "Hi, this is your clinic assistant. Ask general questions about appointments, tests, or follow-up.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = { role: "patient", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setSending(true);
    setMessages((prev) => [...prev, { role: "bot", content: "" }]);

    try {
      const res = await fetch("http://127.0.0.1:8000/patient-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = data.response;
          return updated;
        });
        setSending(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = accumulatedText;
          return updated;
        });
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].content = "Server error. Please try again later.";
        return updated;
      });
    } finally {
      setSending(false);
    }
  };

  const handlePromptClick = (promptText) => {
    setInput(promptText);
  };

  return (
    <div className={`relative w-full min-h-screen flex items-center justify-center py-8 font-sans selection:bg-violet-500/30 transition-colors duration-500 ${
      isDark ? "text-slate-100 bg-[#020205]" : "text-slate-900 bg-slate-50"
    }`}>
      <style>{getCustomGlobalStyles(isDark)}</style>

      {/* Background Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center z-0">
        <div className={`absolute h-[400px] w-[400px] rounded-full blur-[100px] -translate-x-1/3 ${isDark ? "bg-violet-600/10" : "bg-violet-300/20"}`} />
        <div className={`absolute h-[400px] w-[400px] rounded-full blur-[100px] translate-x-1/3 ${isDark ? "bg-sky-600/10" : "bg-sky-300/20"}`} />
        <Activity className={`absolute w-[800px] h-[800px] -rotate-12 translate-x-1/4 translate-y-1/4 ${isDark ? "text-violet-500/5" : "text-violet-200/30"}`} strokeWidth={0.5} />
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-10 lg:gap-20 px-4">
        
        {/* Left Side */}
        <div className="hidden md:flex flex-col justify-center w-full max-w-sm gap-5 lg:gap-6 animate-in fade-in slide-in-from-left-8 duration-700">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl border shadow-[0_0_15px_rgba(139,92,246,0.2)] ${
                isDark ? "bg-gradient-to-br from-violet-500/20 to-sky-500/20 border-violet-400/20" : "bg-gradient-to-br from-violet-100 to-sky-100 border-violet-200"
              }`}>
                <HeartPulse className={`w-5 h-5 ${isDark ? "text-violet-400" : "text-violet-600"}`} />
              </div>
              <h1 className={`text-3xl lg:text-4xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-800"}`}>
                Patient{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-sky-400">Portal</span>
              </h1>
            </div>
            <p className={`leading-relaxed text-[13px] lg:text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Our clinical AI assistant is available 24/7 to help you navigate your healthcare. Ask about preparations, clinic policies, or general wellness advice.
            </p>
          </div>

          <GradientConceptCard onSelectPrompt={handlePromptClick} isDark={isDark} />
        </div>

        {/* Right Side: Chat UI */}
        <div className="w-full max-w-sm shrink-0 mx-auto md:mx-0 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <div className={`relative h-[450px] sm:h-[500px] w-full rounded-[3rem] border flex flex-col overflow-hidden transition-colors duration-500 ${
            isDark
              ? "border-white/[0.05] bg-[#03030b]/80 backdrop-blur-2xl shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"
              : "border-slate-200 bg-white/90 backdrop-blur-xl shadow-md"
          }`}>

            {/* Chat Header */}
            <div className={`px-6 py-5 border-b flex items-center gap-3 backdrop-blur-md z-20 shrink-0 ${
              isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50/80"
            }`}>
              <ShieldPlus className={`w-5 h-5 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] ${isDark ? "text-emerald-400" : "text-emerald-500"}`} />
              <div className="flex flex-col">
                <span className={`text-[15px] font-bold leading-none ${isDark ? "text-slate-100" : "text-slate-800"}`}>Clinic AI</span>
                <span className={`text-[10px] font-black tracking-widest uppercase mt-1 ${isDark ? "text-emerald-400/80" : "text-emerald-600"}`}>
                  Secure & Active
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-6 pb-24 text-sm scroll-smooth cursor-text">
              <div className="space-y-2">
                {messages.map((m, i) => (
                  <MessageBubble key={i} role={m.role} content={m.content} isDark={isDark} />
                ))}
                {sending && messages[messages.length - 1].content === "" && (
                  <div className="flex w-full justify-start text-sm mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={`rounded-[28px] rounded-bl-sm px-5 py-3.5 border backdrop-blur-md shadow-lg flex items-center gap-2 ${
                      isDark ? "bg-[#0f0f1c]/80 text-slate-300 border-white/5" : "bg-white text-slate-600 border-slate-200"
                    }`}>
                      <Loader2 className={`w-4 h-4 animate-spin ${isDark ? "text-violet-400" : "text-violet-600"}`} />
                      <span className="text-[13px]">Analyzing...</span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} className="h-2" />
              </div>
            </div>

            {/* Input Bar */}
            <div className={`absolute bottom-0 left-0 w-full p-5 z-20 shrink-0 ${
              isDark ? "bg-gradient-to-t from-[#030108] via-[#030108]/90 to-transparent" : "bg-gradient-to-t from-white via-white/95 to-transparent"
            }`}>
              <form
                onSubmit={sendMessage}
                className={`flex items-center gap-2 border p-1.5 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.1)] backdrop-blur-xl ${
                  isDark
                    ? "bg-[#0a0614]/90 border-white/10"
                    : "bg-white border-slate-200"
                }`}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a medical question..."
                  disabled={sending}
                  className={`flex-1 bg-transparent px-4 py-3 text-[13.5px] outline-none cursor-text ${
                    isDark ? "text-slate-100 placeholder:text-slate-500" : "text-slate-800 placeholder:text-slate-400"
                  }`}
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="rounded-full bg-gradient-to-r from-violet-500 to-sky-400 p-3 text-white disabled:opacity-40 transition-transform active:scale-95 flex items-center justify-center shadow-md cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}