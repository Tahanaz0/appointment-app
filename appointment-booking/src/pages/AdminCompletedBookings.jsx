import { signOut } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { auth } from "../firebase";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import "./AdminDashboard.css";
import AdminNavbar from "./AdminNavbar";

function AdminCompletedBookings({
  appointments = [],
  deleteAppointment,
  completeAppointment,
}) {
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [bookingTab, setBookingTab] = useState("all");

  const completedBookings = appointments.filter(
    (item) => item.status === "completed",
  );
  const pendingBookings = appointments.filter(
    (item) => item.status !== "completed",
  );

  const displayedAppointments =
    bookingTab === "completed" ? completedBookings : pendingBookings;
  const completedCount = completedBookings.length;
  const pendingCount = pendingBookings.length;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin/login");
    } catch (error) {
      console.error(error);
    }
  };

  const openDeleteConfirmation = (item) => {
    setDeleteConfirmation({ type: "booking", item });
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) {
      return;
    }

    try {
      await deleteAppointment(deleteConfirmation.item.id);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteConfirmation(null);
    }
  };

  const getStatusLabel = (item) => {
    if (item.status === "completed") {
      return item.reviewSubmitted ? "Reviewed" : "Completed";
    }

    return "Booked";
  };

  return (
    <div className="admin-page">
      <AdminNavbar />

      <main className="admin-content">
        <section className="admin-stats">
          <article>
            <span>Total Bookings</span>
            <strong>{appointments.length}</strong>
          </article>

          <article>
            <span>Pending Bookings</span>
            <strong>{pendingCount}</strong>
          </article>

          <article>
            <span>Completed Bookings</span>
            <strong>{completedCount}</strong>
          </article>
        </section>
        <div className="admin-booking-tabs">
          <button
            className={
              bookingTab === "all"
                ? "admin-booking-tab active"
                : "admin-booking-tab"
            }
            onClick={() => setBookingTab("all")}
          >
            Pending Bookings ({pendingCount})
          </button>
          <button
            className={
              bookingTab === "completed"
                ? "admin-booking-tab active"
                : "admin-booking-tab"
            }
            onClick={() => setBookingTab("completed")}
          >
            Completed Bookings ({completedBookings.length})
          </button>
        </div>

        {displayedAppointments.length === 0 ? (
          <div className="admin-empty">
            <h3>No completed bookings yet</h3>
            <p>
              Completed appointments will appear here after you mark them as
              completed.
            </p>
          </div>
        ) : (
          <div className="admin-bookings">
            {displayedAppointments.map((item) => (
              <article className="admin-booking-card" key={item.id}>
                <div className="admin-booking-top">
                  <div className="admin-avatar">
                    {(item.name || "C").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3>{item.name || "Customer"}</h3>
                    <p>{item.userEmail || item.email || "No email"}</p>
                  </div>
                  <span
                    className={`admin-status ${
                      item.status === "completed" ? "completed" : ""
                    }`}
                  >
                    {getStatusLabel(item)}
                  </span>
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
                    <strong>
                      {item.barber || item.doctor || "Not selected"}
                    </strong>
                  </div>
                  <div>
                    <span>Date & Time</span>
                    <strong>
                      {item.date || "No date"}{" "}
                      {item.time ? `at ${item.time}` : ""}
                    </strong>
                  </div>
                </div>

                {item.notes && (
                  <div className="admin-notes">
                    <span>Notes</span>
                    <p>{item.notes}</p>
                  </div>
                )}
                {/* {item.status !== "completed" && (
                  <button
                    className="complete-booking-btn"
                    onClick={() => completeAppointment(item.id)}
                  >
                    Complete
                  </button>
                )} */}
                <div className="admin-actions">
                  {item.status !== "completed" && (
                    <button
                      className="complete-booking-btn"
                      onClick={() => completeAppointment(item.id)}
                    >
                      Complete
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => openDeleteConfirmation(item)}
                  >
                    Delete Booking
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {deleteConfirmation && (
          <DeleteConfirmationModal
            itemType={deleteConfirmation.type}
            itemName={
              deleteConfirmation.item.name || deleteConfirmation.item.id
            }
            onCancel={handleCancelDelete}
            onConfirm={handleConfirmDelete}
          />
        )}
      </main>
    </div>
  );
}

export default AdminCompletedBookings;
