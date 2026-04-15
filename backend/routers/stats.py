"""Statistics router — aggregated verification analytics."""

from fastapi import APIRouter
from services.db_service import get_history, get_all_certificates

router = APIRouter(tags=["Statistics"])


@router.get("/stats")
async def get_stats():
    """Return aggregated statistics from verification history."""
    history = get_history(limit=100)
    total_certs = len(get_all_certificates())

    total = len(history)
    valid_count = sum(1 for h in history if h.get("verdict") == "VALID")
    suspicious_count = sum(1 for h in history if h.get("verdict") == "SUSPICIOUS")
    fake_count = sum(1 for h in history if h.get("verdict") == "FAKE")

    avg_score = round(
        sum(h.get("score", 0) for h in history) / total, 2
    ) if total > 0 else 0.0

    return {
        "total_verifications": total,
        "total_certificates_in_db": total_certs,
        "valid_count": valid_count,
        "suspicious_count": suspicious_count,
        "fake_count": fake_count,
        "valid_pct": round(valid_count / total * 100, 1) if total > 0 else 0,
        "suspicious_pct": round(suspicious_count / total * 100, 1) if total > 0 else 0,
        "fake_pct": round(fake_count / total * 100, 1) if total > 0 else 0,
        "avg_score": avg_score,
        "recent": history[:5],
    }
