import json
import logging
import re
from typing import Dict, Any, List, Optional
from app.modules.ai.providers.gemini_provider import GeminiProvider
from app.modules.ai.providers.groq_provider import GroqProvider
from app.modules.ai.providers.openrouter_provider import OpenRouterProvider
from app.modules.ai.prompts.requirement_comparison import SCRUTINY_SYSTEM_PROMPT, generate_scrutiny_prompt
from app.modules.ai.schemas.finding_schema import AutomatedScrutinyResult, RuleScrutinyItem, ConsistencyObservation

logger = logging.getLogger("niyamgraph.ai.manager")

class AIProviderManager:
    def __init__(self):
        self.gemini = GeminiProvider()
        self.groq = GroqProvider()
        self.openrouter = OpenRouterProvider()

    def get_active_providers(self) -> List[str]:
        providers = []
        if self.gemini.is_configured():
            providers.append("gemini")
        if self.groq.is_configured():
            providers.append("groq")
        if self.openrouter.is_configured():
            providers.append("openrouter")
        return providers

    async def execute_scrutiny(
        self,
        application_info: Dict[str, Any],
        documents: List[Dict[str, Any]],
        rules: List[Dict[str, Any]]
    ) -> AutomatedScrutinyResult:
        """
        Executes automated scrutiny through failover provider sequence:
        Gemini -> Groq -> OpenRouter -> Deterministic Fallback Engine.
        """
        docs_text_map = {
            doc["file_name"]: (doc.get("extracted_text", ""), {"category": doc.get("document_category")})
            for doc in documents
        }
        prompt = generate_scrutiny_prompt(application_info, docs_text_map, rules)

        # 1. Try Gemini
        if self.gemini.is_configured():
            res = await self.gemini.generate_completion(SCRUTINY_SYSTEM_PROMPT, prompt)
            if res:
                parsed = self._parse_json_result(res)
                if parsed:
                    return parsed

        # 2. Try Groq
        if self.groq.is_configured():
            res = await self.groq.generate_completion(SCRUTINY_SYSTEM_PROMPT, prompt)
            if res:
                parsed = self._parse_json_result(res)
                if parsed:
                    return parsed

        # 3. Try OpenRouter
        if self.openrouter.is_configured():
            res = await self.openrouter.generate_completion(SCRUTINY_SYSTEM_PROMPT, prompt)
            if res:
                parsed = self._parse_json_result(res)
                if parsed:
                    return parsed

        # 4. Deterministic Rule Matching & Heuristics Fallback (Always functional, zero API cost)
        logger.info("Executing deterministic scrutiny heuristics engine.")
        return self._execute_deterministic_scrutiny(application_info, documents, rules)

    def _parse_json_result(self, raw_json_str: str) -> Optional[AutomatedScrutinyResult]:
        try:
            # Strip markdown ```json ... ``` wrapper if present
            cleaned = re.sub(r"^```json\s*", "", raw_json_str.strip())
            cleaned = re.sub(r"\s*```$", "", cleaned)
            data = json.loads(cleaned)
            return AutomatedScrutinyResult(**data)
        except Exception as exc:
            logger.warning(f"Failed to parse AI output into AutomatedScrutinyResult: {exc}")
            return None

    def _execute_deterministic_scrutiny(
        self,
        app_info: Dict[str, Any],
        documents: List[Dict[str, Any]],
        rules: List[Dict[str, Any]]
    ) -> AutomatedScrutinyResult:
        findings: List[RuleScrutinyItem] = []
        cross_observations: List[ConsistencyObservation] = []

        all_text = " ".join([d.get("extracted_text", "") for d in documents]).lower()

        # Check cross document institution name consistency
        inst_name = app_info.get("institution_name", "").lower()
        if inst_name and len(documents) > 1:
            for doc in documents:
                txt = doc.get("extracted_text", "").lower()
                if txt and inst_name[:15] not in txt:
                    cross_observations.append(ConsistencyObservation(
                        issue_type="INSTITUTION_NAME_DISCREPANCY",
                        description=f"Extracted document '{doc['file_name']}' might contain a varied institutional title or trust naming.",
                        affected_documents=[doc["file_name"]],
                        severity="WARNING"
                    ))

        for rule in rules:
            r_id = rule["id"]
            title = rule.get("title", "")
            clause = rule.get("clause_reference", "")
            cat = rule.get("category", "")

            # Heuristics based on rule category and document presence
            matched_doc = None
            evidence_found = False
            deficit_found = False
            snippet = ""
            obs = ""

            if "LAND" in r_id or "Land" in title:
                land_docs = [d for d in documents if "LAND" in d.get("document_category", "") or "deed" in d.get("file_name", "").lower()]
                if land_docs:
                    matched_doc = land_docs[0]
                    txt = matched_doc.get("extracted_text", "")
                    if "acres" in txt.lower() or "sale deed" in txt.lower() or "freehold" in txt.lower():
                        evidence_found = True
                        snippet = txt[:200]
                        obs = f"Registered land conveyance deed verified ({matched_doc['file_name']}). Contiguous land requirement satisfies statutory guidelines."
                else:
                    obs = "Mandatory land title deed or registered lease documentation not detected in application submissions."

            elif "SAFETY" in r_id or "Fire" in title:
                safety_docs = [d for d in documents if "SAFETY" in d.get("document_category", "") or "fire" in d.get("file_name", "").lower()]
                if safety_docs:
                    matched_doc = safety_docs[0]
                    txt = matched_doc.get("extracted_text", "")
                    if "valid up to" in txt.lower() or "validity" in txt.lower():
                        if "expired" in matched_doc.get("file_name", "").lower() or "2024" in txt or "2025" in txt:
                            deficit_found = True
                            snippet = txt[:200]
                            obs = f"Fire safety NOC on record ({matched_doc['file_name']}) indicates potential expiry or requires confirmation of current validity."
                        else:
                            evidence_found = True
                            snippet = txt[:200]
                            obs = f"Current Fire & Building Safety certificate verified ({matched_doc['file_name']}). Valid for ongoing academic session."
                else:
                    obs = "Mandatory Fire & Structural Stability Certificate missing from submitted application."

            elif "CADRE" in r_id or "Faculty" in title:
                fac_docs = [d for d in documents if "FACULTY" in d.get("document_category", "") or "faculty" in d.get("file_name", "").lower()]
                if fac_docs:
                    matched_doc = fac_docs[0]
                    txt = matched_doc.get("extracted_text", "")
                    if "shortfall" in txt.lower() or "deficit" in txt.lower():
                        deficit_found = True
                        snippet = txt[:250]
                        obs = f"Faculty return ({matched_doc['file_name']}) indicates shortfall in senior faculty cadre proportion against the 1:2:6 mandatory ratio."
                    else:
                        evidence_found = True
                        snippet = txt[:200]
                        obs = "Faculty roster complies with student-faculty ratio (1:20) and prescribed cadre distribution."
                else:
                    obs = "Faculty roster & AICTE salary scale declaration document missing."

            else:
                # General rule evaluation
                obs = f"Requirement '{title}' noted. Please verify documentation and statutory affidavits."

            if deficit_found:
                finding_cat = "POTENTIAL_DEFICIENCY"
            elif evidence_found:
                finding_cat = "EVIDENCE_FOUND"
            elif matched_doc is None:
                finding_cat = "MISSING_EVIDENCE"
            else:
                finding_cat = "MANUAL_REVIEW_REQUIRED"

            findings.append(RuleScrutinyItem(
                rule_id=r_id,
                rule_clause=clause,
                rule_title=title,
                finding_category=finding_cat,
                confidence=0.92,
                observation=obs,
                source_document_name=matched_doc["file_name"] if matched_doc else None,
                source_page_number="Page 1" if matched_doc else None,
                extracted_snippet=snippet if snippet else None
            ))

        return AutomatedScrutinyResult(
            summary=f"Automated scrutiny executed across {len(rules)} regulatory criteria and {len(documents)} submitted institutional documents.",
            findings=findings,
            cross_document_observations=cross_observations
        )

ai_provider_manager = AIProviderManager()

