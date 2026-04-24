"""Link Verifier — detects URLs from certificates, scrapes verification pages, matches names.

Pipeline: QR Detect → OCR URL Extract → Fetch Page → Scrape Name → Fuzzy Match
"""

import re
import logging
from typing import Optional
from difflib import SequenceMatcher

import numpy as np
import cv2

logger = logging.getLogger(__name__)


# ========================
# 1. QR Code URL Detection
# ========================

def detect_qr_urls(file_bytes: bytes) -> list[str]:
    """Use OpenCV QRCodeDetector to find and decode QR codes in the image."""
    urls = []
    try:
        arr = np.frombuffer(file_bytes, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is None:
            return urls

        # Try standard QR detector
        detector = cv2.QRCodeDetector()
        data, points, _ = detector.detectAndDecode(img)
        if data and data.strip():
            urls.append(data.strip())

        # Also try multi-QR detection
        try:
            multi_detector = cv2.QRCodeDetector()
            retval, decoded_info, points_arr, straight_qrcode = multi_detector.detectAndDecodeMulti(img)
            if retval and decoded_info:
                for info in decoded_info:
                    if info and info.strip() and info.strip() not in urls:
                        urls.append(info.strip())
        except Exception:
            pass

        # Try with grayscale preprocessing for better detection
        if not urls:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            data2, points2, _ = detector.detectAndDecode(thresh)
            if data2 and data2.strip():
                urls.append(data2.strip())

    except Exception as e:
        logger.warning(f"QR detection error: {e}")

    # Filter to only valid URLs
    return [u for u in urls if _looks_like_url(u)]


def _looks_like_url(text: str) -> bool:
    """Check if text looks like a URL."""
    text = text.strip().lower()
    return (
        text.startswith("http://") or
        text.startswith("https://") or
        text.startswith("www.") or
        re.match(r'^[a-z0-9-]+\.[a-z]{2,}', text) is not None
    )


# ========================
# 2. OCR-based URL Extraction
# ========================

def extract_urls_from_text(raw_text: str) -> list[str]:
    """Extract URLs from OCR text using regex patterns."""
    urls = []

    # Standard URL pattern
    url_pattern = r'https?://[^\s"\'<>\)\]}{,]+[^\s"\'<>\)\]}{,.]'
    found = re.findall(url_pattern, raw_text, re.IGNORECASE)
    urls.extend(found)

    # www pattern
    www_pattern = r'www\.[^\s"\'<>\)\]}{,]+[^\s"\'<>\)\]}{,.]'
    found_www = re.findall(www_pattern, raw_text, re.IGNORECASE)
    urls.extend([f"https://{u}" for u in found_www if f"https://{u}" not in urls])

    # General domain pattern that looks like domain.tld/path (handles coursera.org / verify / XYZ)
    general_pattern = r'\b([a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}(?:\s*[/\\]\s*[a-zA-Z0-9.\-_%]+)+)'
    found_general = re.findall(general_pattern, raw_text, re.IGNORECASE)
    for u in found_general:
        # clean up spaces and backslashes that OCR might add
        u_clean = u.replace(' ', '').replace('\\', '/')
        if not u_clean.startswith("http") and not u_clean.startswith("www"):
            urls.append(f"https://{u_clean}")

    # Clean up OCR artifacts
    cleaned = []
    for url in urls:
        url = url.strip().rstrip('.,;:)')
        url = re.sub(r'\s+', '', url)  # Remove spaces OCR might have added
        if len(url) > 10:
            cleaned.append(url)

    return list(set(cleaned))


# ========================
# 3. Advanced OpenCV URL Region Detection
# ========================

def extract_urls_advanced(file_bytes: bytes) -> list[str]:
    """Use OpenCV to find URL-like text regions and run targeted OCR."""
    urls = []
    try:
        arr = np.frombuffer(file_bytes, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is None:
            return urls

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape

        # Adaptive threshold to handle varying lighting
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV, 15, 8
        )

        # Morphological close — connect nearby characters (URLs are continuous text)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 3))
        closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

        # Find contours
        contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # Filter for URL-like regions (wide, short text blocks)
        candidates = []
        for cnt in contours:
            x, y, cw, ch = cv2.boundingRect(cnt)
            aspect_ratio = cw / max(ch, 1)
            # URLs are typically wide (aspect ratio > 5) and relatively small height
            if aspect_ratio > 4 and ch < h * 0.1 and cw > w * 0.15:
                # Add some padding
                pad = 5
                x1 = max(0, x - pad)
                y1 = max(0, y - pad)
                x2 = min(w, x + cw + pad)
                y2 = min(h, y + ch + pad)
                candidates.append(gray[y1:y2, x1:x2])

        # Run OCR on each candidate region
        for crop in candidates[:5]:  # Limit to 5 candidates
            try:
                import easyocr
                reader = easyocr.Reader(["en"], gpu=False, verbose=False)
                results = reader.readtext(crop, detail=0)
                text = " ".join(results)
                found_urls = extract_urls_from_text(text)
                urls.extend(found_urls)
            except Exception:
                pass

    except Exception as e:
        logger.warning(f"Advanced URL extraction error: {e}")

    return list(set(urls))


# ========================
# 4. Web Page Fetching
# ========================

async def fetch_page_content(url: str) -> tuple[str, Optional[str]]:
    """Fetch a verification page and return (html, error)."""
    import httpx

    if not url.startswith("http"):
        url = "https://" + url

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }

    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=15.0,
            verify=False,
        ) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.text, None
    except httpx.TimeoutException:
        return "", "Request timed out — the verification site may be slow or unavailable."
    except httpx.HTTPStatusError as e:
        return "", f"Verification site returned error: {e.response.status_code}"
    except Exception as e:
        return "", f"Could not reach verification site: {str(e)}"

