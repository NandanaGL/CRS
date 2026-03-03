# CRS – Clinic Record System UI

Neon React + Tailwind CSS single‑page app with a scrolling landing, doctor summary workspace, and patient chatbot. [conversation_history:0]

## Features

- Full‑screen scroll landing with 3 sections: CRS hero, doctor summary, and chatbot.
- Doctor page to upload `.txt` notes and get a structured patient summary from the backend (`/summarize-multi`).
- Patient chat page with a mobile‑style UI calling `/patient-chat`. [conversation_history:0]

## Tech Stack

- React, React Router
- Tailwind CSS
- Backend API at `http://127.0.0.1:8000` (configurable). [conversation_history:0]

## Run locally

```bash
npm install
npm run dev
# or: yarn / pnpm equivalents
