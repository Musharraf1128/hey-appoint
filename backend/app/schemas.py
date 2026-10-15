from datetime import date, time

from pydantic import BaseModel


class DoctorOut(BaseModel):
    id: int
    name: str
    specialty: str
    room: str

    class Config:
        from_attributes = True


class AppointmentIn(BaseModel):
    patient_name: str
    doctor_id: int
    date: date
    time: time
    reason: str = ""


class AppointmentUpdate(BaseModel):
    status: str


class AppointmentOut(AppointmentIn):
    id: int
    status: str

    class Config:
        from_attributes = True
