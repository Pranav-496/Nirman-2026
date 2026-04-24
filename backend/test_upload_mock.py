import asyncio
import io
from PIL import Image, ImageDraw, ImageFont
import qrcode
from services.link_verifier import verify_certificate_link

async def test_upload_flow():
    # Create a mock Coursera certificate image
    img = Image.new('RGB', (800, 600), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    
    # Add text
    text = "Python for Everybody\nCompleted by Pranav Landge\nFebruary 3, 2026\nVerify at coursera.org/verify/ZWXC1L0BQYCK"
    d.text((50, 50), text, fill=(0, 0, 0))
    
    # Add QR code
    qr = qrcode.QRCode(version=1, box_size=5, border=2)
    qr.add_data('https://www.coursera.org/account/accomplishments/specialization/ZWXC1L0BQYCK')
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white").convert('RGB')
    
    img.paste(qr_img, (50, 300))
    
    # Save to bytes
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    file_bytes = img_byte_arr.getvalue()
    
    print("Image generated, running verify_certificate_link...")
    res = await verify_certificate_link(file_bytes=file_bytes, filename="test_cert.png")
    
    import json
    print("\nFINAL RESULT:")
    print(json.dumps(res, indent=2))

if __name__ == "__main__":
    asyncio.run(test_upload_flow())
