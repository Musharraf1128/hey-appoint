import React, { useEffect, useState } from "react";

const TIMES = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ patient_name: "", doctor_id: "", date: today(), time: "09:00", reason: "" });
  const [msg, setMsg] = useState("");

  async function load() {
    setDoctors(await (await fetch("/api/doctors")).json());
    setAppointments(await (await fetch("/api/appointments")).json());
    setStats(await (await fetch("/api/stats")).json());
  }

  useEffect(() => {
    load();
  }, []);

  async function book(e) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, doctor_id: Number(form.doctor_id) }),
    });
    if (res.status === 201) {
      setMsg("Booked!");
      setForm({ patient_name: "", doctor_id: "", date: today(), time: "09:00", reason: "" });
      load();
    } else if (res.status === 409) {
      setMsg("That slot is already booked.");
    } else {
      setMsg("Booking failed.");
    }
  }

  async function cancel(id) {
    await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    load();
  }

  async function confirm(id) {
    await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "confirmed" }),
    });
    load();
  }

  const doctorName = (id) => (doctors.find((d) => d.id === id) || {}).name || "...";

  return (
    <div className="page">
      <header className="hero">
        <div>
          <h1>HeyAppoint Clinic</h1>
          <p>Book a doctor visit in under a minute.</p>
        </div>
        <div className="hero-stats">
          <div><b>{stats ? stats.doctors : "-"}</b><span>doctors</span></div>
          <div><b>{stats ? stats.booked : "-"}</b><span>booked visits</span></div>
          <div><b>{stats ? stats.appointments : "-"}</b><span>total visits</span></div>
        </div>
      </header>

      <main className="cols">
        <section className="card">
          <h2>Book a visit</h2>
          <form onSubmit={book}>
            <input placeholder="Patient name" value={form.patient_name}
              onChange={(e) => setForm({ ...form, patient_name: e.target.value })} required />
            <select value={form.doctor_id}
              onChange={(e) => setForm({ ...form, doctor_id: e.target.value })} required>
              <option value="">Choose doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>
              ))}
            </select>
            <div className="row">
              <input type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              <select value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}>
                {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <input placeholder="Reason (optional)" value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            <button type="submit">Book appointment</button>
          </form>
          {msg && <p className="msg">{msg}</p>}
        </section>

        <section className="card">
          <h2>Our doctors</h2>
          <ul className="docs">
            {doctors.map((d) => (
              <li key={d.id}>
                <b>{d.name}</b>
                <span>{d.specialty} · Room {d.room}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <section className="card wide">
        <h2>Upcoming visits</h2>
        {appointments.length === 0 && <p className="empty">No visits yet — book the first one above.</p>}
        <table>
          <thead>
            <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td>{a.patient_name}</td>
                <td>{doctorName(a.doctor_id)}</td>
                <td>{a.date}</td>
                <td>{a.time.slice(0, 5)}</td>
                <td><span className={"pill " + a.status}>{a.status}</span></td>
                <td className="actions">
                  {a.status === "booked" && <button onClick={() => confirm(a.id)}>Confirm</button>}
                  <button className="danger" onClick={() => cancel(a.id)}>Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
