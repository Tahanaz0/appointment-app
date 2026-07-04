import { useState } from "react";
import { collection, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./AppointmentForm.css";

const createSlotId = (date, time) =>
  `${date}_${time}`.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase();

function AppointmentForm({
  addAppointment,
  selectedDoctor,
  selectedBarber,
  barbers = [],
  initialService = "",
  onBack,
}) {
  const selectedSpecialist = selectedDoctor || selectedBarber;
  const currentUser = auth.currentUser;
  const barberOptions = barbers.length
    ? barbers
    : selectedSpecialist?.name
      ? [selectedSpecialist]
      : [];

  const [formData, setFormData] = useState({
    name: "",
    email: currentUser?.email || "",
    phone: "",
    barber: selectedSpecialist?.name || "",
    service: initialService,
    date: "",
    time: "",
    notes: "",
    doctor: selectedSpecialist?.name || "",
    doctorId: selectedSpecialist?.id || "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const selectedBarberRecord = barbers.find(
    (barber) => barber.name === formData.barber
  );
  const selectedSpecialistAvailable =
    selectedBarberRecord?.available ?? (selectedSpecialist?.available !== false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const chosenBarber = barbers.find((barber) => barber.name === formData.barber);

      if (chosenBarber && !chosenBarber.available) {
        setFeedback({
          type: "error",
          message: "This barber is currently unavailable. Please select another available barber.",
        });
        return;
      }

      if (selectedSpecialist && !selectedSpecialistAvailable) {
        setFeedback({
          type: "error",
          message: "This barber is currently unavailable. Please select another available barber.",
        });
        return;
      }

      const bookingSlotId = createSlotId(formData.date, formData.time);
      const appointmentRef = doc(collection(db, "appointments"));
      const slotRef = doc(db, "bookingSlots", bookingSlotId);
      const appointmentData = {
        ...formData,
        doctor: formData.barber,
        doctorId: selectedSpecialist?.id || chosenBarber?.id || "",
        bookingSlotId,
        status: "booked",
        userId: currentUser?.uid || "",
        userEmail: currentUser?.email || formData.email,
        createdAt: serverTimestamp(),
      };

      await runTransaction(db, async (transaction) => {
        const slotSnap = await transaction.get(slotRef);

        if (slotSnap.exists()) {
          throw new Error("slot-already-booked");
        }

        transaction.set(slotRef, {
          appointmentId: appointmentRef.id,
          date: formData.date,
          time: formData.time,
          userId: currentUser?.uid || "",
          userEmail: currentUser?.email || formData.email,
          createdAt: serverTimestamp(),
        });

        transaction.set(appointmentRef, appointmentData);
      });

      addAppointment({
        id: appointmentRef.id,
        ...appointmentData,
      });

      setShowSuccessModal(true);

      setFormData({
        name: "",
        email: currentUser?.email || "",
        phone: "",
        barber: selectedSpecialist?.name || "",
        service: initialService,
        date: "",
        time: "",
        notes: "",
        doctor: selectedSpecialist?.name || "",
        doctorId: selectedSpecialist?.id || "",
      });

    } catch (error) {
      console.log(error);
      if (error.message === "slot-already-booked") {
        setFeedback({
          type: "error",
          message: "This time slot is already booked. Please select another time.",
        });
      } else {
        setFeedback({ type: "error", message: "Error booking appointment" });
      }
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onBack();
  };

  return (
    <div className="appointment-form-container">
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>

      <div className="form-header">
        <h2>Book Your Appointment</h2>
        {selectedSpecialist?.name && (
          <div className="selected-barber-status">
            <strong>{selectedSpecialist.name}</strong>
            <span
              className={selectedSpecialistAvailable ? "is-available" : "is-unavailable"}
            >
              {selectedSpecialistAvailable ? "Available" : "Unavailable"}
            </span>
          </div>
        )}
{/* 
        <div className="doctor-selection">
          <span className="doctor-avatar">{selectedDoctor?.avatar}</span>

          <div>
            <p className="doctor-name">{selectedDoctor?.name}</p>
            <p className="doctor-specialty">
              {selectedDoctor?.specialty}
            </p>
          </div>
        </div> */}
      </div>

      {feedback.message && (
        <div className={`appointment-feedback ${feedback.type}`}>{feedback.message}</div>
      )}

      <form className="form" onSubmit={handleSubmit}>
        {/* Name */}
        <input
          type="text"
          placeholder="Your Name"
          required
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Your Email"
          required
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
        />

        {/* Phone */}
        <input
          type="tel"
          placeholder="Phone Number"
          required
          value={formData.phone}
          onChange={(e) =>
            setFormData({ ...formData, phone: e.target.value })
          }
        />

        {/* Barber */}
        {/* Barber */}
        <select
          required
          value={formData.barber}
          onChange={(e) => {
            const barber = barbers.find((item) => item.name === e.target.value);

            setFormData({
              ...formData,
              barber: e.target.value,
              doctor: e.target.value,
              doctorId: barber?.id || "",
            });
          }}
        >
          <option value="">Select Barber</option>
          {barberOptions.map((barber) => (
            <option
              key={barber.id || barber.name}
              value={barber.name}
              disabled={barber.available === false}
            >
              {barber.name}
              {barber.available === false ? " - Unavailable" : ""}
            </option>
          ))}
        </select>

        {/* Service */}
        <select
          required
          value={formData.service}
          onChange={(e) =>
            setFormData({ ...formData, service: e.target.value })
          }
        >
          <option value="">Select Service</option>
          <option value="Haircut">✂️ Haircut</option>
          <option value="Beard Trim">🧔 Beard Trim</option>
          <option value="Hair Color">🎨 Hair Color</option>
          <option value="Facial">💆 Facial</option>
        </select>

        {/* Date */}
        <input
          type="date"
          required
          value={formData.date}
          onChange={(e) =>
            setFormData({ ...formData, date: e.target.value })
          }
          onFocus={(e) => e.target.showPicker?.()}
          onClick={(e) => e.target.showPicker?.()}
        />

        {/* Time */}
        <select
          required
          value={formData.time}
          onChange={(e) =>
            setFormData({ ...formData, time: e.target.value })
          }
        >
          <option value="">Select Time Slot</option>
          <option value="09:00 AM">09:00 AM</option>
          <option value="10:00 AM">10:00 AM</option>
          <option value="11:00 AM">11:00 AM</option>
          <option value="12:00 PM">12:00 PM</option>
          <option value="01:00 PM">01:00 PM</option>
          <option value="02:00 PM">02:00 PM</option>
          <option value="03:00 PM">03:00 PM</option>
          <option value="04:00 PM">04:00 PM</option>
          <option value="05:00 PM">05:00 PM</option>
          <option value="06:00 PM">06:00 PM</option>
        </select>

        {/* Notes */}
        <textarea
          placeholder="Special Instructions (Optional)"
          rows="4"
          value={formData.notes}
          onChange={(e) =>
            setFormData({ ...formData, notes: e.target.value })
          }
        />

        <button
          type="submit"
          className="submit-btn"
          disabled={
            !selectedSpecialistAvailable ||
            selectedBarberRecord?.available === false
          }
        >
          Confirm Booking
        </button>
      </form>

      {showSuccessModal && (
        <div className="success-modal-backdrop" role="dialog" aria-modal="true">
          <div className="success-modal">
            <div className="success-modal-icon">✓</div>
            <h3>Appointment Booked</h3>
            <p>Your appointment request has been confirmed successfully.</p>
            <button type="button" className="success-modal-btn" onClick={handleSuccessModalClose}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentForm;
