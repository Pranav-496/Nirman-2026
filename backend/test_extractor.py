import asyncio
from services.link_verifier import fetch_page_content_advanced, extract_name_from_page

async def run():
    url = 'https://verification.givemycertificate.com/v/ca0e4e2c-3be1-40c2-b2b5-830a859b3633'
    html, err = await fetch_page_content_advanced(url)
    print("Fetch Error:", err)
    print("HTML Length:", len(html) if html else 0)
    if html:
        name = extract_name_from_page(html, url)
        print("Extracted Name:", name)

asyncio.run(run())
