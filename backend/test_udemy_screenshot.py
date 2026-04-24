import asyncio
from playwright.async_api import async_playwright

async def f():
    url = "https://ude.my/UC-0f60fec5-53be-4bc0-83da-fc783da85ed4"
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        c = await b.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        page = await c.new_page()
        await page.goto(url, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(5000)
        await page.screenshot(path="udemy_screenshot.png")
        await b.close()
        print("Screenshot saved to udemy_screenshot.png")

if __name__ == "__main__":
    asyncio.run(f())
