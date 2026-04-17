import sys
sys.path.append(".")
from services.field_extractor import extract_fields

ocr_text = "BLE Compuler Sclence Engineering Augusi 2020 Sznt SHREYAS K UI4R JBG19CS098 KRISHNA KUMAR"
fields = extract_fields(ocr_text)
print("EXTRACTED:")
print("USN:", fields.get('cert_id'))
print("NAME:", fields.get('name'))
