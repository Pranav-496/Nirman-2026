import asyncio
import io
from PIL import Image, ImageDraw, ImageFont
from services.link_verifier import verify_certificate_link

async def test_upload_flow_no_qr():
    # Create a mock Coursera certificate image without a QR code
    img = Image.new('RGB', (800, 600), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    
    # Add text - notice there's no http:// or www.
    text = "Python for Everybody\nCompleted by Pranav Landge\nFebruary 3, 2026\ncoursera.org/verify/ZWXC1L0BQYCK"
    d.text((50, 50), text, fill=(0, 0, 0))
    
    # Save to bytes
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    file_bytes = img_byte_arr.getvalue()
    
    print("Image generated, running verify_certificate_link...")
    res = await verify_certificate_link(file_bytes=file_bytes, filename="test_cert_no_qr.png")
    
    import json
    print("\nFINAL RESULT:")
    print(json.dumps(res, indent=2))

if __name__ == "__main__":
    asyncio.run(test_upload_flow_no_qr())
