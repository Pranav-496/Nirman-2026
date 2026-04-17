import sys
import easyocr

img_path = r'marksheets\f2_png.rf.0d3227aadf72ecadd8a3e773a96f5015.jpg'
reader = easyocr.Reader(["en"], gpu=False)
res = reader.readtext(img_path, detail=0)
print("--- f2_png ---")
print(" ".join(res))
