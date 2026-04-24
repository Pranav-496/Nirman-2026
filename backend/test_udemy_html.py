import asyncio
from playwright.async_api import async_playwright

url = "https://ude.my/UC-0f60fec5-53be-4bc0-83da-fc783da85ed4"

async def f():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        c = await b.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        page = await c.new_page()
        await page.goto(url, wait_until="domcontentloaded")
        await page.wait_for_timeout(5000)
        html = await page.content()
        print("Name found:", "Hrutuja" in html)
        print("Cloudflare blocked:", "Cloudflare" in html or "cloudflare" in html.lower())
        await b.close()

if __name__ == "__main__":
    asyncio.run(f())
