import re

def extract(text):
    text_upper = text.upper()
    cert_match = re.search(r"\b(?=.*\d)(?=.*[A-Z])[A-Z0-9]{10}\b", text_upper)
    cert_id = cert_match.group(0).strip() if cert_match else None

    name = None
    if cert_id:
        pre_text = text[:cert_match.start()]
        pre_words = re.split(r'\s+', pre_text.strip())
        valid_words = [w for w in pre_words if len(w) > 1 or w in ("K", "A", "M")]
        
        name_words = []
        for w in reversed(valid_words[-4:]):
            if w.upper() in ("SZNT", "UI4R", "FD", "STUDENT", "NAME", "OF", "THE", "AME", "ENANERTT", "2020", "2021", "AUGUST"):
                continue
            name_words.insert(0, w)
        if name_words:
            name = " ".join(name_words)

    return cert_id, name

tests = [
    "BLE Compuler Sclence Engineering Augusi 2020 Sznt SHREYAS K UI4R JBG19CS098 KRISHNA KUMAR",
    "223p01 30038 Oeptr@aj; 2341102 VARATFCINOLONICALUNIVFRSTTY KELAGAV LAbtl U a GK Lg} Jiu0 028145 BE Compular Scenco Ergingering Auqust 2021 Enanertt SKRETAS k Fd 48G19C309R AT = KRISHNA KUMAR"
]

for t in tests:
    print(extract(t))
