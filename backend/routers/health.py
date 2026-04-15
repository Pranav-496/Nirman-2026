"""Health check router."""

from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health():
    return {"status": "ok", "service": "EduTrust API", "version": "1.0.0"}
