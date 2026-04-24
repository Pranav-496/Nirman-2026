import asyncio
from playwright.async_api import async_playwright
import re

async def run():
    url = 'https://ude.my/UC-48d15d1d-6286-4ecd-b5c9-3bf1fc83819f'
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--disable-blink-features=AutomationControlled'])
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = await context.new_page()
        await page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
        """)
        print('Fetching Udemy...')
        await page.goto(url, wait_until='networkidle', timeout=30000)
        await page.wait_for_timeout(5000)
        
        title = await page.title()
        print('Title:', title)
        
        text = await page.evaluate('document.body.innerText')
        print("Body preview:", text[:200])
        
        # Try our patterns from PLATFORM_SELECTORS
        patterns = [r"This is to certify that\s+(.+?)\s+has", r"Certificate Recipient:\s*(.+)"]
        for p_str in patterns:
            m = re.search(p_str, text, re.IGNORECASE)
            if m:
                print("Matched Pattern:", p_str)
                print("Name Found:", m.group(1))
        
        await browser.close()

asyncio.run(run())
