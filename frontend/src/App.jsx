import React, { useEffect, useMemo, useState } from "react";

const TIMES = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"];

const Icon = ({ name, size = 18 }) => {
  const paths = {
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4M17 3v4M3 10h18" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    pulse: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" /><path d="M9 21v-7h6v7" /></>,
  };
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function initials(name) {
  return name.replace("Dr. ", "").split(" ").map((part) => part[0]).join("").slice(0, 2);
}

export default function App() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("all");
  const [activeNav, setActiveNav] = useState("overview");
  const [form, setForm] = useState({ patient_name: "", doctor_id: "", date: today(), time: "09:00", reason: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function fetchJson(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
    return response.json();
  }

  async function load() {
    try {
      setError("");
      const [doctorData, appointmentData, statsData] = await Promise.all([
        fetchJson("/api/doctors"), fetchJson("/api/appointments"), fetchJson("/api/stats"),
      ]);
      setDoctors(doctorData);
      setAppointments(appointmentData);
      setStats(statsData);
    } catch (err) {
      setError("We could not load clinic data. Please refresh the page.");
      console.error("Unable to load clinic data:", err);
    }
  }

  useEffect(() => { load(); }, []);

  async function book(event) {
    event.preventDefault();
    setMsg("");
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, doctor_id: Number(form.doctor_id) }),
      });
      if (response.status === 201) {
        setMsg("Appointment booked successfully. It is ready for confirmation.");
        setForm({ patient_name: "", doctor_id: "", date: today(), time: "09:00", reason: "" });
        load();
      } else if (response.status === 409) {
        setMsg("That time is already reserved. Please choose another slot.");
      } else {
        setMsg("Booking could not be completed. Please try again.");
      }
    } catch (err) {
      setMsg("Booking failed. Please check your connection and try again.");
      console.error("Unable to book appointment:", err);
    }
  }

  async function cancel(id) {
    try {
      await fetchJson(`/api/appointments/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError("We could not cancel that appointment. Please try again.");
      console.error("Unable to cancel appointment:", err);
    }
  }

  async function confirm(id) {
    try {
      await fetchJson(`/api/appointments/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "confirmed" }),
      });
      load();
    } catch (err) {
      setError("We could not confirm that appointment. Please try again.");
      console.error("Unable to confirm appointment:", err);
    }
  }

  const filteredAppointments = useMemo(
    () => filter === "all" ? appointments : appointments.filter((appointment) => appointment.status === filter),
    [appointments, filter],
  );
  const doctorName = (id) => (doctors.find((doctor) => doctor.id === id) || {}).name || "Care team";
  const availableSlots = Math.max(0, doctors.length * TIMES.length - appointments.length);
  const dateLabel = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date());

  function navigateTo(section) {
    setActiveNav(section);
    if (section === "overview") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const target = document.getElementById(section);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
    target?.focus({ preventScroll: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">H</span><span><b>HeyAppoint</b><small>Clinic workspace</small></span></div>
        <nav aria-label="Primary navigation">
          <button className={`nav-link ${activeNav === "overview" ? "active" : ""}`} onClick={() => navigateTo("overview")}><Icon name="home" /> Overview</button>
          <button className={`nav-link ${activeNav === "appointments" ? "active" : ""}`} onClick={() => navigateTo("appointments")}><Icon name="calendar" /> Appointments <span className="nav-count">{appointments.length}</span></button>
          <button className={`nav-link ${activeNav === "care-team" ? "active" : ""}`} onClick={() => navigateTo("care-team")}><Icon name="users" /> Care team</button>
        </nav>
        <div className="sidebar-card">
          <span className="sidebar-card-icon"><Icon name="pulse" /></span>
          <b>Clinic is online</b>
          <p>All services are healthy and ready to accept bookings.</p>
          <span className="online"><i /> Live status</span>
        </div>
        <div className="profile"><span className="profile-avatar">AD</span><span><b>Admin desk</b><small>Clinic coordinator</small></span><Icon name="more" size={16} /></div>
      </aside>

      <main className="dashboard" id="overview">
        <header className="topbar">
          <div><p className="eyebrow">CLINIC OVERVIEW</p><h1>Good day, team <span>✦</span></h1><p className="subheading">Here is what is happening at HeyAppoint today.</p></div>
          <div className="header-tools"><span className="today"><Icon name="calendar" size={16} /> {dateLabel}</span><button className="new-visit" onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })}><Icon name="plus" size={17} /> New visit</button></div>
        </header>

        <section className="metrics" aria-label="Clinic metrics">
          <article className="metric-card"><span className="metric-icon mint"><Icon name="users" /></span><div><span>Care specialists</span><strong>{stats ? stats.doctors : "—"}</strong><small><i className="up">↑</i> Available today</small></div></article>
          <article className="metric-card"><span className="metric-icon blue"><Icon name="calendar" /></span><div><span>Appointments</span><strong>{stats ? stats.appointments : "—"}</strong><small>Across the clinic</small></div></article>
          <article className="metric-card"><span className="metric-icon violet"><Icon name="check" /></span><div><span>Confirmed visits</span><strong>{appointments.filter((appointment) => appointment.status === "confirmed").length}</strong><small>Ready for care</small></div></article>
          <article className="metric-card"><span className="metric-icon amber"><Icon name="clock" /></span><div><span>Open time slots</span><strong>{stats ? availableSlots : "—"}</strong><small>Across all providers</small></div></article>
        </section>

        {error && <p className="error" role="alert">{error}</p>}

        <section className="workspace">
          <section className="panel booking-panel" id="booking">
            <div className="panel-heading"><div><p className="eyebrow">MAKE A RESERVATION</p><h2>Schedule a visit</h2><p>Reserve a time with the right specialist in a few details.</p></div><span className="heading-icon"><Icon name="calendar" /></span></div>
            <form onSubmit={book}>
              <label>Patient name<input placeholder="e.g. Jordan Williams" value={form.patient_name} onChange={(event) => setForm({ ...form, patient_name: event.target.value })} required /></label>
              <label>Care specialist<select value={form.doctor_id} onChange={(event) => setForm({ ...form, doctor_id: event.target.value })} required><option value="">Select a doctor</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name} · {doctor.specialty}</option>)}</select></label>
              <div className="form-grid"><label>Preferred date<input type="date" min={today()} value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></label><label>Preferred time<select value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })}>{TIMES.map((time) => <option key={time} value={time}>{time}</option>)}</select></label></div>
              <label>Visit reason <span className="optional">Optional</span><input placeholder="Briefly describe the visit" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} /></label>
              <button className="submit-visit" type="submit">Book appointment <Icon name="arrow" size={17} /></button>
            </form>
            {msg && <p className="msg" role="status"><Icon name="check" size={16} /> {msg}</p>}
          </section>

          <aside className="providers-panel" id="care-team" tabIndex="-1">
            <div className="providers-heading"><div><p className="eyebrow">CARE TEAM</p><h2>Today’s specialists</h2></div><span className="team-count">{doctors.length} specialists</span></div>
            <div className="provider-list">{doctors.map((doctor, index) => <article className="provider" key={doctor.id}><span className={`doctor-avatar avatar-${index}`}>{initials(doctor.name)}</span><div><h3>{doctor.name}</h3><p>{doctor.specialty}</p><small><i /> Available · Room {doctor.room}</small></div><button className="arrow-button" aria-label={`Book with ${doctor.name}`} onClick={() => { setForm({ ...form, doctor_id: String(doctor.id) }); document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" }); }}><Icon name="arrow" size={15} /></button></article>)}</div>
            <div className="availability"><div><span className="availability-icon"><Icon name="clock" size={17} /></span><div><b>Same-day availability</b><p>There are {availableSlots} open slots remaining.</p></div></div><span className="availability-badge">Open</span></div>
          </aside>
        </section>

        <section className="panel appointments-panel" id="appointments" tabIndex="-1">
          <div className="appointments-head"><div><p className="eyebrow">SCHEDULE</p><h2>Upcoming appointments</h2><p>{appointments.length ? "Manage visits and keep the care team coordinated." : "Your next appointments will appear here."}</p></div><div className="filter-tabs" aria-label="Appointment filters">{[["all", "All"], ["booked", "Pending"], ["confirmed", "Confirmed"]].map(([value, label]) => <button key={value} className={filter === value ? "selected" : ""} onClick={() => setFilter(value)}>{label}</button>)}</div></div>
          {filteredAppointments.length === 0 ? <div className="empty-state"><span><Icon name="calendar" size={25} /></span><h3>{appointments.length ? "No matching appointments" : "Your schedule is clear"}</h3><p>{appointments.length ? "Try another appointment status." : "Book your first visit using the form above."}</p></div> : <div className="table-wrap"><table><thead><tr><th>Patient</th><th>Specialist</th><th>Appointment</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{filteredAppointments.map((appointment) => <tr key={appointment.id}><td><div className="patient"><span>{initials(appointment.patient_name)}</span><div><b>{appointment.patient_name}</b><small>{appointment.reason || "General consultation"}</small></div></div></td><td><span className="doctor-cell">{doctorName(appointment.doctor_id)}</span></td><td><div className="date-cell"><b>{formatDate(appointment.date)}</b><small><Icon name="clock" size={13} /> {appointment.time.slice(0, 5)}</small></div></td><td><span className={`status ${appointment.status}`}>{appointment.status === "confirmed" ? <Icon name="check" size={13} /> : <Icon name="clock" size={13} />}{appointment.status}</span></td><td><div className="actions">{appointment.status === "booked" && <button className="confirm-button" onClick={() => confirm(appointment.id)}>Confirm</button>}<button className="cancel-button" onClick={() => cancel(appointment.id)}>Cancel</button></div></td></tr>)}</tbody></table></div>}
        </section>
      </main>
    </div>
  );
}
