"""Database service — reads certificates.json and hash_registry.json."""

import json
import os
from typing import Optional
from datetime import datetime, timezone

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
CERT_DB_PATH = os.path.join(DATA_DIR, "certificates.json")
HASH_REG_PATH = os.path.join(DATA_DIR, "hash_registry.json")
HISTORY_PATH = os.path.join(DATA_DIR, "history.json")


def _load_json(path: str) -> list | dict:
    if not os.path.exists(path):
        return [] if path.endswith("history.json") else {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_json(path: str, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


# --------------- Certificate DB ---------------

def get_all_certificates() -> list[dict]:
    return _load_json(CERT_DB_PATH)


def find_certificate(cert_id: Optional[str] = None,
                     name: Optional[str] = None,
                     institution: Optional[str] = None) -> Optional[dict]:
    """Look up a certificate by cert_id first, then fallback to name+institution."""
    certs = get_all_certificates()

    if cert_id:
        cert_id_upper = cert_id.strip().upper()
        for c in certs:
            if c["cert_id"].upper() == cert_id_upper:
                return c

    if name:
        name_upper = name.strip().upper()
        for c in certs:
            if c["name"].upper() == name_upper:
                if institution:
                    if institution.strip().upper() in c["institution"].upper():
                        return c
                else:
                    return c

    return None


# --------------- Hash Registry ---------------

def get_hash_registry() -> dict:
    """Returns {cert_id: hash_hex, ...}."""
    return _load_json(HASH_REG_PATH)


def lookup_hash(cert_id: str) -> Optional[str]:
    registry = get_hash_registry()
    return registry.get(cert_id.strip().upper(), None)


def save_hash_registry(registry: dict):
    _save_json(HASH_REG_PATH, registry)


# --------------- History ---------------

def add_history_entry(cert_id: Optional[str], verdict: str, score: float):
    history = _load_json(HISTORY_PATH)
    if not isinstance(history, list):
        history = []
    history.insert(0, {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "cert_id": cert_id or "UNKNOWN",
        "verdict": verdict,
        "score": round(score, 2),
    })
    # keep last 50 entries
    history = history[:50]
    _save_json(HISTORY_PATH, history)


def get_history(limit: int = 20) -> list[dict]:
    history = _load_json(HISTORY_PATH)
    if not isinstance(history, list):
        return []
    return history[:limit]
