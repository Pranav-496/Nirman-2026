import asyncio
from playwright.async_api import async_playwright

async def main():
    url = "https://www.coursera.org/account/accomplishments/specialization/ZWXC1L0BQYCK"
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        print("Navigating...")
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_timeout(5000)
        print("Taking screenshot...")
        await page.screenshot(path="screenshot.png")
        await browser.close()
        print("Done.")

if __name__ == "__main__":
    asyncio.run(main())
