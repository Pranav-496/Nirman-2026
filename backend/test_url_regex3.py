import re

raw1 = "Verify at coursera.org/verify/ZWXC1L0BQYCK"
raw2 = "Verify at coursera.org / verify / ZWXC1L0BQYCK"
raw3 = "Verify at nptel.ac.in\\noc\\test"

pat = r'\b([a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}(?:\s*[/\\]\s*[a-zA-Z0-9.\-_%]+)+)'

for raw in [raw1, raw2, raw3]:
    found = re.findall(pat, raw)
    urls = []
    for m in found:
        clean = m.replace(' ', '').replace('\\', '/')
        urls.append(f"https://{clean}")
    print(raw, "->", urls)
