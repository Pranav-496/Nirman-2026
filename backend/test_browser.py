import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        page.on('console', lambda msg: print(f'CONSOLE: {msg.text}'))
        page.on('pageerror', lambda err: print(f'PAGE ERROR: {err}'))
        
        await page.goto('http://localhost:5173/verify/certificate')
        
        # Create a dummy image
        with open("test.png", "wb") as f:
            f.write(b"fake image")
            
        await page.set_input_files('input[type="file"]', 'test.png')
        
        await page.wait_for_timeout(10000)
        
        await browser.close()

asyncio.run(run())
