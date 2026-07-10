import { useState } from "react";
import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import "./AppointmentForm.css";
import Select from "react-select";

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

  const barberSelectOptions = barberOptions.map((barber) => ({
    value: barber.name,
    label: barber.available ? barber.name : `${barber.name} (Unavailable)`,
    id: barber.id,
    isDisabled: barber.available === false,
  }));

  const serviceOptions = [
    { value: "Haircut", label: "✂️ Haircut" },
    { value: "Beard Trim", label: "🧔 Beard Trim" },
    { value: "Hair Color", label: "🎨 Hair Color" },
    { value: "Facial", label: "💆 Facial" },
  ];

  const timeOptions = [
    { value: "09:00 AM", label: "09:00 AM" },
    { value: "10:00 AM", label: "10:00 AM" },
    { value: "11:00 AM", label: "11:00 AM" },
    { value: "12:00 PM", label: "12:00 PM" },
    { value: "01:00 PM", label: "01:00 PM" },
    { value: "02:00 PM", label: "02:00 PM" },
    { value: "03:00 PM", label: "03:00 PM" },
    { value: "04:00 PM", label: "04:00 PM" },
    { value: "05:00 PM", label: "05:00 PM" },
    { value: "06:00 PM", label: "06:00 PM" },
  ];
  const [formData, setFormData] = useState({
    name: "",
    email: currentUser?.email || "",
    phone: "",
    barber: selectedSpecialist?.name || "",
    service: initialService,
    date: "",
    time: "",
    notes: "",
    // doctor: selectedSpecialist?.name || "",
    // doctorId: selectedSpecialist?.id || "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const selectedBarberRecord = barbers.find(
    (barber) => barber.name === formData.barber,
  );
  const selectedSpecialistAvailable =
    selectedBarberRecord?.available ?? selectedSpecialist?.available !== false;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const chosenBarber = barbers.find(
        (barber) => barber.name === formData.barber,
      );

      if (chosenBarber && !chosenBarber.available) {
        setFeedback({
          type: "error",
          message:
            "This barber is currently unavailable. Please select another available barber.",
        });
        return;
      }

      if (selectedSpecialist && !selectedSpecialistAvailable) {
        setFeedback({
          type: "error",
          message:
            "This barber is currently unavailable. Please select another available barber.",
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
        // doctor: selectedSpecialist?.name || "",
        // doctorId: selectedSpecialist?.id || "",
      });
    } catch (error) {
      console.log(error);
      if (error.message === "slot-already-booked") {
        setFeedback({
          type: "error",
          message:
            "This time slot is already booked. Please select another time.",
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

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#151b21",
      border: "1px solid rgba(212,175,55,.3)",
      borderColor: state.isFocused ? "#d4af37" : "rgba(212,175,55,.3)",
      minHeight: "48px",
      borderRadius: "8px",
      boxShadow: state.isFocused ? "0 0 10px rgba(212,175,55,.3)" : "none",
      "&:hover": {
        borderColor: "#d4af37",
      },
    }),

    menu: (base) => ({
      ...base,
      backgroundColor: "#151b21",
    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#d4af37"
        : state.isFocused
          ? "#222b33"
          : "#151b21",
      color: state.isSelected ? "#121212" : "#fff",
      cursor: "pointer",
    }),

    singleValue: (base) => ({
      ...base,
      color: "#fff",
    }),

    placeholder: (base) => ({
      ...base,
      color: "#999",
    }),

    dropdownIndicator: (base) => ({
      ...base,
      color: "#d4af37",
    }),

    indicatorSeparator: () => ({
      display: "none",
    }),
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
              className={
                selectedSpecialistAvailable ? "is-available" : "is-unavailable"
              }
            >
              {selectedSpecialistAvailable ? "Available" : "Unavailable"}
            </span>
          </div>
        )}
      </div>

      {feedback.message && (
        <div className={`appointment-feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <form className="form" onSubmit={handleSubmit}>
        {/* Name */}
        <input
          type="text"
          placeholder="Your Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Your Email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        {/* Phone */}
        <input
          type="tel"
          placeholder="Phone Number"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />

        {/* Barber */}
        {/* Barber */}
        <Select
          options={barberSelectOptions}
          styles={customSelectStyles}
          placeholder="Select Barber"
          value={
            barberSelectOptions.find(
              (option) => option.value === formData.barber,
            ) || null
          }
          onChange={(selected) => {
            setFormData({
              ...formData,
              barber: selected.value,
              doctor: selected.value,
              doctorId: selected.id,
            });
          }}
        />

        <Select
          options={serviceOptions}
          styles={customSelectStyles}
          placeholder="Select Service"
          value={
            serviceOptions.find(
              (option) => option.value === formData.service,
            ) || null
          }
          onChange={(selected) =>
            setFormData({
              ...formData,
              service: selected.value,
            })
          }
        />

        {/* Date */}
        <input
          type="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          onFocus={(e) => e.target.showPicker?.()}
          onClick={(e) => e.target.showPicker?.()}
        />

        <Select
          options={timeOptions}
          styles={customSelectStyles}
          placeholder="Select Time Slot"
          value={
            timeOptions.find((option) => option.value === formData.time) || null
          }
          onChange={(selected) =>
            setFormData({
              ...formData,
              time: selected.value,
            })
          }
        />

        {/* Notes */}
        <textarea
          placeholder="Special Instructions (Optional)"
          rows="4"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
            <button
              type="button"
              className="success-modal-btn"
              onClick={handleSuccessModalClose}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentForm;
