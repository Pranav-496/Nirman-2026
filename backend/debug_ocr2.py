import easyocr
import sys

img_path = r'data\Upto-4th-Sem-Markscard_page-0002_jpg.rf.0d819041ec1c1b69dc109cd0ade8efdb.jpg'
reader = easyocr.Reader(["en"], gpu=False)
res = reader.readtext(img_path, detail=0)
print(" ".join(res))
