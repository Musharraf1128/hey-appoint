from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import models
from app.db import Base, SessionLocal, engine, get_db
from app.schemas import AppointmentIn, AppointmentOut, AppointmentUpdate, DoctorOut

app = FastAPI(title="HeyAppoint Clinic API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app)

SEED_DOCTORS = [
    {"name": "Dr. Ayesha Khan", "specialty": "General Physician", "room": "101"},
    {"name": "Dr. Bilal Ahmed", "specialty": "Dentist", "room": "102"},
    {"name": "Dr. Sara Malik", "specialty": "Pediatrician", "room": "103"},
]


@app.on_event("startup")
def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(models.Doctor).count() == 0:
            for doc in SEED_DOCTORS:
                db.add(models.Doctor(**doc))
            db.commit()
    finally:
        db.close()


@app.get("/")
def root():
    return {"service": "HeyAppoint Clinic API"}


@app.get("/health")
def health():
    return {"status": "UP"}


@app.get("/ready")
def ready():
    db = SessionLocal()
    try:
        db.query(models.Doctor).count()
        return {"ready": True}
    finally:
        db.close()


@app.get("/api/doctors", response_model=list[DoctorOut])
def list_doctors(db: Session = Depends(get_db)):
    return db.query(models.Doctor).all()


@app.get("/api/appointments", response_model=list[AppointmentOut])
def list_appointments(db: Session = Depends(get_db)):
    return db.query(models.Appointment).order_by(models.Appointment.date, models.Appointment.time).all()


@app.post("/api/appointments", response_model=AppointmentOut, status_code=201)
def book_appointment(payload: AppointmentIn, db: Session = Depends(get_db)):
    if db.query(models.Doctor).filter(models.Doctor.id == payload.doctor_id).first() is None:
        raise HTTPException(status_code=404, detail="Doctor not found")
    item = models.Appointment(**payload.model_dump())
    db.add(item)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Slot already booked")
    db.refresh(item)
    return item


@app.put("/api/appointments/{item_id}", response_model=AppointmentOut)
def update_appointment(item_id: int, payload: AppointmentUpdate, db: Session = Depends(get_db)):
    item = db.query(models.Appointment).filter(models.Appointment.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    item.status = payload.status
    db.commit()
    db.refresh(item)
    return item


@app.delete("/api/appointments/{item_id}")
def cancel_appointment(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Appointment).filter(models.Appointment.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db.delete(item)
    db.commit()
    return {"cancelled": item_id}


@app.get("/api/stats")
def stats(db: Session = Depends(get_db)):
    total = db.query(models.Appointment).count()
    booked = db.query(models.Appointment).filter(models.Appointment.status == "booked").count()
    doctors = db.query(models.Doctor).count()
    return {"appointments": total, "booked": booked, "doctors": doctors}
