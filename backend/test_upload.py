import requests
import json

url = "http://localhost:8000/verify"
filename = r"data\WhatsApp Image 2026-04-16 at 12.36.47 AM.jpeg"

with open(filename, "rb") as f:
    files = {"file": (filename, f, "image/jpeg")}
    response = requests.post(url, files=files)

print("Status:", response.status_code)
print(json.dumps(response.json(), indent=2))
