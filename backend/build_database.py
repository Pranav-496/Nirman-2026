import os
import json
import logging
from services.ocr_service import extract_text
from services.field_extractor import extract_fields

logging.basicConfig(level=logging.INFO)

DATA_DIR = os.path.join(os.path.dirname(__file__), "marksheets")
CERT_DB_PATH = os.path.join(os.path.dirname(__file__), "data", "certificates.json")

def build_database():
    certs = []
    processed_count = 0

    print("--- Reading Marksheets for Ground Truth DB ---")
    if not os.path.exists(DATA_DIR):
        print(f"Directory {DATA_DIR} does not exist.")
        return

    for filename in os.listdir(DATA_DIR):
        file_path = os.path.join(DATA_DIR, filename)
        if not os.path.isfile(file_path): continue

        print(f"Processing OCR on: {filename} ...")
        with open(file_path, "rb") as f:
            file_bytes = f.read()

        raw_text = extract_text(file_bytes, filename)
        fields = extract_fields(raw_text)

        usn = fields.get("cert_id")
        name = fields.get("name")
        year = fields.get("year", "2020")
        inst = fields.get("institution", "VISVESVARAYA TECHNOLOGICAL UNIVERSITY")

        if usn and name:
            certs.append({
                "cert_id": usn.strip().upper(),
                "name": name.strip().upper(),
                "institution": inst,
                "year": year
            })
            print(f"   [SUCCESS] Indexed USN: {usn.strip().upper()} | Name: {name.strip().upper()}")
            processed_count += 1
        else:
            print(f"   [FAILED] Could not fully read USN/Name from {filename}")

    # Completely overwrite the certificates.json database with the exact 4 parameters
    with open(CERT_DB_PATH, "w", encoding="utf-8") as f:
        json.dump(certs, f, indent=2)

    print(f"\n--- DATABASE SEEDING COMPLETE ---")
    print(f"Successfully tracked {processed_count} marksheets as Authorized Source of Truth.")

if __name__ == "__main__":
    build_database()
