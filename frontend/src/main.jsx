// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/home.jsx";            // 3-section scroll page
import SummaryPage from "./pages/summarypage.jsx";
import PatientChatPage from "./pages/patientchatbot.jsx";
import "./index.css";

// src/main.jsx (only Shell changes)
function Shell() {
  return (
    <BrowserRouter>
      {/* glassy centered nav over hero */}
      <div className="fixed top-4 left-0 right-0 z-30 flex justify-center">
        <nav className="pointer-events-auto flex items-center gap-4 rounded-full border border-white/15 bg-black/40 px-5 py-2 text-[11px] text-slate-200 shadow-[0_0_25px_rgba(148,163,253,0.6)] backdrop-blur-md">
          <Link
            to="/"
            className="rounded-full px-3 py-1 hover:bg-white/10 hover:text-violet-200 transition"
          >
            CRS landing
          </Link>
          <span className="h-3 w-px bg-slate-600/60" />
          <Link
            to="/summary"
            className="rounded-full px-3 py-1 hover:bg-white/10 hover:text-violet-200 transition"
          >
            Doctor summary
          </Link>
          <Link
            to="/patient-chat"
            className="rounded-full px-3 py-1 hover:bg-white/10 hover:text-violet-200 transition"
          >
            Patient chatbot
          </Link>
        </nav>
      </div>

      {/* routes below, full-screen pages handle their own backgrounds */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/patient-chat" element={<PatientChatPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Shell />
  </React.StrictMode>
);
