"""QR code router — generate and verify certificates via QR / ID lookup."""

import io
import base64
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse

from models.schemas import (
    QRGenerateRequest, VerificationResponse,
    ExtractedFields, CheckDetails,
)
from services.db_service import find_certificate, add_history_entry
from services.hash_service import verify_hash
from services.scoring_engine import compute_score

router = APIRouter(tags=["QR"])


@router.get("/qr-verify")
async def qr_verify(id: str = Query(..., description="Certificate ID")):
    """Quick certificate lookup by ID — used after scanning a QR code."""
    cert_id = id.strip().upper()
    record = find_certificate(cert_id=cert_id)

    if not record:
        raise HTTPException(404, f"No certificate found with ID: {cert_id}")

    fields = {
        "cert_id": record["cert_id"],
        "name": record["name"],
        "institution": record["institution"],
        "year": record["year"],
        "grade": record["grade"],
    }
    hash_result = verify_hash(fields)
    completeness = 1.0  # from DB, all fields present
    tamper_score = 0.0  # no image to check
    score, verdict = compute_score(True, hash_result["match"], tamper_score, completeness)
    add_history_entry(cert_id, verdict.value, score)

    return VerificationResponse(
        verdict=verdict,
        score=score,
        extracted_fields=ExtractedFields(**fields),
        checks=CheckDetails(
            db_match=True,
            hash_match=hash_result["match"],
            tamper_score=tamper_score,
            fields_complete=completeness,
        ),
        computed_hash=hash_result["computed_hash"],
        message="Certificate found in database and verified via QR lookup.",
    )


@router.post("/qr-generate")
async def qr_generate(req: QRGenerateRequest):
    """Generate a QR code PNG (base64) encoding the verification URL for a cert."""
    try:
        import qrcode
    except ImportError:
        raise HTTPException(500, "qrcode library not installed")

    cert_id = req.cert_id.strip().upper()
    record = find_certificate(cert_id=cert_id)
    if not record:
        raise HTTPException(404, f"No certificate found with ID: {cert_id}")

    verify_url = f"https://authentify.app/qr-verify?id={cert_id}"
    qr = qrcode.make(verify_url)
    buf = io.BytesIO()
    qr.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode()

    return JSONResponse({
        "cert_id": cert_id,
        "qr_base64": b64,
        "verify_url": verify_url,
    })
