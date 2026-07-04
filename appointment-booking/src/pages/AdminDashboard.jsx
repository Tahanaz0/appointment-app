import { signOut } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, serverTimestamp, setDoc, addDoc, collection, deleteDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import "./AdminDashboard.css";

function AdminDashboard({
  appointments = [],
  deleteAppointment,
  barbers = [],
  completeAppointment,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [barberForm, setBarberForm] = useState({
    name: "",
    specialty: "",
    location: "Main Branch",
    workingHours: "",
    available: true,
    avatar: "",
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [bookingTab, setBookingTab] = useState("all");
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryForm, setGalleryForm] = useState({ title: "", category: "", src: "" });
  const [galleryPreview, setGalleryPreview] = useState("");
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const specialtyOptions = [
    "Senior Barber",
    "Hair Stylist",
    "Beard Specialist",
    "Master Barber",
    "Hair & Beard Care",
    "Grooming Expert",
  ];

  const locationOptions = ["Main Branch", "Premium Lounge", "VIP Room"];

  const workingHoursOptions = [
    "9:00 AM - 6:00 PM",
    "10:00 AM - 8:00 PM",
    "11:00 AM - 7:00 PM",
    "12:00 PM - 9:00 PM",
    "1:00 PM - 9:00 PM",
  ];
  const today = new Date().toISOString().slice(0, 10);
  const todayBookings = appointments.filter((item) => item.date === today).length;
  const completedBookings = appointments.filter((item) => item.status === "completed");
  const activeBookings = appointments.filter((item) => item.status !== "completed");
  const displayedAppointments = bookingTab === "completed" ? completedBookings : activeBookings;
  const availableBarbers = barbers.filter((barber) => barber.available).length;
  const customers = new Set(
    appointments.map((item) => item.userEmail || item.email).filter(Boolean)
  ).size;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "galleryItems"), (snapshot) => {
      const items = snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }));
      setGalleryItems(items);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin/login");
    } catch (error) {
      console.error(error);
    }
  };

  const openNewBarber = () => {
    setEditingBarber(null);
    setBarberForm({
      name: "",
      specialty: "",
      location: "Main Branch",
      workingHours: workingHoursOptions[0],
      available: true,
      avatar: "",
    });
    setIsModalOpen(true);
  };

  const openEditBarber = (barber) => {
    setEditingBarber(barber);
    setBarberForm({
      name: barber.name || "",
      specialty: barber.specialty || "",
      location: barber.location || "Main Branch",
      workingHours: barber.workingHours || workingHoursOptions[0],
      available: barber.available ?? true,
      avatar: barber.avatar || "",
    });
    setIsModalOpen(true);
  };

  const handleBarberFormChange = (field, value) => {
    setBarberForm((s) => ({ ...s, [field]: value }));
  };

  const handleSaveBarber = async (e) => {
    e.preventDefault();
    try {
      if (editingBarber && editingBarber.id) {
        await setDoc(
          doc(db, "barbers", String(editingBarber.id)),
          {
            ...barberForm,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } else {
        await addDoc(collection(db, "barbers"), {
          ...barberForm,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const openDeleteConfirmation = (type, item) => {
    setDeleteConfirmation({ type, item });
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) {
      return;
    }

    try {
      if (deleteConfirmation.type === "booking") {
        await deleteAppointment(deleteConfirmation.item.id);
      } else if (deleteConfirmation.type === "barber") {
        await deleteDoc(doc(db, "barbers", String(deleteConfirmation.item.id)));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteConfirmation(null);
    }
  };

  const openNewGalleryItem = () => {
    setEditingGalleryItem(null);
    setGalleryForm({ title: "", category: "", src: "" });
    setGalleryPreview("");
    setIsGalleryModalOpen(true);
  };

  const openEditGalleryItem = (item) => {
    setEditingGalleryItem(item);
    setGalleryForm({
      title: item.title || "",
      category: item.category || "",
      src: item.src || "",
    });
    setGalleryPreview(item.src || "");
    setIsGalleryModalOpen(true);
  };

  const handleGalleryFormChange = (field, value) => {
    setGalleryForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGalleryImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result;
      setGalleryPreview(imageData);
      setGalleryForm((prev) => ({ ...prev, src: imageData }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveGalleryItem = async (e) => {
    e.preventDefault();
    try {
      if (editingGalleryItem && editingGalleryItem.id) {
        await setDoc(
          doc(db, "galleryItems", editingGalleryItem.id),
          {
            ...galleryForm,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } else {
        await addDoc(collection(db, "galleryItems"), {
          ...galleryForm,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setIsGalleryModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteGalleryItem = async (item) => {
    try {
      await deleteDoc(doc(db, "galleryItems", item.id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAvailabilityChange = async (barber, available) => {
    try {
      await setDoc(
        doc(db, "barbers", String(barber.id)),
        {
          available,
          name: barber.name,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteBarber = (barber) => {
    openDeleteConfirmation("barber", barber);
  };

  const handleComplete = async (appointment) => {
    try {
      await completeAppointment(appointment.id);
    } catch (error) {
      console.error(error);
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
      <header className="admin-header">
        <div className="header-left">
          <span className="admin-eyebrow">Admin Panel</span>
          <h1>GentleCuts Dashboard</h1>
          <p className="header-time">Manage bookings, barbers, gallery and chat</p>
        </div>

        <div className="admin-bottom-nav">
          <button
            type="button"
            className={`admin-nav-btn ${location.pathname === "/admin/dashboard" ? "active" : ""}`}
            onClick={() => navigate("/admin/dashboard")}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`admin-nav-btn ${location.pathname === "/admin/completed-bookings" ? "active" : ""}`}
            onClick={() => navigate("/admin/completed-bookings")}
          >
            Completed
          </button>
          <button
            type="button"
            className={`admin-nav-btn ${location.pathname === "/admin/chat" ? "active" : ""}`}
            onClick={() => navigate("/admin/chat")}
          >
            Chat
          </button>
          <button
            type="button"
            className={`admin-nav-btn ${location.pathname === "/admin/profile" ? "active" : ""}`}
            onClick={() => navigate("/admin/profile")}
          >
            Profile
          </button>
        </div>

        <button type="button" className="logout-btn" onClick={handleLogout}>
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
          <article>
            <span>Available Barbers</span>
            <strong>
              {availableBarbers}/{barbers.length}
            </strong>
          </article>
        </section>

        {/* <div className="admin-booking-tabs">
          <button
            type="button"
            className={bookingTab === "all" ? "admin-booking-tab active" : "admin-booking-tab"}
            onClick={() => setBookingTab("all")}
          >
            All Bookings
          </button>
          <button
            type="button"
            className={bookingTab === "completed" ? "admin-booking-tab active" : "admin-booking-tab"}
            onClick={() => setBookingTab("completed")}
          >
            Completed Bookings ({completedBookings.length})
          </button>
        </div> */}
        {isModalOpen && (
          <div className="admin-modal-backdrop">
            <form className="admin-modal" onSubmit={handleSaveBarber}>
              <div className="admin-modal-header">
                <h3>{editingBarber ? "Edit Barber" : "Add Barber"}</h3>
              </div>

              <label>
                Name
                <input
                  value={barberForm.name}
                  onChange={(e) => handleBarberFormChange("name", e.target.value)}
                  required
                />
              </label>

              <label>
                Specialty
                <select
                  value={barberForm.specialty}
                  onChange={(e) => handleBarberFormChange("specialty", e.target.value)}
                  required
                >
                  <option value="">Select speciality</option>
                  {specialtyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Location
                <select
                  value={barberForm.location}
                  onChange={(e) => handleBarberFormChange("location", e.target.value)}
                >
                  {locationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Working hours
                <select
                  value={barberForm.workingHours}
                  onChange={(e) => handleBarberFormChange("workingHours", e.target.value)}
                >
                  <option value="">Select hours</option>
                  {workingHoursOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Avatar (single char)
                <input
                  value={barberForm.avatar}
                  onChange={(e) => handleBarberFormChange("avatar", e.target.value)}
                  maxLength={2}
                />
              </label>

              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={!!barberForm.available}
                  onChange={(e) => handleBarberFormChange("available", e.target.checked)}
                />
                Available
              </label>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        )}

        {isGalleryModalOpen && (
          <div className="admin-modal-backdrop">
            <form className="admin-modal" onSubmit={handleSaveGalleryItem}>
              <div className="admin-modal-header">
                <h3>{editingGalleryItem ? "Edit Gallery Item" : "Add Gallery Item"}</h3>
              </div>

              <label>
                Title
                <input
                  value={galleryForm.title}
                  onChange={(e) => handleGalleryFormChange("title", e.target.value)}
                  required
                />
              </label>

              <label>
                Category
                <input
                  value={galleryForm.category}
                  onChange={(e) => handleGalleryFormChange("category", e.target.value)}
                  required
                />
              </label>

              <label>
                Image File
                <input type="file" accept="image/*" onChange={handleGalleryImageSelect} />
              </label>

              {galleryPreview && (
                <div className="admin-gallery-preview">
                  <img src={galleryPreview} alt="Selected gallery preview" />
                </div>
              )}

              <div className="admin-modal-actions">
                <button type="button" onClick={() => setIsGalleryModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        )}

        {deleteConfirmation && (
          <DeleteConfirmationModal
            itemType={deleteConfirmation.type}
            itemName={deleteConfirmation.item.name}
            onCancel={handleCancelDelete}
            onConfirm={handleConfirmDelete}
          />
        )}

        <section className="admin-panel">
          <div className="admin-section-header">
            <div>
              <span className="admin-eyebrow">Barbers</span>
              <h2>Availability Control</h2>
            </div>
            <div className="admin-section-actions">
              <span className="admin-count">{availableBarbers} Available</span>
              <button type="button" className="admin-add-barber-btn" onClick={openNewBarber}>
                <span className="admin-add-icon">+</span>
                Add Barber
              </button>
            </div>
          </div>

          <div className="admin-barbers">
            {barbers.map((barber) => (
              <article className="admin-barber-card" key={barber.id}>
                <div className="admin-barber-profile">
                  <div className="admin-avatar">{barber.avatar}</div>
                  <div>
                    <h3>{barber.name}</h3>
                    <p>{barber.specialty}</p>
                    {barber.workingHours && (
                      <p className="admin-barber-hours">{barber.workingHours}</p>
                    )}
                  </div>
                </div>

                <span
                  className={
                    barber.available
                      ? "admin-barber-status available"
                      : "admin-barber-status unavailable"
                  }
                >
                  {barber.available ? "Available" : "Unavailable"}
                </span>

                <label className="admin-switch">
                  <input
                    type="checkbox"
                    checked={barber.available}
                    onChange={(event) =>
                      handleAvailabilityChange(barber, event.target.checked)
                    }
                  />
                  <span></span>
                </label>
                <div className="admin-card-actions">
                  <button type="button" className="admin-edit-barber-btn" onClick={() => openEditBarber(barber)}>
                    Edit
                  </button>
                  <button type="button" className="admin-delete-barber-btn" onClick={() => handleDeleteBarber(barber)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-section-header">
            <div>
              <span className="admin-eyebrow">Gallery</span>
              <h2>Homepage Gallery</h2>
            </div>
            <div className="admin-section-actions">
              <button type="button" className="admin-add-barber-btn" onClick={openNewGalleryItem}>
                <span className="admin-add-icon">+</span>
                Add Image
              </button>
            </div>
          </div>

          <div className="admin-gallery-grid">
            {galleryItems.map((item) => (
              <article className="admin-gallery-card" key={item.id}>
                <img src={item.src} alt={item.title} />
                <div className="admin-gallery-info">
                  <h3>{item.title}</h3>
                  <p>{item.category}</p>
                </div>
                <div className="admin-card-actions">
                  <button type="button" className="admin-edit-barber-btn" onClick={() => openEditGalleryItem(item)}>
                    Edit
                  </button>
                  <button type="button" className="admin-delete-barber-btn" onClick={() => handleDeleteGalleryItem(item)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-section-header">
            <div>
              <span className="admin-eyebrow">Bookings</span>
              <h2>All Appointments</h2>
            </div>
            <span className="admin-count">{appointments.length} Total</span>
          </div>

          {displayedAppointments.length === 0 ? (
            <div className="admin-empty">
              <h3>No bookings found</h3>
              <p>
                {bookingTab === "completed"
                  ? "No completed bookings yet."
                  : "Customer appointments will appear here once they are booked."}
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
                    <span className={`admin-status ${item.status === "completed" ? "completed" : ""}`}>
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
                    {item.status !== "completed" && (
                      <button
                        type="button"
                        className="complete-booking-btn"
                        onClick={() => handleComplete(item)}
                      >
                        Complete
                      </button>
                    )}
                    <button type="button" onClick={() => openDeleteConfirmation("booking", item)}>
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
