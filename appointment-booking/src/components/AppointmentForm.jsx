import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./AppointmentForm.css";

function AppointmentForm({
  addAppointment,
  selectedDoctor,
  selectedBarber,
  initialService = "",
  onBack,
}) {
  const selectedSpecialist = selectedDoctor || selectedBarber;
  const currentUser = auth.currentUser;

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const appointmentData = {
        ...formData,
        userId: currentUser?.uid || "",
        userEmail: currentUser?.email || formData.email,
      };

      const docRef = await addDoc(collection(db, "appointments"), appointmentData);

      addAppointment({
        id: docRef.id,
        ...appointmentData,
      });

      alert("Appointment Booked Successfully ✅");

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

      onBack();
    } catch (error) {
      console.log(error);
      alert("Error booking appointment");
    }
  };

  return (
    <div className="appointment-form-container">
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>

      <div className="form-header">
        <h2>Book Your Appointment</h2>
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
          onChange={(e) =>
            setFormData({ ...formData, barber: e.target.value })
          }
        >
          <option value="">Select Barber</option>
          {selectedSpecialist?.name && (
            <option value={selectedSpecialist.name}>
              {selectedSpecialist.name}
            </option>
          )}
          <option value="Alex">Alex</option>
          <option value="John">John</option>
          <option value="Michael">Michael</option>
          <option value="David">David</option>
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

        <button type="submit" className="submit-btn">
          Confirm Booking
        </button>
      </form>
    </div>
  );
}

export default AppointmentForm;
