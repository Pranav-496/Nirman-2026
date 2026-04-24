import asyncio
import re
from playwright.async_api import async_playwright

async def f():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        c = await b.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        page = await c.new_page()
        await page.goto("https://ude.my/UC-0f60fec5-53be-4bc0-83da-fc783da85ed4", wait_until="domcontentloaded")
        await page.wait_for_timeout(5000)
        html_content = await page.content()
        print("Name in HTML:", "Hrutuja patil" in html_content)
        match = re.search(r'.{0,100}Hrutuja patil.{0,100}', html_content, re.IGNORECASE)
        if match:
            print("Context:", match.group(0))
        await b.close()

if __name__ == "__main__":
    asyncio.run(f())
