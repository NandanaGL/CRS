from pydantic import BaseModel
from typing import List

class StructuredSummary(BaseModel):
    presenting_complaint: str
    history: str
    meds_allergies: str
    investigations_timeline: str

class SummaryResponseMulti(BaseModel):
    filenames: List[str]
    summary: StructuredSummary
    total_characters: int
