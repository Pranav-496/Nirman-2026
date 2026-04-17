import os
import sys
import json
import logging
from services.ocr_service import extract_text
from services.field_extractor import extract_fields

logging.basicConfig(level=logging.INFO)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
CERT_DB_PATH = os.path.join(DATA_DIR, "certificates.json")

def seed_database():
    certs = []
    processed_count = 0
    missing_count = 0

    print("--- Starting VTU Marksheet OCR Database Seeding ---")
    for filename in os.listdir(DATA_DIR):
        if filename.endswith(".json"): continue
        file_path = os.path.join(DATA_DIR, filename)
        if not os.path.isfile(file_path): continue

        print(f"Processing OCR on: {filename} ...")
        with open(file_path, "rb") as f:
            file_bytes = f.read()

        raw_text = extract_text(file_bytes, filename)
        fields = extract_fields(raw_text)

        usn = fields.get("cert_id")
        name = fields.get("name")

        if usn and name:
            certs.append({
                "cert_id": usn.strip().upper(),
                "name": name.strip().upper(),
                "institution": "Visvesvaraya Technological University",
                "year": fields.get("year", "2020"),
                "grade": fields.get("grade", "N/A"),
                "source": filename
            })
            print(f"   [SUCCESS] Indexed USN: {usn.strip().upper()} | Name: {name.strip().upper()}")
            processed_count += 1
        else:
            print(f"   [FAILED] Incomplete OCR data for {filename}")
            missing_count += 1

    with open(CERT_DB_PATH, "w", encoding="utf-8") as f:
        json.dump(certs, f, indent=2)

    print(f"\n--- SEEDING COMPLETE ---")
    print(f"Successfully indexed {processed_count} marksheets into the database.")
    print(f"Failed to extract data from {missing_count} files.")

if __name__ == "__main__":
    seed_database()
