import httpx
import asyncio

async def test_manual_verify():
    url = "http://localhost:8000/verify/certificate/manual"
    payload = {
        "url": "https://www.coursera.org/account/accomplishments/specialization/ZWXC1L0BQYCK",
        "name": "Pranav Landge"
    }
    
    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            print("Sending request to verify...")
            response = await client.post(url, json=payload)
            print(f"Status Code: {response.status_code}")
            print("Response JSON:")
            print(response.json())
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_manual_verify())
