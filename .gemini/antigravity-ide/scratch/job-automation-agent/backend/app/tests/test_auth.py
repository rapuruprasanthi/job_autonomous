def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"

def test_register_login_refresh_logout_flow(client):
    # 1. Register new user
    reg_payload = {
        "email": "candidate@example.com",
        "password": "Password123!",
        "full_name": "Jane Candidate"
    }
    res_reg = client.post("/api/v1/auth/register", json=reg_payload)
    assert res_reg.status_code == 201, res_reg.text
    user_data = res_reg.json()
    assert user_data["email"] == "candidate@example.com"
    assert user_data["full_name"] == "Jane Candidate"

    # 2. Duplicate registration fails
    res_dup = client.post("/api/v1/auth/register", json=reg_payload)
    assert res_dup.status_code == 400

    # 3. Login
    login_payload = {
        "email": "candidate@example.com",
        "password": "Password123!"
    }
    res_login = client.post("/api/v1/auth/login", json=login_payload)
    assert res_login.status_code == 200
    tokens = res_login.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens
    access_token = tokens["access_token"]
    refresh_token = tokens["refresh_token"]

    # 4. Get Current User (/me) with Bearer token
    res_me = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert res_me.status_code == 200
    me_data = res_me.json()
    assert me_data["email"] == "candidate@example.com"

    # 5. Refresh token
    res_refresh = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert res_refresh.status_code == 200
    new_tokens = res_refresh.json()
    assert "access_token" in new_tokens

    # 6. Logout
    res_logout = client.post("/api/v1/auth/logout")
    assert res_logout.status_code == 200
