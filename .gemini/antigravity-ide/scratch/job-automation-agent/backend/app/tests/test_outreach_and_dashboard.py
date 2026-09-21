def test_outreach_and_learning_flow(client):
    # Register & Login
    client.post("/api/v1/auth/register", json={"email": "outreach@example.com", "password": "Pass123!", "full_name": "Outreach Tester"})
    login_res = client.post("/api/v1/auth/login", json={"email": "outreach@example.com", "password": "Pass123!"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Discover contacts
    disc_res = client.post("/api/v1/outreach/discover/Stripe", headers=headers)
    assert disc_res.status_code == 200
    contacts = disc_res.json()
    assert len(contacts) > 0

    # Draft cold email
    c1 = contacts[0]
    draft_res = client.post("/api/v1/outreach/emails/draft", json={"contact_id": c1["id"]}, headers=headers)
    assert draft_res.status_code == 200
    email_data = draft_res.json()
    assert email_data["contact_id"] == c1["id"]

    # Simulate reply & classifier
    sim_res = client.post(f"/api/v1/outreach/emails/{email_data['id']}/simulate-reply", headers=headers)
    assert sim_res.status_code == 200

    # Insights
    insights_res = client.get("/api/v1/outreach/insights", headers=headers)
    assert insights_res.status_code == 200
    insights = insights_res.json()
    assert "overall_reply_rate" in insights
    assert "prompt_hint" in insights

def test_dashboard_stats_and_activity_csv(client):
    client.post("/api/v1/auth/register", json={"email": "dash@example.com", "password": "Pass123!", "full_name": "Dash Tester"})
    login_res = client.post("/api/v1/auth/login", json={"email": "dash@example.com", "password": "Pass123!"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Dashboard Stats
    stats_res = client.get("/api/v1/dashboard/stats", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "funnel" in stats
    assert "portal_breakdown" in stats

    # Activity Timeline
    act_res = client.get("/api/v1/activity", headers=headers)
    assert act_res.status_code == 200

    # CSV Export
    csv_res = client.get("/api/v1/activity/export/csv", headers=headers)
    assert csv_res.status_code == 200
    assert csv_res.headers["content-type"] == "text/csv; charset=utf-8"
