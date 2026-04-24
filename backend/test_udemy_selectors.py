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
        print("Selectors:")
        for sel in [".certificate--name", ".ud-heading-xl", "div[data-purpose='certificate-recipient']", "div[data-purpose='certificate-recipient'] h1", "div[data-purpose='certificate-recipient'] .ud-heading-xl"]:
            els = soup.select(sel)
            el = els[0] if els else None
            print(f"{sel} -> {el.get_text(strip=True) if el else 'None'}")
        await b.close()

if __name__ == "__main__":
    asyncio.run(f())
