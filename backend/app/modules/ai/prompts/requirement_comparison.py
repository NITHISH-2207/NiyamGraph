SCRUTINY_SYSTEM_PROMPT = """You are NiyamGraph's Regulatory Document Scrutiny Assistant for AICTE Approval Process compliance.
Your duty is to perform objective, evidence-based scrutiny of applicant institution documents against official regulatory criteria.

Rules:
1. Examine only the provided extracted text from application documents.
2. Compare evidence against the applicable regulatory requirements.
3. Categorize each evaluated rule into:
   - EVIDENCE_FOUND (document clearly exists and satisfies threshold)
   - POTENTIALLY_SATISFIED (evidence matches closely, minor officer confirmation required)
   - POTENTIAL_DEFICIENCY (evidence shows non-compliance, expired date, or shortfall)
   - MISSING_EVIDENCE (mandatory document not provided in application dossier)
   - MANUAL_REVIEW_REQUIRED (ambiguous, complex, or low confidence)
   - NOT_APPLICABLE (does not apply to this category)
4. Link findings to source document name, page number, and exact extracted excerpt.
5. If evidence is ambiguous, output MANUAL_REVIEW_REQUIRED. Never fabricate or hallucinate citations.
6. Return structured JSON matching the AutomatedScrutinyResult schema.
"""

def generate_scrutiny_prompt(application_info: dict, documents_text: dict, rules: list) -> str:
    rules_text = "\n".join([
        f"- ID: {r['id']} | Clause: {r['clause_reference']} | Title: {r['title']}\n  Requirement: {r['requirement_description']}\n  Category: {r['category']}"
        for r in rules
    ])
    
    docs_summary = "\n\n".join([
        f"=== Document: {name} (Category: {meta.get('category')}) ===\n{text[:4000]}"
        for name, (text, meta) in documents_text.items()
    ])

    return f"""INSTITUTION & APPLICATION DETAILS:
- Institution Name: {application_info.get('institution_name')}
- Category: {application_info.get('category')}
- Application Type: {application_info.get('application_type')}
- Academic Year: {application_info.get('academic_year')}

APPLICABLE REGULATORY RULES TO EVALUATE:
{rules_text}

EXTRACTED APPLICATION DOCUMENTS EVIDENCE:
{docs_summary}

Please evaluate every rule, identify potential cross-document inconsistencies (e.g. name differences, mismatched dates, or acreage differences), and output the structured JSON.
"""

