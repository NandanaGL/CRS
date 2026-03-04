// src/pages/patientchatbot.jsx
import { useState, useRef, useEffect } from "react";
import { Loader2, Sparkles, HeartPulse, Stethoscope, ShieldPlus, Activity } from "lucide-react";

function MessageBubble({ role, content }) {
  const isUser = role === "patient";
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} text-sm mb-4`}>
      <div
        className={`max-w-[85%] sm:max-w-[80%] px-5 py-3.5 leading-relaxed shadow-xl transition-all duration-300 ${
          isUser
            ? "bg-gradient-to-br from-violet-500 to-sky-500 text-white rounded-[28px] rounded-br-sm shadow-[0_10px_25px_rgba(139,92,246,0.2)]"
            : "bg-white/10 backdrop-blur-md text-slate-100 border border-white/10 rounded-[28px] rounded-bl-sm shadow-[0_10px_25px_rgba(0,0,0,0.3)]"
        }`}
      >
        <div
          className="whitespace-pre-wrap text-[14px]"
          dangerouslySetInnerHTML={{
            __html: formatChat(content),
          }}
        />
      </div>
    </div>
  );
}

function GradientConceptCard({ onSelectPrompt }) {
  const prompts = [
    "How do I prepare for a blood test?",
    "What should I bring to my appointment?",
    "When should I seek urgent care?",
  ];

  return (
    <div className="w-full">
      <div className="relative rounded-[28px] bg-gradient-to-br from-violet-500/40 via-fuchsia-500/40 to-sky-500/40 p-[1px] shadow-[0_0_30px_rgba(139,92,246,0.1)]">
        <div className="relative rounded-[27px] bg-[#05030b]/95 px-5 py-6 overflow-hidden backdrop-blur-xl border border-white/5">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-sky-400 mb-2">
              <Stethoscope className="w-4 h-4" />
              <span className="text-xs font-semibold tracking-wider uppercase">Clinical Suggestions</span>
            </div>
            <h2 className="text-lg font-semibold leading-tight text-white mb-4">
              Not sure where to start?
            </h2>
            <div className="flex flex-col gap-2">
              {prompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onSelectPrompt(p)}
                  className="text-left w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-2.5 text-[13px] text-slate-300 hover:bg-white/10 hover:text-white hover:border-violet-400/50 transition-all duration-300 shadow-md"
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
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "Hi, this is your clinic assistant. Ask general questions about appointments, tests, or follow-up.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (messages.length > 1 || sending) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, sending]);

  const sendMessage = async (e) => {
    e?.preventDefault(); 
    if (!input.trim() || sending) return;

    const userMessage = { role: "patient", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/patient-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await res.json();
      const botReply = data.response || "Sorry, something went wrong. Please try again.";

      setMessages((prev) => [...prev, { role: "bot", content: botReply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Server error. Please try again later." },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handlePromptClick = (promptText) => {
    setInput(promptText);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center py-8">
      
      {/* Background Glows & Watermarks */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center">
        <div className="absolute h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[100px] -translate-x-1/3" />
        <div className="absolute h-[400px] w-[400px] rounded-full bg-sky-600/10 blur-[100px] translate-x-1/3" />
        <Activity className="absolute text-violet-500/5 w-[800px] h-[800px] -rotate-12 translate-x-1/4 translate-y-1/4" strokeWidth={0.5} />
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-10 lg:gap-20 px-4">
        
        {/* Left Side: Context & Prompts */}
        <div className="hidden md:flex flex-col justify-center w-full max-w-sm gap-5 lg:gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-sky-500/20 border border-violet-400/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <HeartPulse className="w-5 h-5 text-violet-400" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white">
                Patient <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-sky-400">Portal</span>
              </h1>
            </div>

            <p className="text-slate-400 leading-relaxed text-[13px] lg:text-sm">
              Our clinical AI assistant is available 24/7 to help you navigate your healthcare. 
              Ask about preparations, clinic policies, or general wellness advice.
            </p>
          </div>
          
          <GradientConceptCard onSelectPrompt={handlePromptClick} />
        </div>

        {/* Right Side: Chat UI */}
        <div className="w-full max-w-sm shrink-0 mx-auto md:mx-0">
          
          <div className="relative h-[450px] sm:h-[500px] w-full rounded-[2rem] border border-white/5 bg-[#030108]/60 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
            
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-3 backdrop-blur-md z-20">
              <ShieldPlus className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold text-slate-100 leading-none">Clinic AI</span>
                <span className="text-[11px] text-emerald-400/80 font-medium mt-1">Secure & Active</span>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-5 pt-6 pb-24 text-sm scroll-smooth">
              <div className="space-y-2">
                {messages.map((m, i) => (
                  <MessageBubble key={i} role={m.role} content={m.content} />
                ))}

                {sending && (
                  <div className="flex w-full justify-start text-sm mb-4">
                    <div className="rounded-[28px] rounded-bl-sm px-5 py-3.5 bg-white/10 backdrop-blur-md text-slate-300 border border-white/10 shadow-lg flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                      <span className="text-[13px]">Analyzing...</span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} className="h-2" />
              </div>
            </div>

            {/* Floating Input Form */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#030108] via-[#030108]/80 to-transparent z-20">
              <form
                id="chat-form"
                onSubmit={sendMessage}
                className="flex items-center gap-2 bg-[#0a0614]/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a medical question..."
                  disabled={sending}
                  className="flex-1 bg-transparent px-4 py-2 text-[13px] text-slate-100 outline-none placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="rounded-full bg-gradient-to-r from-violet-500 to-sky-400 p-2.5 text-white disabled:opacity-40 transition-transform active:scale-95 flex items-center justify-center shadow-md"
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