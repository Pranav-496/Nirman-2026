import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

async def f():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        c = await b.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        page = await c.new_page()
        await page.goto("https://ude.my/UC-0f60fec5-53be-4bc0-83da-fc783da85ed4", wait_until="domcontentloaded")
        await page.wait_for_timeout(5000)
        html = await page.content()
        soup = BeautifulSoup(html, "html.parser")
        el = soup.select("div[data-purpose='certificate-recipient']")[0]
        print(el.prettify())
        await b.close()

if __name__ == "__main__":
    asyncio.run(f())
