"""Test the full certificate link verification pipeline with Udemy."""
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import re, json

UDEMY_URL = "https://www.udemy.com/certificate/UC-e6db8ed0-cde2-4bfa-860c-40a7bb20e8eb/"

def test_playwright_udemy():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=[
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
        ])
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
        
        print(f"Navigating to: {UDEMY_URL}")
        page.goto(UDEMY_URL, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(5000)
        
        html = page.content()
        print(f"HTML length: {len(html)}")
        
        # Save for analysis
        with open("udemy_playwright.html", "w", encoding="utf-8") as f:
            f.write(html)
        
        # Parse
        soup = BeautifulSoup(html, "html.parser")
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()
        
        full_text = soup.get_text(" ", strip=True)
        print(f"\n--- FULL TEXT (first 3000 chars) ---")
        print(full_text[:3000])
        
        # Look for names
        print(f"\n--- NAME SEARCH ---")
        patterns = [
            r"This is to certify that\s+(.+?)\s+has",
            r"Certificate Recipient[:\s]*(.+?)(?:\s{2,}|\n|$)",
            r"awarded to\s+(.+?)(?:\s{2,}|\n|$)",
        ]
        for pat in patterns:
            m = re.search(pat, full_text, re.IGNORECASE)
            if m:
                print(f"FOUND: '{m.group(1)}' via pattern: {pat}")
        
        # Try CSS selectors
        print(f"\n--- SELECTOR SEARCH ---")
        selectors = [
            "div[data-purpose='certificate-recipient'] a",
            ".certificate--name",
            ".ud-heading-xl",
            "h1",
            "[data-purpose='certificate-recipient']",
            ".certificate-holder",
            ".certificate--recipient-name",
        ]
        for sel in selectors:
            els = soup.select(sel)
            for el in els:
                text = el.get_text(strip=True)
                if text:
                    print(f"  [{sel}] => '{text}'")
        
        browser.close()

if __name__ == "__main__":
    test_playwright_udemy()
