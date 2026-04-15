"""Pydantic models for EduTrust request/response validation."""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class Verdict(str, Enum):
    VALID = "VALID"
    SUSPICIOUS = "SUSPICIOUS"
    FAKE = "FAKE"


class ExtractedFields(BaseModel):
    cert_id: Optional[str] = None
    name: Optional[str] = None
    institution: Optional[str] = None
    year: Optional[str] = None
    grade: Optional[str] = None


class CheckDetails(BaseModel):
    db_match: bool = False
    hash_match: bool = False
    tamper_score: float = Field(0.0, ge=0.0, le=1.0)
    fields_complete: float = Field(0.0, ge=0.0, le=1.0)


class VerificationResponse(BaseModel):
    verdict: Verdict
    score: float = Field(..., ge=0.0, le=100.0)
    extracted_fields: ExtractedFields
    checks: CheckDetails
    computed_hash: Optional[str] = None
    message: str = ""


class ManualVerifyRequest(BaseModel):
    cert_id: str
    name: str
    institution: Optional[str] = None
    year: Optional[str] = None
    grade: Optional[str] = None


class QRGenerateRequest(BaseModel):
    cert_id: str


class HistoryEntry(BaseModel):
    timestamp: str
    cert_id: Optional[str] = None
    verdict: Verdict
    score: float