async def fetch_page_content_advanced(url: str) -> tuple[str, Optional[str]]:
    """Fetch verification page using async Playwright for JS-heavy sites, with httpx fallback."""
    # Normalize URL regardless of source
    if not url.startswith("http"):
        url = "https://" + url

    import asyncio

    def _fetch_sync():
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=['--disable-blink-features=AutomationControlled', '--no-sandbox']
            )
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                           "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = context.new_page()
            page.add_init_script(
                "Object.defineProperty(navigator, 'webdriver', {get: () => undefined});"
            )
            logger.info(f"Playwright fetching: {url}")
            try:
                # networkidle times out on JS-heavy sites (Udemy trackers); use domcontentloaded
                page.goto(url, wait_until="domcontentloaded", timeout=30000)
                page.wait_for_timeout(5000)
            except Exception as nav_err:
                logger.warning(f"Playwright navigation partial: {nav_err}")
            html_content = page.content()
            browser.close()
            return html_content

    # Always try Playwright first — it handles JS-rendered pages
    try:
        html = await asyncio.to_thread(_fetch_sync)
        if html and len(html) > 500:
            logger.info(f"Playwright got {len(html)} bytes for {url}")
            return html, None
        logger.warning("Playwright returned empty/short content. Falling back to httpx.")
    except Exception as pw_err:
        logger.warning(f"Playwright fetch failed: {pw_err}. Falling back to httpx.")

    logger.info(f"httpx fallback for: {url}")
    return await fetch_page_content(url)


# ========================
# 5. Name Extraction from HTML
# ========================

# Domain-specific CSS selectors for known verification platforms
PLATFORM_SELECTORS = {
    "verify.vtu.ac.in": {
        "selectors": ["td.studentname", "td:nth-child(2)", ".student-name"],
        "text_patterns": [r"Student\s*Name\s*[:\-]\s*(.+)", r"Name\s*[:\-]\s*(.+)"],
    },
    "nptel.ac.in": {
        "selectors": [".name-field", ".certificate-name", "h2"],
        "text_patterns": [r"successfully completed.*by\s+(.+)", r"Name\s*[:\-]\s*(.+)"],
    },
    "coursera.org": {
        "selectors": ["[data-testid='learner-name']", ".learner-name", "strong.name", "h2.name", ".certificate-name"],
        "text_patterns": [
            r"awarded to\s+([A-Z][A-Za-z\s.'\-]+?)(?=\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)|\d|$)", 
            r"completed by\s+([A-Z][A-Za-z\s.'\-]+?)(?=\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)|\d|$)"
        ],
    },
    "udemy.com": {
        "selectors": ["div[data-purpose='certificate-recipient']", ".certificate--name", ".ud-heading-xl"],
        "text_patterns": [r"This is to certify that\s+(.+?)\s+has", r"Certificate Recipient[:\s]*(.+?)(?:\s{2,}|$)"],
    },
    "ude.my": {
        "selectors": ["div[data-purpose='certificate-recipient']", ".certificate--name", ".ud-heading-xl"],
        "text_patterns": [r"This is to certify that\s+(.+?)\s+has", r"Certificate Recipient[:\s]*(.+?)(?:\s{2,}|$)"],
    },
    "credly.com": {
        "selectors": [".earner-name", "h1"],
        "text_patterns": [r"Issued to\s+(.+)"],
    },
    "givemycertificate.com": {
        "selectors": [],
        "text_patterns": [r"Name\s+([A-Z][a-zA-Z\s.'\-]+?)\s+Certificate Type"],
    },
    "linkedin.com": {
        "selectors": [".certificate-name", "h2"],
        "text_patterns": [r"awarded to\s+(.+)"],
    },
}


