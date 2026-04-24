import asyncio
import logging

logging.basicConfig(level=logging.INFO)

from services.link_verifier import verify_certificate_link

async def main():
    print("Running verify_certificate_link...")
    res = await verify_certificate_link(
        manual_url="https://www.coursera.org/account/accomplishments/specialization/ZWXC1L0BQYCK",
        manual_name="Pranav Landge"
    )
    import json
    print("\nFINAL RESULT:")
    print(json.dumps(res, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
