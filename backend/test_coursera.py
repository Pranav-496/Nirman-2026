"""Test what Coursera's verification page actually contains."""
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
og = re.findall(r'<meta[^>]*property="og:([^"]+)"[^>]*content="([^"]+)"', html)
print(f"\nOG TAGS: {og}")

# Check other meta tags
meta = re.findall(r'<meta[^>]*name="([^"]+)"[^>]*content="([^"]+)"', html)
print(f"\nMETA TAGS: {meta}")

# Check title
t = re.findall(r'<title>([^<]+)</title>', html)
print(f"\nTITLE: {t}")

# Check JSON-LD
ld = re.findall(r'<script type="application/ld\+json">(.+?)</script>', html, re.DOTALL)
if ld:
    for i, item in enumerate(ld[:3]):
        print(f"\nJSON-LD {i}: {item[:500]}")
else:
    print("\nJSON-LD: NONE")

# Check __NEXT_DATA__ or similar state
nd = re.findall(r'<script id="__NEXT_DATA__"[^>]*>(.+?)</script>', html, re.DOTALL)
if nd:
    try:
        data = json.loads(nd[0])
        print(f"\nNEXT_DATA keys: {list(data.keys())}")
        if 'props' in data:
            print(f"props keys: {list(data['props'].keys())}")
            if 'pageProps' in data['props']:
                print(f"pageProps keys: {list(data['props']['pageProps'].keys())}")
                pp = data['props']['pageProps']
                # Dump a portion  
                print(f"\npageProps content (first 2000 chars): {json.dumps(pp)[:2000]}")
    except:
        print(f"\nNEXT_DATA raw (first 1000 chars): {nd[0][:1000]}")
else:
    print("\nNEXT_DATA: NONE")

# Check for Apollo/GraphQL state
apollo = re.findall(r'window\.__APOLLO_STATE__\s*=\s*({.+?});\s*</script>', html, re.DOTALL)
if apollo:
    print(f"\nAPOLLO STATE (first 1000 chars): {apollo[0][:1000]}")
else:
    print("\nAPOLLO STATE: NONE")

# Look for any embedded name-like data
name_patterns = re.findall(r'"(?:name|learnerName|fullName|userName)":\s*"([^"]+)"', html)
print(f"\nNAME-LIKE DATA: {name_patterns}")

# Look for verification-related data
verify_patterns = re.findall(r'"(?:verif|certif|accomplish|specializ)[^"]*":\s*"?([^",}{]+)', html[:5000], re.IGNORECASE)
print(f"\nVERIFICATION DATA: {verify_patterns[:10]}")
