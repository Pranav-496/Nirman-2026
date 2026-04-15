"""OCR service — extracts text from images and PDFs using pytesseract with EasyOCR fallback."""

import io
import os
import logging
import numpy as np
import cv2
from PIL import Image

logger = logging.getLogger(__name__)

# ---------- helpers ----------

def _preprocess_image(img_array: np.ndarray) -> np.ndarray:
    """Grayscale, denoise, threshold — improves OCR accuracy."""
    gray = cv2.cvtColor(img_array, cv2.COLOR_BGR2GRAY) if len(img_array.shape) == 3 else img_array
    denoised = cv2.fastNlMeansDenoising(gray, h=30)
    _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return thresh


def _bytes_to_cv2(file_bytes: bytes) -> np.ndarray:
    arr = np.frombuffer(file_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    return img


def _pdf_to_images(file_bytes: bytes) -> list:
    """Convert PDF bytes to list of PIL Images."""
    try:
        from pdf2image import convert_from_bytes
        return convert_from_bytes(file_bytes, dpi=300)
    except Exception as e:
        logger.warning(f"pdf2image failed: {e}")
        return []


# ---------- OCR engines ----------

def _tesseract_ocr(img: Image.Image) -> str:
    try:
        import pytesseract
        # On Windows, you may need to set the path:
        # pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        text = pytesseract.image_to_string(img)
        return text.strip()
    except Exception as e:
        logger.warning(f"pytesseract failed: {e}")
        return ""


def _easyocr_fallback(img_array: np.ndarray) -> str:
    try:
        import easyocr
        reader = easyocr.Reader(["en"], gpu=False, verbose=False)
        results = reader.readtext(img_array, detail=0)
        return " ".join(results).strip()
    except Exception as e:
        logger.warning(f"EasyOCR failed: {e}")
        return ""


# ---------- public API ----------

def extract_text(file_bytes: bytes, filename: str) -> str:
    """Main entry point — returns extracted text from an uploaded file."""

    ext = os.path.splitext(filename)[1].lower()

    # --- handle PDFs ---
    if ext == ".pdf":
        pages = _pdf_to_images(file_bytes)
        if not pages:
            return ""
        texts = []
        for page_img in pages:
            text = _tesseract_ocr(page_img)
            if not text:
                text = _easyocr_fallback(np.array(page_img))
            texts.append(text)
        return "\n".join(texts)

    # --- handle images ---
    cv2_img = _bytes_to_cv2(file_bytes)
    if cv2_img is None:
        return ""

    preprocessed = _preprocess_image(cv2_img)
    pil_img = Image.fromarray(preprocessed)

    text = _tesseract_ocr(pil_img)
    if not text:
        logger.info("Tesseract returned empty, trying EasyOCR fallback")
        text = _easyocr_fallback(cv2_img)

    return text
