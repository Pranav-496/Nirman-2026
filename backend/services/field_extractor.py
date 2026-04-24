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

    # --- Certificate ID (USN) & Student Name via Relative Positioning ---
    text_upper = text.upper()
    cert_id = None
    name = None

    # Find the 10-char USN block (must contain both letters and digits)
    cert_match = re.search(r"\b(?=.*\d)(?=.*[A-Z])[A-Z0-9]{10}\b", text_upper)
    if cert_match:
        cert_id = cert_match.group(0).strip()
        # Fix known EasyOCR 1->J anomaly if applicable
        if cert_id.startswith("JBG"):
            cert_id = "1BG" + cert_id[3:]

        # Extract text right before USN for the name
        pre_text = text[:cert_match.start()]
        pre_words = re.split(r'\s+', pre_text.strip())
        
        # Valid name words (allow single initials like K, M, A)
        valid_words = [w for w in pre_words if len(w) > 1 or w.upper() in ("K", "A", "M")]
        
        name_words = []
        # Grab up to 4 words before the USN, ignoring OCR junk markers
        for w in reversed(valid_words[-5:]):
            if w.upper() in ("SZNT", "UI4R", "FD", "STUDENT", "NAME", "OF", "THE", "AME", "ENANERTT", "2020", "2021", "AUGUST"):
                continue
            name_words.insert(0, w)
        if name_words:
            name = " ".join(name_words)

    if not cert_id:
        cert_id = _find(r"(CERT[-–—]?\d{4,8})", text, 1)

    if not name:
        name = _find(r"Name of the Student[\s:;\-]+([A-Z\s]+)(?:USN|Father|Mother|Date|Course|[\n])", text, 1)
        if not name:
            name = _find(r"(?:awarded\s+to|certif(?:y|ied)\s+that|presented\s+to|name)[:\s]+([A-Z][A-Za-z\s.'-]{2,40})", text, 1)
        if not name:
            name = _find(r"completed by\s+([A-Z][A-Za-z\s.'\-]+?)(?=\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)|\d|$)", text, 1)

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
