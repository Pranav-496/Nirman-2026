import asyncio
import logging

logging.basicConfig(level=logging.INFO)

from services.link_verifier import fetch_page_content_advanced, extract_name_from_page

async def main():
    url = "https://www.coursera.org/account/accomplishments/specialization/ZWXC1L0BQYCK"
    html, err = await fetch_page_content_advanced(url)
    if err:
        print("Error fetching:", err)
        return
    
    with open("coursera_playwright.html", "w", encoding="utf-8") as f:
        f.write(html)
        
    print("HTML length:", len(html))
    name = extract_name_from_page(html, url)
    print("Extracted Name:", name)

if __name__ == "__main__":
    asyncio.run(main())
