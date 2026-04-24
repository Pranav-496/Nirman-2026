import asyncio
import httpx
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

async def run():
    url = 'https://www.udemy.com/certificate/UC-2357321e-d4c3-4c91-9e8c-8be98eb82f1b/'
    
    # Try httpx
    try:
        r = httpx.get(url, timeout=10)
        print("HTTPX status:", r.status_code)
        soup = BeautifulSoup(r.text, 'html.parser')
        print("HTTPX title:", soup.title.string if soup.title else None)
    except Exception as e:
        print("HTTPX error:", e)

    # Try playwright
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, wait_until='domcontentloaded', timeout=15000)
            title = await page.title()
            print("Playwright title:", title)
            await browser.close()
    except Exception as e:
        print("Playwright error:", e)

asyncio.run(run())
