"""SHA-256 hashing service — generate and verify certificate hashes."""

import hashlib
import json
from typing import Optional
from services.db_service import lookup_hash


def generate_cert_hash(fields: dict) -> str:
    """Compute SHA-256 from canonical representation of certificate fields."""
    canonical = json.dumps({
        "cert_id": (fields.get("cert_id") or "").upper().strip(),
        "name": (fields.get("name") or "").upper().strip(),
        "institution": (fields.get("institution") or "").strip(),
        "year": (fields.get("year") or "").strip(),
        "grade": (fields.get("grade") or "").upper().strip(),
    }, sort_keys=True)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def verify_hash(fields: dict) -> dict:
    """Compute hash from extracted fields and compare against the registry.

    Returns: {computed_hash, stored_hash, match}
    """
    computed = generate_cert_hash(fields)
    cert_id = (fields.get("cert_id") or "").strip().upper()
    stored: Optional[str] = lookup_hash(cert_id) if cert_id else None

    return {
        "computed_hash": computed,
        "stored_hash": stored,
        "match": stored is not None and stored == computed,
    }