def extract_name_from_page(html: str, url: str) -> Optional[str]:
    """Extract the certificate holder's name from a verification page."""
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        logger.error("beautifulsoup4 not installed")
        return None

    soup = BeautifulSoup(html, "html.parser")

    # Remove script and style elements
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()

    # --- Try domain-specific selectors ---
    domain = _extract_domain(url)
    for platform_domain, config in PLATFORM_SELECTORS.items():
        if platform_domain in domain:
            # Try CSS selectors
            for selector in config.get("selectors", []):
                try:
                    elements = soup.select(selector)
                    for el in elements:
                        text = el.get_text(strip=True)
                        # Strip avatar initials prefix (Udemy: "HPHrutuja" → "Hrutuja")
                        text = _strip_avatar_initials(text)
                        if _looks_like_name(text):
                            return text
                except Exception:
                    continue

            # Try text patterns
            full_text = soup.get_text(" ", strip=True)
            for pattern in config.get("text_patterns", []):
                match = re.search(pattern, full_text, re.IGNORECASE)
                if match:
                    name = match.group(1).strip()
                    name = _strip_avatar_initials(name)
                    if _looks_like_name(name):
                        return name

    # --- Generic fallback: look for common name patterns ---
    full_text = soup.get_text(" ", strip=True)
    generic_patterns = [
        r"(?:awarded?\s+to|presented?\s+to|certif(?:y|ied)\s+that|issued\s+to|completed\s+by|Name\s+of\s+(?:the\s+)?(?:student|candidate|holder))\s*[:\-]?\s*([A-Z][A-Za-z\s.'\-]{2,40})",
        r"(?:Name|Student|Holder|Recipient)\s*[:\-]\s*([A-Z][A-Za-z\s.'\-]{2,40})",
        r"This\s+is\s+to\s+certify\s+that\s+([A-Z][A-Za-z\s.'\-]{2,40})\s+(?:has|of)",
    ]

    for pattern in generic_patterns:
        match = re.search(pattern, full_text, re.IGNORECASE)
        if match:
            name = match.group(1).strip()
            # Clean trailing common words
            name = re.split(r'\b(?:has|of|from|for|is|was|the|a)\b', name, flags=re.IGNORECASE)[0].strip()
            if _looks_like_name(name):
                return name

    # --- Last resort: look in table structures ---
    for table in soup.find_all("table"):
        rows = table.find_all("tr")
        for row in rows:
            cells = row.find_all(["td", "th"])
            for i, cell in enumerate(cells):
                cell_text = cell.get_text(strip=True).lower()
                if any(kw in cell_text for kw in ["name", "student", "candidate", "holder"]):
                    # The next cell likely has the name
                    if i + 1 < len(cells):
                        name = cells[i + 1].get_text(strip=True)
                        if _looks_like_name(name):
                            return name

    return None


def _extract_domain(url: str) -> str:
    """Extract domain from URL."""
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        return parsed.netloc.lower()
    except Exception:
        return url.lower()


def _looks_like_name(text: str) -> bool:
    """Check if text looks like a person's name."""
    if not text or len(text) < 2 or len(text) > 60:
        return False
    # Must contain at least one letter
    if not re.search(r'[a-zA-Z]', text):
        return False
    # Should not be too many words
    words = text.split()
    if len(words) > 6:
        return False
    # Should not be a common non-name
    lower = text.lower()
    skip_words = {"name", "student", "certificate", "verify", "verification", "date", "year"}
    if lower in skip_words:
        return False
    return True


def _strip_avatar_initials(text: str) -> str:
    """Remove avatar initials glued to the start of a name.

    Udemy renders avatar text (e.g. 'HP') directly before the name in the
    same DOM element, producing strings like 'HPHrutuja Hemant Patil'.
    Strip any run of 1–4 uppercase-only characters at the very start that
    are immediately followed by an uppercase letter (start of the real name).
    """
    m = re.match(r'^([A-Z]{1,4})([A-Z][a-z])', text)
    if m:
        return text[len(m.group(1)):]
    return text


# ========================
# 6. Name Matching
# ========================

