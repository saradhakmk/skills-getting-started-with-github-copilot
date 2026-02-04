import pytest
from fastapi.testclient import TestClient
from src.app import app, activities

client = TestClient(app)


def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Tennis Club" in data
    assert "participants" in data["Tennis Club"]


def test_signup_for_activity():
    activity = "Art Club"
    email = "newstudent@mergington.edu"
    # Remove if already present
    if email in activities[activity]["participants"]:
        activities[activity]["participants"].remove(email)
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    assert email in activities[activity]["participants"]
    assert response.json()["message"] == f"Signed up {email} for {activity}"


def test_signup_activity_not_found():
    response = client.post("/activities/Nonexistent/signup?email=test@mergington.edu")
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"


def test_duplicate_signup():
    activity = "Chess Club"
    email = "michael@mergington.edu"
    count_before = activities[activity]["participants"].count(email)
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    count_after = activities[activity]["participants"].count(email)
    assert count_after == count_before + 1

