import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "./AdminDashboard.css";

function AdminDashboard({ appointments = [], deleteAppointment }) {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const todayBookings = appointments.filter((item) => item.date === today).length;
  const customers = new Set(
    appointments.map((item) => item.userEmail || item.email).filter(Boolean)
  ).size;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin/login");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (appointmentId) => {
    const shouldDelete = window.confirm("Delete this booking?");

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteAppointment(appointmentId);
    } catch (error) {
      console.error(error);
      alert("Booking delete nahi ho saki");
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">Admin Panel</span>
          <h1>GentleCuts Dashboard</h1>
        </div>

        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="admin-content">
        <section className="admin-stats">
          <article>
            <span>Total Bookings</span>
            <strong>{appointments.length}</strong>
          </article>
          <article>
            <span>Today</span>
            <strong>{todayBookings}</strong>
          </article>
          <article>
            <span>Customers</span>
            <strong>{customers}</strong>
          </article>
        </section>

        <section className="admin-panel">
          <div className="admin-section-header">
            <div>
              <span className="admin-eyebrow">Bookings</span>
              <h2>All Appointments</h2>
            </div>
            <span className="admin-count">{appointments.length} Total</span>
          </div>

          {appointments.length === 0 ? (
            <div className="admin-empty">
              <h3>No bookings yet</h3>
              <p>Customer appointments yahan show hongi.</p>
            </div>
          ) : (
            <div className="admin-bookings">
              {appointments.map((item) => (
                <article className="admin-booking-card" key={item.id}>
                  <div className="admin-booking-top">
                    <div className="admin-avatar">
                      {(item.name || "C").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3>{item.name || "Customer"}</h3>
                      <p>{item.userEmail || item.email || "No email"}</p>
                    </div>
                    <span className="admin-status">Booked</span>
                  </div>

                  <div className="admin-booking-grid">
                    <div>
                      <span>Phone</span>
                      <strong>{item.phone || "N/A"}</strong>
                    </div>
                    <div>
                      <span>Service</span>
                      <strong>{item.service || "N/A"}</strong>
                    </div>
                    <div>
                      <span>Barber</span>
                      <strong>{item.barber || item.doctor || "Not selected"}</strong>
                    </div>
                    <div>
                      <span>Date & Time</span>
                      <strong>
                        {item.date || "No date"} {item.time ? `at ${item.time}` : ""}
                      </strong>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="admin-notes">
                      <span>Notes</span>
                      <p>{item.notes}</p>
                    </div>
                  )}

                  <div className="admin-actions">
                    <button type="button" onClick={() => handleDelete(item.id)}>
                      Delete Booking
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
