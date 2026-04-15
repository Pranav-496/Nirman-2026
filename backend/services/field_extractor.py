"""Field extractor — parses OCR text into structured certificate fields using regex."""

import re
from typing import Optional


def _find(pattern: str, text: str, group: int = 0) -> Optional[str]:
    m = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
    return m.group(group).strip() if m else None


def extract_fields(raw_text: str) -> dict:
    """Extract cert_id, name, institution, year, grade from raw OCR text.

    Returns a dict with keys: cert_id, name, institution, year, grade.
    Values are None when not found.
    """
    text = raw_text.replace("\n", " ").replace("\r", " ")

    # --- Certificate ID ---
    cert_id = _find(r"(CERT[-–—]?\d{4,8})", text, 1)
    if not cert_id:
        cert_id = _find(r"(?:certificate\s*(?:no|number|id|#)[.:;\s]*)([\w\-]+)", text, 1)

    # --- Student Name ---
    name = _find(
        r"(?:awarded\s+to|certif(?:y|ied)\s+that|presented\s+to|name)[:\s]+([A-Z][A-Za-z\s.'-]{2,40})",
        text, 1
    )
    if name:
        # clean trailing noise
        name = re.sub(r"\s{2,}", " ", name).strip()
        # remove any trailing words like 'has', 'for', 'of' that got captured
        name = re.split(r"\b(?:has|for|of|from|in|the|is)\b", name, flags=re.IGNORECASE)[0].strip()

    # --- Institution ---
    institution = _find(
        r"(?:from|by|institution|university|college|institute|school)[:\s]+([A-Z][A-Za-z\s,.'()-]{4,80})",
        text, 1
    )
    if institution:
        institution = re.split(r"\b(?:on|date|year|in|for|this)\b", institution, flags=re.IGNORECASE)[0].strip()

    # --- Year ---
    year = _find(r"(20[1-3]\d)", text, 1)

    # --- Grade ---
    grade = _find(r"(?:grade|gpa|score|result|class)[:\s]*([A-Fa-f][+\-]?|\d\.\d{1,2})", text, 1)
    if grade:
        grade = grade.upper()

    return {
        "cert_id": cert_id,
        "name": name.upper() if name else None,
        "institution": institution,
        "year": year,
        "grade": grade,
    }


def fields_completeness(fields: dict) -> float:
    """Return a 0.0–1.0 score of how many of the 5 fields were extracted."""
    keys = ["cert_id", "name", "institution", "year", "grade"]
    found = sum(1 for k in keys if fields.get(k))
    return found / len(keys)
