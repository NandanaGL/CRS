import ollama
import re
import io
import pandas as pd
import fitz  # PyMuPDF for handling PDFs
import pytesseract
from PIL import Image
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import List

# -----------------------------
# TESSERACT CONFIGURATION (WINDOWS)
# -----------------------------
# Ensure this path matches where you installed Tesseract-OCR
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

app = FastAPI()

# -----------------------------
# CORS CONFIGURATION
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# PARSER FUNCTION
# -----------------------------
def parse_clinical_summary(text):
    summary = {
        "presenting_complaint": "Not mentioned",
        "history": "Not mentioned",
        "meds_allergies": "Not mentioned",
        "investigations_timeline": "Not mentioned"
    }

    text = text.replace("**", "").replace("##", "")

    complaint_match = re.search(r'SECTION 1:(.*?)(?=SECTION 2:|$)', text, re.DOTALL | re.IGNORECASE)
    if complaint_match:
        content = complaint_match.group(1).strip()
        summary["presenting_complaint"] = re.sub(r'(?i)presenting complaint', '', content).strip()

    history_match = re.search(r'SECTION 2:(.*?)(?=SECTION 3:|$)', text, re.DOTALL | re.IGNORECASE)
    if history_match:
        content = history_match.group(1).strip()
        summary["history"] = re.sub(r'(?i)history', '', content).strip()

    meds_match = re.search(r'SECTION 3:(.*?)(?=SECTION 4:|$)', text, re.DOTALL | re.IGNORECASE)
    if meds_match:
        content = meds_match.group(1).strip()
        summary["meds_allergies"] = re.sub(r'(?i)medications and allergies', '', content).strip()

    inv_match = re.search(r'SECTION 4:(.*?)(?=$)', text, re.DOTALL | re.IGNORECASE)
    if inv_match:
        content = inv_match.group(1).strip()
        summary["investigations_timeline"] = re.sub(r'(?i)investigations', '', content).strip()

    return summary

# -----------------------------
# RISK DETECTION FUNCTIONS
# -----------------------------
def detect_numeric_risk(text):
    text_lower = text.lower()
    risk_level = "Stable"
    abnormal_findings = []

    # -------- BLOOD PRESSURE --------
    bp_match = re.findall(r'(\d{2,3})\s*/\s*(\d{2,3})', text_lower)
    for systolic, diastolic in bp_match:
        systolic, diastolic = int(systolic), int(diastolic)
        if systolic >= 180 or diastolic >= 110:
            risk_level = "High Risk"
            abnormal_findings.append(f"Severely elevated BP: {systolic}/{diastolic}")
        elif systolic >= 140 or diastolic >= 90:
            if risk_level != "High Risk": risk_level = "Moderate Risk"
            abnormal_findings.append(f"Elevated BP: {systolic}/{diastolic}")

    # -------- HEART RATE --------
    pulse_match = re.findall(r'(pulse|hr|heart rate)[^\d]*(\d{2,3})', text_lower)
    for _, value in pulse_match:
        value = int(value)
        if value >= 120:
            risk_level = "High Risk"
            abnormal_findings.append(f"Tachycardia: {value} bpm")
        elif value >= 100:
            if risk_level != "High Risk": risk_level = "Moderate Risk"
            abnormal_findings.append(f"Elevated heart rate: {value} bpm")

    # -------- CRP --------
    crp_match = re.findall(r'crp[^\d]*(\d+)', text_lower)
    for value in crp_match:
        if int(value) > 10:
            if risk_level != "High Risk": risk_level = "Moderate Risk"
            abnormal_findings.append(f"Elevated CRP: {value}")

    return risk_level, abnormal_findings

