from sqlalchemy import Column, Date, ForeignKey, Integer, String, Time, UniqueConstraint

from app.db import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    specialty = Column(String(100), nullable=False)
    room = Column(String(20), nullable=False, default="101")


class Appointment(Base):
    __tablename__ = "appointments"
    __table_args__ = (
        UniqueConstraint("doctor_id", "date", "time", name="uix_doctor_slot"),
    )

    id = Column(Integer, primary_key=True)
    patient_name = Column(String(100), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)
    reason = Column(String(200), nullable=False, default="")
    status = Column(String(20), nullable=False, default="booked")
