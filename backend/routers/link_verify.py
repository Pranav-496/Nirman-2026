"""Certificate link verification router — POST /verify/certificate."""

import logging
from fastapi import APIRouter, UploadFile, File, HTTPException

from models.schemas import CertVerificationResponse, CertLinkResult, ManualCertVerifyRequest
from services.link_verifier import verify_certificate_link

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/verify/certificate", tags=["Certificate Verification"])

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".tif", ".pdf", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("", response_model=CertVerificationResponse)
async def verify_certificate_by_link(file: UploadFile = File(...)):
    """Upload a certificate image — auto-detect URL + name, verify via link."""

    ext = "." + (file.filename or "unknown").rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type: {ext}")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(400, "File too large (max 10 MB)")

    result = await verify_certificate_link(file_bytes, file.filename)

    verdict = "VERIFIED" if result.get("verified") else "DENIED"
    cert_name = result.get("cert_name")

    message = _build_cert_message(result)

    return CertVerificationResponse(
        verdict=verdict,
        cert_name=cert_name,
        detected_urls=result.get("detected_urls", []),
        link_result=CertLinkResult(
            url_found=result.get("url_found", False),
            url=result.get("url"),
            page_name=result.get("page_name"),
            cert_name=cert_name,
            match_score=result.get("match_score", 0.0),
            verified=result.get("verified", False),
            method=result.get("method"),
            error=result.get("error"),
        ),
        message=message,
    )


@router.post("/manual", response_model=CertVerificationResponse)
async def verify_certificate_manual(req: ManualCertVerifyRequest):
    """Manual verification — user provides URL + name directly."""

    if not req.url.strip():
        raise HTTPException(400, "Verification URL is required")
    if not req.name.strip():
        raise HTTPException(400, "Certificate holder name is required")

    result = await verify_certificate_link(
        manual_url=req.url.strip(),
        manual_name=req.name.strip(),
    )

    verdict = "VERIFIED" if result.get("verified") else "DENIED"

    message = _build_cert_message(result)

    return CertVerificationResponse(
        verdict=verdict,
        cert_name=result.get("cert_name"),
        detected_urls=result.get("detected_urls", []),
        link_result=CertLinkResult(
            url_found=result.get("url_found", False),
            url=result.get("url"),
            page_name=result.get("page_name"),
            cert_name=result.get("cert_name"),
            match_score=result.get("match_score", 0.0),
            verified=result.get("verified", False),
            method=result.get("method"),
            error=result.get("error"),
        ),
        message=message,
    )


def _build_cert_message(result: dict) -> str:
    """Build a user-friendly message from verification result."""
    if result.get("verified"):
        score = result.get("match_score", 0)
        return f"Certificate VERIFIED — name match confidence: {score * 100:.0f}%. The name on the certificate matches the verification page."

    if result.get("error"):
        return f"Verification could not be completed: {result['error']}"

    if not result.get("url_found"):
        return "No verification URL was detected on the certificate. Try entering the URL manually."

    if result.get("page_name") and result.get("cert_name"):
        score = result.get("match_score", 0)
        return f"Certificate DENIED — name match confidence: {score * 100:.0f}%. The name on the certificate does not match the verification page."

    return "Certificate could not be verified through the provided link."
