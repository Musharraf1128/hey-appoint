import os

os.environ["DATABASE_URL"] = "sqlite:///./test.db"

from fastapi.testclient import TestClient

from app import models
from app.db import Base, SessionLocal, engine
from app.main import app

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()
db.add_all(
    [
        models.Doctor(id=1, name="Dr. Ayesha Khan", specialty="General Physician", room="101"),
        models.Doctor(id=2, name="Dr. Bilal Ahmed", specialty="Dentist", room="102"),
        models.Doctor(id=3, name="Dr. Sara Malik", specialty="Pediatrician", room="103"),
    ]
)
db.commit()
db.close()

client = TestClient(app)


def test_health():
    assert client.get("/health").json() == {"status": "UP"}


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["service"] == "HeyAppoint Clinic API"


def test_list_doctors():
    response = client.get("/api/doctors")
    assert response.status_code == 200
    assert len(response.json()) == 3


def test_book_appointment():
    response = client.post(
        "/api/appointments",
        json={
            "patient_name": "Test Patient",
            "doctor_id": 1,
            "date": "2026-10-20",
            "time": "10:00:00",
            "reason": "Checkup",
        },
    )
    assert response.status_code == 201
    assert response.json()["status"] == "booked"


def test_double_booking_rejected():
    payload = {
        "patient_name": "Second Patient",
        "doctor_id": 2,
        "date": "2026-10-20",
        "time": "11:00:00",
        "reason": "Cleaning",
    }
    assert client.post("/api/appointments", json=payload).status_code == 201
    assert client.post("/api/appointments", json=payload).status_code == 409


def test_stats():
    response = client.get("/api/stats")
    assert response.status_code == 200
    assert response.json()["doctors"] == 3
