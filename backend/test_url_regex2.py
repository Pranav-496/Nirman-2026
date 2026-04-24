import re

raw = "Verify at coursera.org / verify / ZWXC1L0BQYCK and also udemy.com\\ certificate \\ 1234"
pat = r'\b([a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})\s*[/\\]\s*([a-zA-Z0-9.\-_%\s/\\]+)'
found = re.findall(pat, raw)
urls = []
for m in found:
    domain = m[0]
    path = m[1].replace(' ', '').replace('\\', '/')
    path = path.strip('/')
    urls.append(f"https://{domain}/{path}")
print(urls)
