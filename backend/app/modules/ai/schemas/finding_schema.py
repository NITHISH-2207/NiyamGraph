from typing import List, Optional
from pydantic import BaseModel, Field

class RuleScrutinyItem(BaseModel):
    rule_id: str
    rule_clause: str
    rule_title: str
    finding_category: str = Field(
        ...,
        description="EVIDENCE_FOUND, POTENTIALLY_SATISFIED, POTENTIAL_DEFICIENCY, MISSING_EVIDENCE, MANUAL_REVIEW_REQUIRED, or NOT_APPLICABLE"
    )
    confidence: float = Field(0.9, ge=0.0, le=1.0)
    observation: str
    source_document_name: Optional[str] = None
    source_page_number: Optional[str] = None
    extracted_snippet: Optional[str] = None

class ConsistencyObservation(BaseModel):
    issue_type: str
    description: str
    affected_documents: List[str]
    severity: str = "WARNING"  # WARNING, CRITICAL, INFO

class AutomatedScrutinyResult(BaseModel):
    summary: str
    findings: List[RuleScrutinyItem]
    cross_document_observations: List[ConsistencyObservation] = []

