// src/pages/patientchatbot.jsx
import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";

function MessageBubble({ role, content }) {
  const isUser = role === "patient";
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} text-sm`}>
      <div
        className={`max-w-[80%] rounded-3xl px-4 py-2.5 leading-relaxed shadow-sm ${
          isUser
            ? "bg-gradient-to-r from-violet-500 to-sky-400 text-white rounded-br-md"
            : "bg-slate-900/80 text-slate-100 border border-slate-800 rounded-bl-md"
        }`}
      >
        <div
          className="whitespace-pre-wrap text-sm leading-relaxed"
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
    <div className="h-full flex items-center justify-center">
      <div className="relative w-full max-w-xs">
        <div className="rounded-[32px] bg-gradient-to-br from-[#ff55ff] via-[#7b5cff] to-[#3b82f6] p-[1px] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <div className="relative rounded-[28px] bg-[#050015]/90 px-5 py-6 overflow-hidden backdrop-blur-xl border border-white/10">
            <div className="relative">
              <h2 className="mt-3 text-lg font-semibold leading-tight text-white">
                Ask about your visit.
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {prompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onSelectPrompt(p)}
                    className="text-[10px] rounded-full bg-white/5 border border-white/15 px-3 py-1 text-slate-50 hover:bg-white/10 transition"
                  >
                    {p}
                  </button>
                ))}
              </div>
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

  // 🔥 Convert **bold**
  formatted = formatted.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );

  // 🔹 Convert bullet points
  formatted = formatted.replace(
    /^\s*\*\s+(.*)$/gm,
    "<li>$1</li>"
  );

  formatted = formatted.replace(
    /(<li>.*<\/li>)/gs,
    "<ul class='list-disc ml-5 space-y-1'>$1</ul>"
  );

  // 🔹 Convert numbered list
  formatted = formatted.replace(
    /^\s*(\d+)\.\s+(.*)$/gm,
    "<li>$2</li>"
  );

  formatted = formatted.replace(
    /(<li>.*<\/li>)/gs,
    "<ol class='list-decimal ml-5 space-y-1'>$1</ol>"
  );

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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const sendMessage = async (e) => {
    e.preventDefault();
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
      const botReply =
        data.response ||
        "Sorry, something went wrong. Please try again.";

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

  return (
    <div className="min-h-screen bg-[#050515] text-slate-100 flex items-center justify-center px-4 py-6">
      <div className="relative z-10 w-full max-w-sm">
        <div className="relative rounded-[2.5rem] border border-white/10 bg-[#05030b]/95 overflow-hidden">
          <div className="flex flex-col h-[480px]">
            <div className="flex-1 overflow-auto px-4 pt-3 pb-2 text-sm">
              <div className="space-y-3">
                {messages.map((m, i) => (
                  <MessageBubble key={i} role={m.role} content={m.content} />
                ))}

                {sending && (
                  <div className="flex w-full justify-start text-sm">
                    <div className="rounded-3xl px-4 py-2.5 bg-slate-900/80 text-slate-400 border border-slate-800 rounded-bl-md flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin text-violet-400" />
                      <span className="text-xs">Thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </div>

            <form
              onSubmit={sendMessage}
              className="border-t border-slate-800 bg-black/80 px-3 py-3"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your visit..."
                  disabled={sending}
                  className="flex-1 rounded-full bg-slate-900/80 px-3 py-2 text-[13px] text-slate-100 outline-none border border-slate-700 focus:border-violet-400"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="rounded-full bg-gradient-to-r from-violet-500 to-sky-400 px-3 py-2 text-[11px] font-semibold text-slate-950 disabled:opacity-40"
                >
                  {sending ? "..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}