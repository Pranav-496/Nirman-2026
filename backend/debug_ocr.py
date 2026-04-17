import easyocr
import sys

img_path = r'data\WhatsApp Image 2026-04-16 at 12.36.47 AM.jpeg'
reader = easyocr.Reader(["en"], gpu=False)
res = reader.readtext(img_path, detail=0)
print(" ".join(res))
