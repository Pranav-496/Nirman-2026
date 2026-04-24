import re
from bs4 import BeautifulSoup

html = """
<div class="name">Roshan Hari Jadhav</div>
Give My Certificate
Nirman
Name
Roshan Hari Jadhav
Certificate Type
"""
soup = BeautifulSoup(html, "html.parser")
text = soup.get_text(" ", strip=True)
print("Soup text:", text)

m = re.search(r"Name\s+([A-Z][a-zA-Z\s.'\-]+?)\s+Certificate Type", text, re.IGNORECASE)
print("Regex Match:", m.group(1) if m else "None")

# Test selectors
for sel in [".name", "h2", "h1"]:
    for el in soup.select(sel):
        print("Selector Match:", sel, el.get_text(strip=True))
