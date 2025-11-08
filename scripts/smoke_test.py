import asyncio
import sys

import httpx


async def test_health(base_url: str) -> bool:
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{base_url}/health")
        assert response.status_code == 200
        data = response.json()
        assert data == {"status": "ok"}
        print("✓ Health check passed")
        return True


async def test_action_open_file_explorer(base_url: str) -> bool:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{base_url}/action",
            json={"action": "open_file_explorer"},
        )
        assert response.status_code == 200
        html = response.text
        assert "<div" in html
        assert "560px" in html or "320px" in html
        print("✓ Open file explorer action passed")
        return True


async def test_action_unknown(base_url: str) -> bool:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{base_url}/action",
            json={"action": "unknown_action"},
        )
        assert response.status_code == 200
        html = response.text
        assert len(html) > 0
        print("✓ Unknown action handled")
        return True


async def main():
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
    print(f"Running smoke tests against {base_url}")

    try:
        await test_health(base_url)
        await test_action_open_file_explorer(base_url)
        await test_action_unknown(base_url)
        print("\n✅ All smoke tests passed!")
        return 0
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))

