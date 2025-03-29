import pytest


@pytest.mark.asyncio
async def test_admin_endpoint(async_client, fake_admin_token):

    headers = {"Authorization": f"Bearer {fake_admin_token}"}
    response = await async_client.get("/admins/", headers=headers)

    assert response.status_code == 200, "دسترسی به endpoint محافظت‌شده باید موفقیت‌آمیز باشد"


if __name__ == "__main__":
    test_admin_endpoint()
