import pytest

def test_profile_and_master_resume(client):
    # Register & Login
    client.post("/api/v1/auth/register", json={"email": "prof@example.com", "password": "Pass123!", "full_name": "Profile Tester"})
    login_res = client.post("/api/v1/auth/login", json={"email": "prof@example.com", "password": "Pass123!"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get & Update Profile
    res = client.get("/api/v1/profile/me", headers=headers)
    assert res.status_code == 200
    
    update_res = client.put("/api/v1/profile/me", json={"experience_years": 5.5, "location": "New York, NY"}, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["experience_years"] == 5.5
    assert update_res.json()["location"] == "New York, NY"

    # Paste Resume
    raw_resume = """
    Jane Doe - Senior Full Stack Engineer
    Email: jane@example.com | Phone: (555) 123-4567 | github.com/janedoe
    Skills: Python, FastAPI, React, TypeScript, SQL, Docker
    Experience:
    Senior Developer at Tech Corp (2021 - Present)
    - Built FastAPI web services and React frontends.
    """
    paste_res = client.post("/api/v1/profile/resume/paste", json={"raw_text": raw_resume}, headers=headers)
    assert paste_res.status_code == 200
    data = paste_res.json()
    assert "structured_json" in data
    assert "Python" in data["structured_json"]["skills"]

def test_preferences_max_3_titles_enforcement(client):
    client.post("/api/v1/auth/register", json={"email": "prefs@example.com", "password": "Pass123!", "full_name": "Prefs Tester"})
    login_res = client.post("/api/v1/auth/login", json={"email": "prefs@example.com", "password": "Pass123!"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Update valid 3 titles
    valid_payload = {
        "target_titles": ["Software Engineer", "Backend Engineer", "Full Stack Developer"],
        "min_salary": 120000,
        "preferred_work_modes": ["Remote", "Hybrid"]
    }
    res_valid = client.put("/api/v1/profile/preferences", json=valid_payload, headers=headers)
    assert res_valid.status_code == 200
    assert len(res_valid.json()["target_titles"]) == 3

    # Attempting 4 titles should fail validation
    invalid_payload = {
        "target_titles": ["Software Engineer", "Backend Engineer", "Full Stack Developer", "DevOps Engineer"]
    }
    res_invalid = client.put("/api/v1/profile/preferences", json=invalid_payload, headers=headers)
    assert res_invalid.status_code == 422  # Unprocessable Entity (validation error)

def test_portals_credential_encryption(client):
    client.post("/api/v1/auth/register", json={"email": "portals@example.com", "password": "Pass123!", "full_name": "Portal Tester"})
    login_res = client.post("/api/v1/auth/login", json={"email": "portals@example.com", "password": "Pass123!"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    portals_res = client.get("/api/v1/portals", headers=headers)
    assert portals_res.status_code == 200
    portals = portals_res.json()
    assert len(portals) >= 10

    # Save credential for portal #1
    p1 = portals[0]
    cred_res = client.post(
        f"/api/v1/portals/{p1['id']}/credential",
        json={"username": "user@linkedin.com", "password": "SecretPassword123"},
        headers=headers
    )
    assert cred_res.status_code == 200
    cred_data = cred_res.json()
    assert cred_data["has_credential"] is True
    assert "SecretPassword123" not in str(cred_data)  # Never returned in plain text
    assert cred_data["credential_username_masked"] is not None
