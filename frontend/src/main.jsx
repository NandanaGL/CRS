// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home.jsx";
import SummaryPage from "./pages/summarypage.jsx";
import PatientChatPage from "./pages/patientchatbot.jsx";
import "./index.css";

function Shell() {
  return (
    <BrowserRouter>
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
