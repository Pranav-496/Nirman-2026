import re

def extract_urls_from_text(raw_text: str) -> list[str]:
    urls = []

    # Standard URL pattern
    url_pattern = r'https?://[^\s"\'<>\)\]}{,]+[^\s"\'<>\)\]}{,.]'
    found = re.findall(url_pattern, raw_text, re.IGNORECASE)
    urls.extend(found)

    # www pattern
    www_pattern = r'www\.[^\s"\'<>\)\]}{,]+[^\s"\'<>\)\]}{,.]'
    found_www = re.findall(www_pattern, raw_text, re.IGNORECASE)
    urls.extend([f"https://{u}" for u in found_www if f"https://{u}" not in urls])

    # Domain without www/http pattern (e.g. coursera.org/verify/XYZ, nptel.ac.in/noc/...)
    domain_path_pattern = r'\b(?:coursera\.org|udemy\.com|nptel\.ac\.in|credly\.com|linkedin\.com)[/\\][^\s"\'<>\)\]}{,.]+'
    found_domains = re.findall(domain_path_pattern, raw_text, re.IGNORECASE)
    urls.extend([f"https://{u.replace(chr(92), '/')}" for u in found_domains if f"https://{u}" not in urls])

    # General domain pattern that looks like domain.tld/path
    general_pattern = r'\b[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}[/\\][a-zA-Z0-9./\-_%]+'
    found_general = re.findall(general_pattern, raw_text, re.IGNORECASE)
    for u in found_general:
        # clean up backslashes that OCR might add
        u_clean = u.replace("\\", "/")
        if not u_clean.startswith("http") and not u_clean.startswith("www"):
             urls.append(f"https://{u_clean}")

    # Clean up OCR artifacts
    cleaned = []
    for url in urls:
        url = url.strip().rstrip('.,;:)')
        url = re.sub(r'\s+', '', url)
        if len(url) > 10:
            cleaned.append(url)

    return list(set(cleaned))

test_text = "Verify this certificate at: coursera.org/verify/ZWXC1L0BQYCK and also check out nptel.ac.in\\noc\\test"
print(extract_urls_from_text(test_text))
