from typing import List, Optional
from pydantic import BaseModel

class DraftDeficiencyItem(BaseModel):
    rule_id: str
    requirement_summary: str
    observed_problem: str
    source_document: Optional[str] = None
    page_reference: Optional[str] = None
    explanation: str
    required_correction: str

class DraftDeficiencyNotice(BaseModel):
    general_remarks: str
    recommended_cure_days: int = 15
    items: List[DraftDeficiencyItem]

