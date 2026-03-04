import ollama
import re
import io
import pandas as pd
from pypdf import PdfReader
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List

app = FastAPI()

# -----------------------------
# CORS CONFIGURATION
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev only
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

    complaint_match = re.search(
        r'SECTION 1:(.*?)(?=SECTION 2:|$)',
        text, re.DOTALL | re.IGNORECASE
    )
    if complaint_match:
        content = complaint_match.group(1).strip()
        content = re.sub(r'(?i)presenting complaint', '', content)
        summary["presenting_complaint"] = content.strip()

    history_match = re.search(
        r'SECTION 2:(.*?)(?=SECTION 3:|$)',
        text, re.DOTALL | re.IGNORECASE
    )
    if history_match:
        content = history_match.group(1).strip()
        content = re.sub(r'(?i)history', '', content)
        summary["history"] = content.strip()

    meds_match = re.search(
        r'SECTION 3:(.*?)(?=SECTION 4:|$)',
        text, re.DOTALL | re.IGNORECASE
    )
    if meds_match:
        content = meds_match.group(1).strip()
        content = re.sub(r'(?i)medications and allergies', '', content)
        summary["meds_allergies"] = content.strip()

    inv_match = re.search(
        r'SECTION 4:(.*?)(?=$)',
        text, re.DOTALL | re.IGNORECASE
    )
    if inv_match:
        content = inv_match.group(1).strip()
        content = re.sub(r'(?i)investigations', '', content)
        summary["investigations_timeline"] = content.strip()

    return summary


# -----------------------------
# RISK DETECTION FUNCTION
# -----------------------------
def detect_risk(structured_data):
    combined_text = " ".join(structured_data.values()).lower()

    high_risk_keywords = [
        "severe", "urgent", "memory decline",
        "weight loss", "abnormal", "elevated",
        "critical", "worsening"
    ]

    moderate_risk_keywords = [
        "fever", "pain", "infection",
        "inflammation", "rash", "swelling"
    ]

    if any(word in combined_text for word in high_risk_keywords):
        return "High Risk"
    elif any(word in combined_text for word in moderate_risk_keywords):
        return "Moderate Risk"
    else:
        return "Stable"

def detect_numeric_risk(text):
    text_lower = text.lower()

    risk_level = "Stable"
    abnormal_findings = []

    # -------- BLOOD PRESSURE --------
    bp_match = re.findall(r'(\d{2,3})\s*/\s*(\d{2,3})', text_lower)
    for systolic, diastolic in bp_match:
        systolic = int(systolic)
        diastolic = int(diastolic)

        if systolic >= 180 or diastolic >= 110:
            risk_level = "High Risk"
            abnormal_findings.append(f"Severely elevated BP: {systolic}/{diastolic}")
        elif systolic >= 140 or diastolic >= 90:
            if risk_level != "High Risk":
                risk_level = "Moderate Risk"
            abnormal_findings.append(f"Elevated BP: {systolic}/{diastolic}")

    # -------- HEART RATE --------
    pulse_match = re.findall(r'(pulse|hr|heart rate)[^\d]*(\d{2,3})', text_lower)
    for _, value in pulse_match:
        value = int(value)
        if value >= 120:
            risk_level = "High Risk"
            abnormal_findings.append(f"Tachycardia: {value} bpm")
        elif value >= 100:
            if risk_level != "High Risk":
                risk_level = "Moderate Risk"
            abnormal_findings.append(f"Elevated heart rate: {value} bpm")

    # -------- CRP --------
    crp_match = re.findall(r'crp[^\d]*(\d+)', text_lower)
    for value in crp_match:
        value = int(value)
        if value > 10:
            if risk_level != "High Risk":
                risk_level = "Moderate Risk"
            abnormal_findings.append(f"Elevated CRP: {value}")

    return risk_level, abnormal_findings
# -----------------------------
# SUMMARIZE MULTIPLE FILES
# -----------------------------
@app.post("/summarize-multi")
async def summarize_multi(files: List[UploadFile] = File(...)):
    texts = []
    filenames = []

    for f in files:
        content = await f.read()
        extracted_text = ""

        # PDF
        if f.filename.lower().endswith('.pdf'):
            try:
                pdf_file = io.BytesIO(content)
                reader = PdfReader(pdf_file)
                for page in reader.pages:
                    extracted_text += page.extract_text() + "\n"
            except Exception as e:
                extracted_text = f"[Error reading PDF: {str(e)}]"

        # CSV
        elif f.filename.lower().endswith('.csv'):
            try:
                csv_file = io.BytesIO(content)
                df = pd.read_csv(csv_file)
                extracted_text = df.to_string(index=False)
            except Exception as e:
                extracted_text = f"[Error reading CSV: {str(e)}]"

        # TXT / Others
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
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        raw_text = response["message"]["content"]
        structured_data = parse_clinical_summary(raw_text)
        numeric_risk_level, abnormal_findings = detect_numeric_risk(combined_text)

        # If numeric risk is higher, override AI risk
        risk_level = numeric_risk_level
        return {
            "summary": structured_data,
            "filenames": filenames,
            "risk_level": risk_level,
            "abnormal_findings": abnormal_findings
        }
        # 🔥 Risk Detection
        risk_level = detect_risk(structured_data)

        return {
            "summary": structured_data,
            "filenames": filenames,
            "risk_level": risk_level
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
# PATIENT CHAT ENDPOINT
# -----------------------------
@app.post("/patient-chat")
async def patient_chat(data: dict):
    message = data.get("message")

    if not message:
        return {"response": "Please send a message."}

    # 🔥 Handle conversation closing BEFORE calling model
    clean_msg = message.lower().strip()

    closing_words = [
        "nothing else",
        "that's all",
        "ok",
        "okay",
        "ok thankyou",
        "thank you",
        "thanks",
        "bye",
        "no that's all",
        "i just wanted to know",
        "just wanted to know"
    ]

    if any(phrase in clean_msg for phrase in closing_words):
        return {
            "response": "You're welcome. If you have any other health-related questions in the future, feel free to ask."
        }

    try:
        response = ollama.chat(
            model="llama3.2:1b",
            options={
                "temperature": 0.1,
                # Increased to 350 so it has plenty of room to finish sentences,
                # but we rely on the prompt below to keep it short.
                "num_predict": 350 
            },
            messages=[
                {
                    "role": "system",
                    "content": """
You are a professional clinical assistant chatbot.

STRICT RULES:
- Answer ONLY the specific question the user asked. Do not add unnecessary extra information.
- Keep your answer extremely precise and concise (Maximum 2 to 3 short sentences).
- ALWAYS complete your thoughts and finish your sentences.
- Be clear and structured.
- Do NOT invent diseases or assume a medical condition unless clearly described.
- If the user only wants general information, do NOT ask about symptoms.
- Ask only ONE follow-up question if absolutely necessary.
"""
                },
                {
                    "role": "user",
                    "content": message
                }
            ]
        )

        return {"response": response["message"]["content"]}

    except Exception as e:
        print("Chat Error:", e)
        return {"response": "AI service is currently unavailable."}