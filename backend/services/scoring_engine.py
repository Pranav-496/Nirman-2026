"""Scoring engine — computes final confidence score and verdict."""

from models.schemas import Verdict


def compute_score(db_match: bool,
                  hash_match: bool,
                  tamper_score: float,
                  fields_complete: float) -> tuple[float, Verdict]:
    """
    score = db_match*40 + hash_match*30 + (1-tamper_score)*20 + fields_complete*10

    Returns (score, verdict).
    """
    score = (
        (1.0 if db_match else 0.0) * 40 +
        (1.0 if hash_match else 0.0) * 30 +
        (1.0 - tamper_score) * 20 +
        fields_complete * 10
    )
    score = round(min(score, 100.0), 2)

    if score >= 75:
        verdict = Verdict.VALID
    elif score >= 40:
        verdict = Verdict.SUSPICIOUS
    else:
        verdict = Verdict.FAKE

    return score, verdict
