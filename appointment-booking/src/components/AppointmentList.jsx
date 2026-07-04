function AppointmentList({ appointments, onDelete }) {
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const getStatusLabel = (item) => {
    if (item.status === "completed") {
      return item.reviewSubmitted ? "Reviewed" : "Review Pending";
    }

    return "Booked";
  };

  const handleDelete = async (appointmentId) => {
    setPendingDeleteId(appointmentId);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) {
      return;
    }

    try {
      await onDelete(pendingDeleteId);
    } catch (error) {
      console.error(error);
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <div className="list">
      {pendingDeleteId && (
        <div className="delete-confirmation-modal">
          <div className="delete-confirmation-card">
            <h3>Delete booking?</h3>
            <p>This action cannot be undone.</p>
            <div className="delete-actions">
              <button type="button" className="cancel-delete-btn" onClick={() => setPendingDeleteId(null)}>
                Cancel
              </button>
              <button type="button" className="confirm-delete-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="booking-list-header">
        <div>
          <span className="booking-eyebrow">Appointments</span>
          <h2>Your Bookings</h2>
        </div>
        <span className="booking-count">{appointments.length} Total</span>
      </div>

      {appointments.length === 0 ? (
        <div className="empty-bookings">
          <h3>No bookings yet</h3>
          <p>New customer appointments will appear here.</p>
        </div>
      ) : (
        <div className="booking-cards">
          {appointments.map((item) => (
            <article key={item.id} className="booking-card">
              <div className="booking-card-top">
                <div className="customer-avatar">
                  {(item.name || "C").charAt(0).toUpperCase()}
                </div>
                <div className="customer-main">
                  <h3>{item.name}</h3>
                  <p>{item.email}</p>
                </div>
                <span className={`booking-status ${item.status === "completed" ? "completed" : ""}`}>
                  {getStatusLabel(item)}
                </span>
              </div>

              <div className="booking-details-grid">
                <div className="booking-detail">
                  <span>Phone</span>
                  <strong>{item.phone}</strong>
                </div>
                <div className="booking-detail">
                  <span>Service</span>
                  <strong>{item.service}</strong>
                </div>
                <div className="booking-detail">
                  <span>Barber</span>
                  <strong>{item.barber || item.doctor || "Not selected"}</strong>
                </div>
                <div className="booking-detail">
                  <span>Date & Time</span>
                  <strong>{item.date} at {item.time}</strong>
                </div>
              </div>

              {item.notes && (
                <div className="booking-notes">
                  <span>Notes</span>
                  <p>{item.notes}</p>
                </div>
              )}

              <div className="booking-card-actions">
                <button
                  className="delete-booking-btn"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete Booking
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default AppointmentList;
