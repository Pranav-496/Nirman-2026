import httpx
import re
import json

url = "https://www.coursera.org/account/accomplishments/specialization/ZWXC1L0BQYCK"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

r = httpx.get(url, headers=headers, follow_redirects=True, verify=False, timeout=15.0)
html = r.text

print(f"Status: {r.status_code}")
print(f"HTML length: {len(html)}")

# Check og tags
og = re.findall(r'<meta[^>]*(?:property|name)="([^"]+)"[^>]*content="([^"]+)"', html)
print(f"\nMETA TAGS:")
for n, v in og:
    print(f"  {n}: {v}")

title = re.findall(r'<title>([^<]+)</title>', html)
print(f"\nTITLE: {title}")

# Check __NEXT_DATA__
nd = re.findall(r'<script id="__NEXT_DATA__"[^>]*>(.+?)</script>', html, re.DOTALL)
if nd:
    try:
        data = json.loads(nd[0])
        # pretty print __NEXT_DATA__ partially
        print(f"\nNEXT_DATA found!")
        # Dump a portion to find names
        s = json.dumps(data)
        import re as regex
        names = regex.findall(r'"(?:name|fullName|learnerName)":\s*"([^"]+)"', s)
        print(f"Names found in NEXT_DATA: set({set(names)})")
        
        # Look for the exact name 'Pranav Landge'
        if 'Pranav Landge' in s:
             print("Found exactly 'Pranav Landge' in NEXT_DATA!")
    except Exception as e:
        print(f"Error parsing NEXT_DATA: {e}")

# Check Apollo state
apollo = re.findall(r'window\.__APOLLO_STATE__\s*=\s*({.+?});\s*</script>', html, re.DOTALL)
if apollo:
    print(f"\nAPOLLO STATE found!")
    names = re.findall(r'"(?:name|fullName|learnerName)":\s*"([^"]+)"', apollo[0])
    print(f"Names found in APOLLO: set({set(names)})")
    if 'Pranav Landge' in apollo[0]:
         print("Found exactly 'Pranav Landge' in APOLLO!")
