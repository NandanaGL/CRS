import { useState, useRef } from "react";
import jsPDF from "jspdf";


/* ---------- SECTION COMPONENT ---------- */
function Section({ title, text, accent = "violet" }) {
  if (!text) return null;

  const accentMap = {
    violet: "from-violet-500/40 to-fuchsia-500/30",
    blue: "from-sky-500/40 to-cyan-500/30",
    emerald: "from-emerald-500/40 to-teal-500/30",
    amber: "from-amber-400/40 to-orange-500/30",
  };

  /* 🔥 KEYWORDS */
  const riskKeywords = [
    "fever",
    "severe",
    "uncontrolled",
    "chest pain",
    "shortness of breath",
    "bp",
    "hypertension",
    "tachycardia",
    "stroke",
    "bleeding",
    "emergency",
    "critical",
    "elevated",
    "abnormal",
    "worsening",
    "infection",
    "inflammation",
  ];

  const highlightText = (content) => {
    if (!content) return "";

    let highlighted = content;

    /* ---------- KEYWORD HIGHLIGHT ---------- */
    riskKeywords.forEach((word) => {
      const regex = new RegExp(`\\b(${word})\\b`, "gi");
      highlighted = highlighted.replace(
        regex,
        `<span style="color:#f87171;font-weight:600;">$1</span>`
      );
    });

    /* ---------- BP (e.g. 180/110) ---------- */
    highlighted = highlighted.replace(
      /(\d{2,3})\s*\/\s*(\d{2,3})/g,
      (match, sys, dia) => {
        sys = parseInt(sys);
        dia = parseInt(dia);

        if (sys >= 180 || dia >= 110)
          return `<span style="color:#ef4444;font-weight:700;">${match}</span>`;
        if (sys >= 140 || dia >= 90)
          return `<span style="color:#facc15;font-weight:600;">${match}</span>`;

        return match;
      }
    );

    /* ---------- Glucose ---------- */
    highlighted = highlighted.replace(
      /glucose[^\d]*(\d+)/gi,
      (match, value) => {
        value = parseInt(value);

        if (value >= 250)
          return `<span style="color:#ef4444;font-weight:700;">${match}</span>`;
        if (value >= 180)
          return `<span style="color:#facc15;font-weight:600;">${match}</span>`;

        return match;
      }
    );

    /* ---------- CRP ---------- */
    highlighted = highlighted.replace(
      /CRP\s*(\d+)/gi,
      (match, value) => {
        value = parseInt(value);
        if (value > 10)
          return `<span style="color:#ef4444;font-weight:700;">${match}</span>`;
        return match;
      }
    );

    /* ---------- Creatinine ---------- */
    highlighted = highlighted.replace(
      /Creatinine\s*(\d+\.?\d*)/gi,
      (match, value) => {
        value = parseFloat(value);

        if (value > 2)
          return `<span style="color:#ef4444;font-weight:700;">${match}</span>`;
        if (value > 1.5)
          return `<span style="color:#facc15;font-weight:600;">${match}</span>`;

        return match;
      }
    );

    /* ---------- Hemoglobin ---------- */
    highlighted = highlighted.replace(
      /Hb\s*(\d+\.?\d*)/gi,
      (match, value) => {
        value = parseFloat(value);

        if (value < 8)
          return `<span style="color:#ef4444;font-weight:700;">${match}</span>`;
        if (value < 11)
          return `<span style="color:#facc15;font-weight:600;">${match}</span>`;

        return match;
      }
    );

    return highlighted;
  };

  return (
    <div className="relative rounded-2xl bg-slate-900/80 px-5 py-5 text-slate-100 border border-slate-800/80">
      <div
        className={`absolute inset-y-2 left-0 w-1 rounded-full bg-gradient-to-b ${
          accentMap[accent] || accentMap.violet
        }`}
      />
      <div className="pl-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </div>
        <p
          className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200"
          dangerouslySetInnerHTML={{
            __html: highlightText(text),
          }}
        />
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
  const [error, setError] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");

  const fileInputRef = useRef(null);

  /* ---------- FILE HANDLING ---------- */
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setFiles([]);
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!files.length) {
      setError("Please choose one or more files first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSummary(null);
      setRiskLevel(null);
      setDoctorNotes("");

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const res = await fetch("http://127.0.0.1:8000/summarize-multi", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Backend error: " + res.status);
      }

      const data = await res.json();
      console.log("FULL BACKEND RESPONSE:", data);

      setSummary(data.summary);
      setRiskLevel(data.risk_level);
    } catch (err) {
      console.error(err);
      setError("Failed to generate summary. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- PDF DOWNLOAD ---------- */
  const handleDownload = () => {
    if (!summary) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = 20;

    const riskKeywords = [
      "fever", "severe", "uncontrolled", "chest pain", "shortness of breath",
      "bp", "hypertension", "tachycardia", "stroke", "bleeding", "emergency",
      "critical", "elevated", "abnormal", "worsening", "infection", "inflammation"
    ];

    // Title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text("PATIENT SUMMARY REPORT", margin, yPosition);
    yPosition += 10;

    // Risk Level
    if (riskLevel) {
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      if (riskLevel === "High Risk") {
        doc.setTextColor(239, 68, 68);
      } else if (riskLevel === "Moderate Risk") {
        doc.setTextColor(250, 204, 21);
      } else {
        doc.setTextColor(52, 211, 153);
      }
      doc.text(`Risk Level: ${riskLevel}`, margin, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 8;
    }

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text("_".repeat(85), margin, yPosition);
    yPosition += 8;

    const addSection = (title, content) => {
      if (!content) return;

      if (yPosition > 260) {
        doc.addPage();
        yPosition = 20;
      }

      // Section title
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(title.toUpperCase(), margin, yPosition);
      yPosition += 6;

      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');

      // Process content with highlighting
      const lines = doc.splitTextToSize(content, maxWidth);
      
      lines.forEach((line) => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }

        let xPosition = margin;
        const words = line.split(/(\s+)/);

        words.forEach((word) => {
          const cleanWord = word.toLowerCase().replace(/[.,;:!?]/g, '');
          let isHighlighted = false;

          // Check for risk keywords
          if (riskKeywords.some(kw => cleanWord.includes(kw))) {
            doc.setTextColor(248, 113, 113);
            doc.setFont(undefined, 'bold');
            isHighlighted = true;
          }

          // Check for BP pattern
          const bpMatch = word.match(/(\d{2,3})\/(\d{2,3})/);
          if (bpMatch) {
            const sys = parseInt(bpMatch[1]);
            const dia = parseInt(bpMatch[2]);
            if (sys >= 180 || dia >= 110) {
              doc.setTextColor(239, 68, 68);
              doc.setFont(undefined, 'bold');
              isHighlighted = true;
            } else if (sys >= 140 || dia >= 90) {
              doc.setTextColor(250, 204, 21);
              doc.setFont(undefined, 'bold');
              isHighlighted = true;
            }
          }

          // Check for glucose
          if (/glucose/i.test(word)) {
            const glucoseMatch = line.match(/glucose[^\d]*(\d+)/i);
            if (glucoseMatch) {
              const value = parseInt(glucoseMatch[1]);
              if (value >= 250) {
                doc.setTextColor(239, 68, 68);
                doc.setFont(undefined, 'bold');
                isHighlighted = true;
              } else if (value >= 180) {
                doc.setTextColor(250, 204, 21);
                doc.setFont(undefined, 'bold');
                isHighlighted = true;
              }
            }
          }

          // Check for CRP
          if (/crp/i.test(cleanWord)) {
            const crpMatch = line.match(/CRP\s*(\d+)/i);
            if (crpMatch && parseInt(crpMatch[1]) > 10) {
              doc.setTextColor(239, 68, 68);
              doc.setFont(undefined, 'bold');
              isHighlighted = true;
            }
          }

          // Check for Creatinine
          if (/creatinine/i.test(cleanWord)) {
            const creatMatch = line.match(/Creatinine\s*(\d+\.?\d*)/i);
            if (creatMatch) {
              const value = parseFloat(creatMatch[1]);
              if (value > 2) {
                doc.setTextColor(239, 68, 68);
                doc.setFont(undefined, 'bold');
                isHighlighted = true;
              } else if (value > 1.5) {
                doc.setTextColor(250, 204, 21);
                doc.setFont(undefined, 'bold');
                isHighlighted = true;
              }
            }
          }

          // Check for Hemoglobin
          if (/\bhb\b/i.test(cleanWord)) {
            const hbMatch = line.match(/Hb\s*(\d+\.?\d*)/i);
            if (hbMatch) {
              const value = parseFloat(hbMatch[1]);
              if (value < 8) {
                doc.setTextColor(239, 68, 68);
                doc.setFont(undefined, 'bold');
                isHighlighted = true;
              } else if (value < 11) {
                doc.setTextColor(250, 204, 21);
                doc.setFont(undefined, 'bold');
                isHighlighted = true;
              }
            }
          }

          const wordWidth = doc.getTextWidth(word);
          if (xPosition + wordWidth > pageWidth - margin) {
            yPosition += 5;
            xPosition = margin;
          }

          doc.text(word, xPosition, yPosition);
          xPosition += wordWidth;

          if (isHighlighted) {
            doc.setTextColor(0, 0, 0);
            doc.setFont(undefined, 'normal');
          }
        });

        yPosition += 5;
      });

      yPosition += 3;
      doc.setTextColor(0, 0, 0);
      doc.text("_".repeat(85), margin, yPosition);
      yPosition += 7;
    };

    addSection("PRESENTING COMPLAINT", summary.presenting_complaint);
    addSection("HISTORY", summary.history);
    addSection("MEDICATIONS & ALLERGIES", summary.meds_allergies);
    addSection("INVESTIGATIONS", summary.investigations_timeline);

    if (doctorNotes) {
      addSection("DOCTOR'S NOTES", doctorNotes);
    }

    doc.save("patient-summary.pdf");
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 lg:flex-row h-[calc(100vh-140px)]">

      {/* ---------- LEFT COLUMN ---------- */}
      <section className="flex w-full flex-col gap-4 lg:w-[35%] h-full">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow">
          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-violet-300">
            PATIENT REVIEW
          </p>
          <h1 className="text-3xl font-semibold text-white">
            Upload History
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Get a structured clinical summary from raw notes.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/5 p-5 flex-1 flex flex-col"
        >
          <label className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Select Files (TXT, PDF)
          </label>

          {/* Upload Box */}
          <div
            className={`relative flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-500/60 bg-slate-900/40 px-6 py-6 text-center text-sm text-slate-300 ${
              loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            onClick={() => !loading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="mb-2 rounded-full bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-100 border border-violet-500/20">
              {loading ? "Analyzing..." : "Click to browse files"}
            </div>

            {files.length === 0 ? (
              <p className="text-xs text-slate-500">
                Supports multiple .txt or .pdf files
              </p>
            ) : (
              <div className="w-full mt-3 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between items-center">
                  <span>Selected Files ({files.length})</span>
                  <button
                    type="button"
                    onClick={(e) => {
                    e.stopPropagation();
                    clearAllFiles();
                }}
                    className="text-rose-400 hover:underline cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>

                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-slate-800/60 px-2 py-1 rounded"
                  >
                    <span className="truncate">📄 {file.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                      }}
                      className="text-rose-400 hover:text-rose-300 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !files.length}
            className="mt-4 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading && (
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-slate-950 border-r-transparent"></div>
            )}
            {loading ? "Processing..." : "Generate Summary"}
          </button>

          {error && (
            <p className="mt-3 text-center text-xs text-rose-400">
              {error}
            </p>
          )}
        </form>
      </section>

      {/* ---------- RIGHT COLUMN ---------- */}
      <section className="flex-1 rounded-3xl border border-white/10 bg-black/40 p-6 overflow-y-auto">
        {loading && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-violet-500 border-r-transparent"></div>
              <p className="mt-4 text-sm text-slate-400">Processing your files...</p>
            </div>
          </div>
        )}

        {!summary && !loading && (
          <div className="flex h-full items-center justify-center text-slate-500">
            Upload notes to generate summary.
          </div>
        )}

        {summary && !loading && (
          <div className="space-y-4">

            {/* 🔥 RISK BANNER */}
            {riskLevel && (
              <div
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                  riskLevel === "High Risk"
                    ? "bg-red-500/20 text-red-300 border border-red-500/40"
                    : riskLevel === "Moderate Risk"
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                {riskLevel === "High Risk" && "🔴 High Risk Case — Immediate Attention Suggested"}
                {riskLevel === "Moderate Risk" && "🟡 Moderate Risk — Monitor Closely"}
                {riskLevel === "Stable" && "🟢 Stable Condition"}
              </div>
            )}

            <Section title="Presenting Complaint" text={summary.presenting_complaint} accent="violet" />
            <Section title="History" text={summary.history} accent="blue" />
            <Section title="Medications & Allergies" text={summary.meds_allergies} accent="emerald" />
            <Section title="Investigations" text={summary.investigations_timeline} accent="amber" />

            <div className="mt-4">
              <label className="block mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                Doctor's Notes
              </label>
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Add clinical observations or additional remarks..."
                className="w-full rounded-2xl border border-slate-500/60 bg-slate-900/40 px-4 py-3 text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                rows="4"
              />
            </div>

            <button
              onClick={handleDownload}
              className="mt-4 px-4 py-2 rounded-lg bg-sky-500 text-black text-xs font-semibold cursor-pointer"
            >
              Download as PDF
            </button>

          </div>
        )}
      </section>
    </div>
  );
}

/* ---------- PAGE WRAPPER ---------- */
export default function SummaryPage() {
  return (
    <div className="min-h-screen bg-[#050515] text-slate-100 flex flex-col">
      <main className="flex-1 px-6 py-6 overflow-hidden">
        <SummaryContent />
      </main>
    </div>
  );
}