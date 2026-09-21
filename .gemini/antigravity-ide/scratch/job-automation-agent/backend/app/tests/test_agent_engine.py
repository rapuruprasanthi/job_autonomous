import pytest
from app.services.resume_builder import validate_claims_against_master_resume

def test_fact_safety_guard_validation():
    master_resume = {
        "experience": [{"company": "Tech Corp", "title": "Developer"}],
        "education": [{"degree": "B.S. Computer Science"}]
    }

    # Safe claim
    safe_data = {
        "experience": [{"company": "Tech Corp", "title": "Developer"}],
        "education": [{"degree": "B.S. Computer Science"}]
    }
    is_safe, violations = validate_claims_against_master_resume(safe_data, master_resume)
    assert is_safe is True
    assert len(violations) == 0

    # Invented employer claim
    fake_data = {
        "experience": [{"company": "Fake Google", "title": "Developer"}],
        "education": [{"degree": "B.S. Computer Science"}]
    }
    is_safe_fake, violations_fake = validate_claims_against_master_resume(fake_data, master_resume)
    assert is_safe_fake is False
    assert any("Fake Google" in v for v in violations_fake)

def test_full_agent_orchestrator_pipeline_and_approval_flow(client):
    # Register candidate user
    client.post("/api/v1/auth/register", json={"email": "orchestrator@example.com", "password": "Pass123!", "full_name": "Pipeline Tester"})
    login_res = client.post("/api/v1/auth/login", json={"email": "orchestrator@example.com", "password": "Pass123!"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Trigger Run Now pipeline
    run_res = client.post("/api/v1/orchestrator/run-now", headers=headers)
    assert run_res.status_code == 200
    results = run_res.json()["results"]
    assert results["jobs_discovered"] > 0
    assert results["relevant_jobs"] > 0

    # Check jobs endpoint
    jobs_res = client.get("/api/v1/jobs?is_relevant=true", headers=headers)
    assert jobs_res.status_code == 200
    jobs = jobs_res.json()
    assert len(jobs) > 0

    # Check Approvals Queue
    apps_res = client.get("/api/v1/approvals", headers=headers)
    assert apps_res.status_code == 200
    queued = apps_res.json()
    assert len(queued) > 0
    item = queued[0]

    # Approve item in queue
    approve_res = client.post(
        f"/api/v1/approvals/{item['id']}/action",
        json={"action": "approve"},
        headers=headers
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPLIED"

    # Verify Knowledge Base learned from confirmed answers
    kb_res = client.get("/api/v1/knowledge", headers=headers)
    assert kb_res.status_code == 200
    assert len(kb_res.json()) > 0
