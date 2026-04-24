import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        print("Fetching givemycertificate...")
        await page.goto('https://verification.givemycertificate.com/v/ca0e4e2c-3be1-40c2-b2b5-830a859b3633', wait_until='networkidle', timeout=30000)
        await page.wait_for_timeout(3000)
        
        # Print main text content to see where the name is
        text = await page.evaluate('document.body.innerText')
        print("TEXT CONTENT:")
        print(text[:1000].encode('utf-8'))
        
        # Print headings
        headings = await page.evaluate('''
            Array.from(document.querySelectorAll("h1, h2, h3, p, span, div.name")).map(el => el.textContent.trim()).filter(t => t.length > 0).slice(0, 20)
        ''')
        print("HEADINGS/SPANS:", headings)
        
        await browser.close()

asyncio.run(run())
