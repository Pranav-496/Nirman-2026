"""History router — returns recent verification attempts."""

from fastapi import APIRouter, Query
from services.db_service import get_history

router = APIRouter(tags=["History"])


@router.get("/history")
async def history(limit: int = Query(20, ge=1, le=100)):
    return get_history(limit)
