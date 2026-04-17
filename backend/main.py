"""AuthentiFy API — FastAPI entry point."""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import verify, qr, health, history, stats, auth

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="AuthentiFy API",
    description="AI-Powered Certificate Verification System",
    version="1.0.0",
)

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(health.router)
app.include_router(verify.router)
app.include_router(qr.router)
app.include_router(history.router)
app.include_router(stats.router)
app.include_router(auth.router)


@app.on_event("startup")
async def startup():
    """Seed the hash registry if it doesn't exist yet."""
    from services.db_service import get_all_certificates, get_hash_registry, save_hash_registry
    from services.hash_service import generate_cert_hash

    registry = get_hash_registry()
    if not registry:
        logging.info("Seeding hash registry from certificates.json ...")
        certs = get_all_certificates()
        new_registry = {}
        for c in certs:
            h = generate_cert_hash(c)
            new_registry[c["cert_id"]] = h
        save_hash_registry(new_registry)
        logging.info(f"Seeded {len(new_registry)} hashes.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