def match_names(cert_name: str, page_name: str) -> float:
    """Fuzzy match two names. Returns a score 0.0–1.0."""
    if not cert_name or not page_name:
        return 0.0

    # Normalize
    a = _normalize_name(cert_name)
    b = _normalize_name(page_name)

    if not a or not b:
        return 0.0

    # Exact match
    if a == b:
        return 1.0

    # Direct SequenceMatcher
    ratio = SequenceMatcher(None, a, b).ratio()

    # Token-sort match (handles "K SHREYAS" vs "SHREYAS K")
    tokens_a = sorted(a.split())
    tokens_b = sorted(b.split())
    sorted_ratio = SequenceMatcher(None, " ".join(tokens_a), " ".join(tokens_b)).ratio()

    # Token-set match (handles subsets — "S K" matching "SHREYAS K")
    set_a = set(tokens_a)
    set_b = set(tokens_b)
    if set_a and set_b:
        intersection = set_a & set_b
        if intersection:
            set_score = len(intersection) / max(len(set_a), len(set_b))
        else:
            set_score = 0.0
    else:
        set_score = 0.0

    # Take the best score
    return round(max(ratio, sorted_ratio, set_score), 4)


def _normalize_name(name: str) -> str:
    """Normalize a name for comparison."""
    name = name.upper().strip()
    name = re.sub(r'[^A-Z\s]', '', name)  # Remove non-alpha
    name = re.sub(r'\s+', ' ', name)  # Collapse whitespace
    return name.strip()


# ========================
# 7. Main Orchestrator
# ========================

async def verify_certificate_link(
    file_bytes: Optional[bytes] = None,
    filename: Optional[str] = None,
    manual_url: Optional[str] = None,
    manual_name: Optional[str] = None,
) -> dict:
    """
    Run the full certificate link verification pipeline.
    Returns a result dict with all verification details.
    """
    result = {
        "url_found": False,
        "url": None,
        "page_name": None,
        "cert_name": None,
        "match_score": 0.0,
        "verified": False,
        "method": None,
        "detected_urls": [],
        "error": None,
    }

    cert_name = manual_name
    all_urls = []

    # --- Extract name and URLs from certificate image ---
    if file_bytes:
        # OCR for name extraction
        try:
            from services.ocr_service import extract_text
            from services.field_extractor import extract_fields

            raw_text = extract_text(file_bytes, filename or "certificate.png")
            fields = extract_fields(raw_text)
            cert_name = cert_name or fields.get("name")

            # Extract URLs from OCR text
            ocr_urls = extract_urls_from_text(raw_text)
            all_urls.extend([(u, "ocr") for u in ocr_urls])

        except Exception as e:
            logger.warning(f"OCR extraction failed: {e}")

        # QR code detection (most reliable)
        qr_urls = detect_qr_urls(file_bytes)
        # Prepend QR URLs — they are the highest priority
        all_urls = [(u, "qr") for u in qr_urls] + all_urls

        # Advanced OpenCV URL detection (if no URLs found yet)
        if not all_urls:
            try:
                adv_urls = extract_urls_advanced(file_bytes)
                all_urls.extend([(u, "opencv") for u in adv_urls])
            except Exception as e:
                logger.warning(f"Advanced URL extraction failed: {e}")

    # --- Use manual URL if provided ---
    if manual_url:
        all_urls = [(manual_url.strip(), "manual")] + all_urls

    result["cert_name"] = cert_name
    result["detected_urls"] = [u for u, _ in all_urls]

    if not all_urls:
        result["error"] = "No verification URL detected on the certificate. Try entering the URL manually."
        return result

    # --- Try each URL until one works ---
    for url, method in all_urls:
        result["url_found"] = True
        result["url"] = url
        result["method"] = method

        # Fetch the verification page (using advanced JS-rendered fetch)
        html, fetch_error = await fetch_page_content_advanced(url)
        if fetch_error:
            result["error"] = fetch_error
            continue

        if not html or len(html) < 50:
            result["error"] = "Verification page returned empty content."
            continue

        # Extract name from the page
        page_name = extract_name_from_page(html, url)
        result["page_name"] = page_name

        if not page_name:
            result["error"] = "Could not extract a name from the verification page."
            # Still consider it partially successful — URL was reachable
            continue

        if not cert_name:
            result["error"] = "Could not extract a name from the certificate for comparison."
            continue

        # Match names
        score = match_names(cert_name, page_name)
        result["match_score"] = score
        result["verified"] = score >= 0.60
        result["error"] = None
        break

    return result
