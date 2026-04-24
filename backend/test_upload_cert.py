import requests

url = "http://localhost:8000/verify/certificate"
files = {"file": ("test.png", b"fake image content", "image/png")}
response = requests.post(url, files=files)
print(response.status_code)
print(response.json())
