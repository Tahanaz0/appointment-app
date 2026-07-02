import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppointmentForm from "../components/AppointmentForm";
import defaultBarbers from "../components/data/barbers";
import "./SpecialistPage.css";

function SpecialistPage({ addAppointment, barbers = defaultBarbers }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showBookingForm, setShowBookingForm] = useState(false);

  const specialist = barbers.find((item) => item.id === Number(id));

  if (!specialist) {
    return (
      <div className="specialist-page">
        <button className="specialist-back-btn" onClick={() => navigate("/home")}>
          Back
        </button>
        <p>Specialist not found.</p>
      </div>
    );
  }

  if (showBookingForm) {
    return (
      <div className="specialist-page">
        <AppointmentForm
          addAppointment={addAppointment}
          selectedDoctor={specialist}
          barbers={barbers}
          onBack={() => setShowBookingForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="specialist-page">
      <main className="specialist-content">
        <button className="specialist-back-btn" onClick={() => navigate("/home")}>
          Back
        </button>

        <section className="specialist-hero">
          <div className="specialist-profile">
            <div className="specialist-large-avatar">{specialist.avatar}</div>
            <div>
              <span className="specialist-eyebrow">Specialist Profile</span>
              <h1>{specialist.name}</h1>
              <p>{specialist.specialty}</p>
              <div className="specialist-status-row">
                <span className={specialist.available ? "status-available" : "status-busy"}>
                  {specialist.available ? "Available" : "Not Available"}
                </span>
                <span>{specialist.location}</span>
              </div>
            </div>
          </div>

          <button
            className="specialist-book-btn"
            onClick={() => setShowBookingForm(true)}
            disabled={!specialist.available}
          >
            Book Appointment
          </button>
        </section>

        <section className="specialist-stats">
          <div>
            <span>Rating</span>
            <strong>{specialist.rating}</strong>
          </div>
          <div>
            <span>Experience</span>
            <strong>{specialist.experience} Years</strong>
          </div>
          <div>
            <span>Fee</span>
            <strong>Rs. {specialist.fee}</strong>
          </div>
          <div>
            <span>Bookings</span>
            <strong>{specialist.completedBookings}+</strong>
          </div>
        </section>

        <section className="specialist-grid">
          <div className="specialist-panel">
            <h2>About</h2>
            <p>{specialist.bio}</p>
          </div>

          <div className="specialist-panel">
            <h2>Availability</h2>
            <div className="availability-row">
              <span>Working Hours</span>
              <strong>{specialist.workingHours}</strong>
            </div>
            <div className="availability-row">
              <span>Next Available</span>
              <strong>{specialist.nextAvailable}</strong>
            </div>
          </div>

          <div className="specialist-panel services-panel">
            <h2>Services</h2>
            <div className="service-tags">
              {specialist.services.map((service) => (
                <span key={service}>{service}</span>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SpecialistPage;
