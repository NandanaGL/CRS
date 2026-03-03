import json
import ollama
from .models import StructuredSummary

def summarize_structured(text: str) -> StructuredSummary:
    """
    Uses a local LLM (Ollama) to intelligently extract structured clinical data 
    from unstructured text, replacing heuristic keyword matching.
    """
    if not text or not text.strip():
        return StructuredSummary(
            presenting_complaint="No content found.",
            history="",
            meds_allergies="",
            investigations_timeline="",
        )

    # 1. Construct a specific prompt for the LLM
    # We ask for JSON specifically to map directly to your Pydantic model
    prompt = f"""
    You are an expert clinical data extractor. 
    Analyze the following medical notes and extract a structured summary.
    
    Return the output strictly as a JSON object with the following keys:
    - "presenting_complaint": The main reason for the visit.
    - "history": Past medical/surgical history (PMH).
    - "meds_allergies": Current medications, dosages, and allergies.
    - "investigations_timeline": Key tests, dates, and results (labs, imaging).

    If a section is not found in the text, return "Not mentioned".
    Do not add markdown formatting. Just the raw JSON string.

    Medical Notes:
    {text}
    """

    try:
        # 2. Call the Ollama Model (e.g., 'llama3' or 'medllama2')
        response = ollama.chat(model='llama3', messages=[
            {
                'role': 'user',
                'content': prompt,
            },
        ])

        # 3. Parse the JSON response
        # The model content might wrap json in ```json ... ``` so we clean it
        content = response['message']['content']
        clean_json = content.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_json)

        # 4. Map to your existing Data Model
        return StructuredSummary(
            presenting_complaint=data.get("presenting_complaint", "Extraction failed"),
            history=data.get("history", "Extraction failed"),
            meds_allergies=data.get("meds_allergies", "Extraction failed"),
            investigations_timeline=data.get("investigations_timeline", "Extraction failed"),
        )

    except json.JSONDecodeError:
        # Fallback if the model outputs bad JSON
        return StructuredSummary(
            presenting_complaint="Error parsing AI response.",
            history="Raw Output: " + content[:100] + "...",
            meds_allergies="",
            investigations_timeline=""
        )
    except Exception as e:
        # Fallback for connection errors (e.g., Ollama not running)
        print(f"Ollama Error: {e}")
        return StructuredSummary(
            presenting_complaint="AI Service Unavailable",
            history="Ensure Ollama is running.",
            meds_allergies="",
            investigations_timeline=""
        )