# -----------------------------
# SUMMARIZE MULTIPLE FILES ENDPOINT
# -----------------------------
@app.post("/summarize-multi")
async def summarize_multi(files: List[UploadFile] = File(...)):
    texts = []
    filenames = []

    for f in files:
        content = await f.read()
        extracted_text = ""

        # -------- PDF HANDLING (Normal & Scanned) --------
        if f.filename.lower().endswith('.pdf'):
            try:
                # Load PDF from memory bytes
                doc = fitz.open(stream=content, filetype="pdf")
                for page_num in range(len(doc)):
                    page = doc.load_page(page_num)
                    page_text = page.get_text()

                    if page_text.strip():
                        # Standard Digital PDF
                        extracted_text += page_text + "\n"
                    else:
                        # Scanned PDF - Run Tesseract OCR
                        print(f"Scanned page detected ({f.filename}, Page {page_num + 1}). Running OCR...")
                        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for clarity
                        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                        ocr_text = pytesseract.image_to_string(img)
                        extracted_text += ocr_text + "\n"
            except Exception as e:
                extracted_text += f"[Error reading PDF: {str(e)}]\n"

        # -------- CSV HANDLING --------
        elif f.filename.lower().endswith('.csv'):
            try:
                df = pd.read_csv(io.BytesIO(content))
                extracted_text = df.to_string(index=False)
            except Exception as e:
                extracted_text = f"[Error reading CSV: {str(e)}]"

        # -------- TXT / OTHERS HANDLING --------
        else:
            try:
                extracted_text = content.decode("utf-8")
            except:
                extracted_text = content.decode("latin-1", errors="ignore")

        texts.append(f"--- FILE: {f.filename} ---\n{extracted_text}")
        filenames.append(f.filename)

    combined_text = "\n".join(texts)

    prompt = f"""
You are a clinical AI assistant.

Analyze the notes below and return strictly in this format:

SECTION 1: Presenting Complaint
SECTION 2: History
SECTION 3: Medications and Allergies
SECTION 4: Investigations

Keep it concise and structured.

--- START OF FILES ---
{combined_text[:8000]}
"""

    try:
        response = ollama.chat(
            model="llama3.2:1b",
            options={
                "temperature": 0.2,
                "num_predict": 400
            },
            messages=[{"role": "user", "content": prompt}]
        )

        raw_text = response["message"]["content"]
        structured_data = parse_clinical_summary(raw_text)
        numeric_risk_level, abnormal_findings = detect_numeric_risk(combined_text)

        return {
            "summary": structured_data,
            "filenames": filenames,
            "risk_level": numeric_risk_level,
            "abnormal_findings": abnormal_findings
        }

    except Exception as e:
        print("Summary Error:", e)
        return {
            "summary": {
                "presenting_complaint": f"Error: {str(e)}",
                "history": "",
                "meds_allergies": "",
                "investigations_timeline": ""
            },
            "filenames": filenames,
            "risk_level": "Unknown"
        }


# -----------------------------
# PATIENT CHAT ENDPOINT (STREAMING)
# -----------------------------
async def chat_generator(message: str):
    """Generator function to stream Ollama responses word-by-word"""
    try:
        stream = ollama.chat(
            model="llama3.2:1b",
            options={
                "temperature": 0.1,
                "num_predict": 350,
                "num_ctx": 2048  # Optimized context for local execution
            },
            messages=[
                {
                    "role": "system",
                    "content": """
You are a professional clinical assistant chatbot.
STRICT RULES:
- Answer ONLY the specific question the user asked.
- Keep your answer extremely precise and concise (Maximum 2 to 3 short sentences).
- ALWAYS finish your sentences.
- Be clear and structured.
- Do NOT invent diseases or assume a medical condition.
"""
                },
                {"role": "user", "content": message}
            ],
            stream=True,
        )

        for chunk in stream:
            content = chunk['message']['content']
            if content:
                yield content

    except Exception as e:
        yield f"Error: AI service is currently unavailable. {str(e)}"


@app.post("/patient-chat")
async def patient_chat(data: dict):
    message = data.get("message")

    if not message:
        return {"response": "Please send a message."}

    # Handle conversation closing words BEFORE calling the model
    clean_msg = message.lower().strip()
    closing_words = [
        "nothing else", "that's all", "ok", "okay", "ok thankyou", 
        "thank you", "thanks", "bye", "no that's all", "just wanted to know"
    ]

    if any(phrase in clean_msg for phrase in closing_words):
        # Return standard JSON if the user is just closing the chat
        return {"response": "You're welcome. If you have any other health-related questions in the future, feel free to ask."}

    # If it's a real question, return the StreamingResponse
    return StreamingResponse(chat_generator(message), media_type="text/plain")