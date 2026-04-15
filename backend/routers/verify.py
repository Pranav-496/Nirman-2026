"""Verification router — POST /verify (file), POST /verify/manual (JSON)."""

import logging
from fastapi import APIRouter, UploadFile, File, HTTPException

from models.schemas import (
    ManualVerifyRequest, VerificationResponse,
    ExtractedFields, CheckDetails, Verdict,
)
from services.ocr_service import extract_text
from services.field_extractor import extract_fields, fields_completeness
from services.hash_service import verify_hash
from services.ml_service import analyze_tampering
from services.db_service import find_certificate, add_history_entry
from services.scoring_engine import compute_score

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/verify", tags=["Verification"])

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".tif", ".pdf", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("", response_model=VerificationResponse)
async def verify_certificate(file: UploadFile = File(...)):
    """Full pipeline: OCR → Field extraction → Hash check → ML check → DB lookup → Score."""

    # ---- validate ----
    ext = "." + (file.filename or "unknown").rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type: {ext}")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(400, "File too large (max 10 MB)")

    # ---- OCR ----
    raw_text = extract_text(file_bytes, file.filename or "upload.png")
    logger.info(f"OCR extracted {len(raw_text)} chars")

    # ---- Field extraction ----
    fields = extract_fields(raw_text)
    completeness = fields_completeness(fields)

    # ---- Hash check ----
    hash_result = verify_hash(fields)

    # ---- ML tampering ----
    tamper_score = analyze_tampering(file_bytes)

    # ---- DB lookup ----
    db_record = find_certificate(
        cert_id=fields.get("cert_id"),
        name=fields.get("name"),
        institution=fields.get("institution"),
    )
    db_match = db_record is not None

    # ---- Scoring ----
    score, verdict = compute_score(db_match, hash_result["match"], tamper_score, completeness)

    # ---- History ----
    add_history_entry(fields.get("cert_id"), verdict.value, score)

    message = _build_message(verdict, db_match, hash_result["match"], tamper_score)

    return VerificationResponse(
        verdict=verdict,
        score=score,
        extracted_fields=ExtractedFields(**fields),
        checks=CheckDetails(
            db_match=db_match,
            hash_match=hash_result["match"],
            tamper_score=tamper_score,
            fields_complete=completeness,
        ),
        computed_hash=hash_result["computed_hash"],
        message=message,
    )


@router.post("/manual", response_model=VerificationResponse)
async def verify_manual(req: ManualVerifyRequest):
    """Manual verification — user types cert_id + name (no file upload)."""
    fields = {
        "cert_id": req.cert_id.strip().upper(),
        "name": req.name.strip().upper(),
        "institution": (req.institution or "").strip(),
        "year": (req.year or "").strip(),
        "grade": (req.grade or "").upper().strip(),
    }
    completeness = fields_completeness(fields)
    hash_result = verify_hash(fields)
    db_record = find_certificate(
        cert_id=fields["cert_id"],
        name=fields["name"],
        institution=fields["institution"],
    )
    db_match = db_record is not None

    # No file → no tampering check, assume clean (0.0)
    tamper_score = 0.0

    score, verdict = compute_score(db_match, hash_result["match"], tamper_score, completeness)
    add_history_entry(fields["cert_id"], verdict.value, score)
    message = _build_message(verdict, db_match, hash_result["match"], tamper_score)

    return VerificationResponse(
        verdict=verdict,
        score=score,
        extracted_fields=ExtractedFields(**fields),
        checks=CheckDetails(
            db_match=db_match,
            hash_match=hash_result["match"],
            tamper_score=tamper_score,
            fields_complete=completeness,
        ),
        computed_hash=hash_result["computed_hash"],
        message=message,
    )


def _build_message(verdict: Verdict, db_match: bool, hash_match: bool, tamper: float) -> str:
    parts = []
    if verdict == Verdict.VALID:
        parts.append("Certificate verified successfully.")
    elif verdict == Verdict.SUSPICIOUS:
        parts.append("Certificate could not be fully verified.")
    else:
        parts.append("Certificate appears to be invalid or forged.")

    if not db_match:
        parts.append("No matching record found in the database.")
    if not hash_match:
        parts.append("Hash integrity check failed — data may have been altered.")
    if tamper > 0.5:
        parts.append("Image tampering indicators detected.")
    return " ".join(parts)
