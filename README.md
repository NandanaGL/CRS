# Clinical Review System (CRS)

> An intelligent medical document analysis platform that extracts, structures, and explains clinical information from scanned and digital reports using OCR, NLP, and local LLM inference.

---

## Overview

The Clinical Review System (CRS) is a full-stack application designed to assist patients in making sense of unstructured medical documents. It ingests scanned or digital reports (PDFs and images), extracts raw text via OCR, runs it through an NLP pipeline powered by a local large language model, and presents the results in a clean, structured interface — complete with a risk assessment and an AI-powered chatbot for follow-up questions.

---

## Features

- **Multi-format document ingestion** — Upload PDFs or images; the system handles both digital and scanned sources.
- **OCR-powered text extraction** — Uses Tesseract to extract text from scanned documents and PyMuPDF for digital PDFs.
- **Structured clinical summarization** — Automatically organizes extracted content into four key clinical sections: Presenting Complaint, History, Medications & Allergies, and Investigations Timeline.
- **Numeric risk detection** — Parses vitals (blood pressure, heart rate, etc.) and flags abnormal findings as Stable, Moderate Risk, or High Risk.
- **AI chatbot** — A streaming patient-facing assistant powered by a local Ollama LLM (Llama 3) that answers medical questions with precision and brevity.
- **Dark / Light theme** — Full theme support with a polished HUD-style UI built in React.
- **Privacy-first** — All LLM inference runs locally via Ollama — no patient data leaves the machine.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI |
| OCR | pytesseract (Tesseract-OCR) |
| PDF Processing | PyMuPDF (`fitz`) |
| Data Handling | pandas, PIL |
| NLP / Text Parsing | Regular Expressions, Ollama (Llama 3) |
| Frontend | React (Vite), Tailwind CSS |
| LLM Runtime | Ollama (local inference) |

---

## How It Works

```
┌──────────────────────────────────────────────────────────┐
│                    User Uploads Report                    │
│                 (PDF or scanned image)                    │
└──────────────────────┬───────────────────────────────────┘
                       │
           ┌───────────▼───────────┐
           │   Document Ingestion  │
           │  PyMuPDF + Tesseract  │
           └───────────┬───────────┘
                       │  Raw extracted text
           ┌───────────▼───────────┐
           │     NLP Pipeline      │
           │  Regex + Ollama LLM   │
           └───────────┬───────────┘
                       │  Structured JSON
          ┌────────────▼────────────┐
          │    Risk Assessment      │
          │  Vitals parsing + flags │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │   React Frontend UI     │
          │  Summary + Chatbot      │
          └─────────────────────────┘
```

1. **Ingestion** — Uploaded files are processed page-by-page. PyMuPDF renders PDF pages as images; Tesseract then extracts text from those images.
2. **Summarization** — The combined text is sent to a locally running Llama 3 model via Ollama, which returns a structured JSON summary across four clinical sections.
3. **Risk Detection** — A regex-based engine scans the raw text for numerical vitals (blood pressure, heart rate, etc.) and classifies overall risk level.
4. **Chatbot** — A streaming `/patient-chat` endpoint passes user questions to the LLM with a strict clinical system prompt, returning concise, accurate answers token-by-token.

---

## Installation

### Prerequisites

- Python 3.10+
- Node.js 18+
- [Tesseract-OCR](https://github.com/tesseract-ocr/tesseract) installed on your system
- [Ollama](https://ollama.com/) installed and running locally with the `llama3.2:1b` model pulled

```bash
ollama pull llama3.2:1b
```

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/your-username/CRS.git
cd CRS/backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

> **Windows users:** Update the Tesseract path in `main.py` to match your installation:
> ```python
> pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
> ```

```bash
# Start the FastAPI server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## Usage

1. **Upload a report** — Drag and drop or select a PDF or image file on the home screen.
2. **View the summary** — The system extracts and structures the document into the four clinical sections. A risk badge (Stable / Moderate / High Risk) is shown alongside any abnormal findings.
3. **Ask the chatbot** — Navigate to the chatbot tab to ask specific questions about the report or general medical terminology. Responses stream in real time.
4. **Toggle theme** — Use the theme toggle in the top-right corner to switch between dark and light mode.

---

## Project Structure

```
CRS/
├── backend/
│   ├── main.py                  # FastAPI app, OCR pipeline, risk detection
│   ├── requirements.txt
│   └── app/
│       ├── nlp_engine.py        # LLM-based structured extraction (Ollama)
│       └── models.py            # Pydantic data models
└── frontend/
    └── src/
        ├── pages/
        │   ├── home.jsx          # Upload interface
        │   ├── summarypage.jsx   # Structured report view
        │   └── patientchatbot.jsx # Streaming AI chatbot
        ├── components/
        │   └── ThemeToggle.jsx
        └── context/
            └── ThemeContext.jsx
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/upload` | Upload one or more medical documents for processing |
| `POST` | `/patient-chat` | Send a message to the clinical chatbot (streams response) |

---

## Future Improvements

- **Named Entity Recognition (NER)** — Integrate a dedicated medical NER model (e.g., BioBERT, Med7) for higher-precision entity extraction.
- **Multi-language OCR** — Support reports in languages other than English via Tesseract's language packs.
- **Report history & persistence** — Store past reports and extracted summaries using a database (PostgreSQL or SQLite).
- **PDF annotation export** — Allow users to download an annotated version of the original report with highlights.
- **Authentication** — Add user accounts and role-based access for patients vs. clinicians.
- **Larger LLM support** — Allow configuration of more capable models (e.g., `llama3:8b`, `medllama2`) for improved summarization accuracy.
- **Mobile responsiveness** — Further optimize the UI for small-screen clinical environments.

---

## Disclaimer

CRS is a research and educational tool. It is **not** a certified medical device and should not be used as a substitute for professional clinical judgment. Always consult a qualified healthcare provider for medical decisions.

---
## 👥 Contributors

- **Muhammed Azar N K**
- **Nandana G L**
- **Sooraj Subhash**
- **Vaishak Naveen**


---

## ✍️ Author

- **Nandana G L**
