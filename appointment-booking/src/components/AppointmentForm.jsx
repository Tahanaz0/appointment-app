import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import "./AppointmentForm.css";

function AppointmentForm({ addAppointment, selectedDoctor, onBack }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
    doctor: selectedDoctor?.name || "",
    doctorId: selectedDoctor?.id || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const docRef = await addDoc(collection(db, "appointments"), formData);
      addAppointment({ id: docRef.id, ...formData });

      alert("Appointment Booked Successfully");

      setFormData({
        name: "",
        email: "",
        date: "",
        time: "",
        doctor: selectedDoctor?.name || "",
        doctorId: selectedDoctor?.id || "",
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
        ← Back to Stylists
      </button>
      
      <div className="form-header">
        <h2>Book Your Session</h2>
        <div className="doctor-selection">
          <span className="doctor-avatar">{selectedDoctor?.avatar}</span>
          <div>
            <p className="doctor-name">{selectedDoctor?.name}</p>
            <p className="doctor-specialty">{selectedDoctor?.specialty}</p>
          </div>
        </div>
      </div>

      <form className="form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Your Name"
        value={formData.name}
        required
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <input
        type="email"
        placeholder="Your Email"
        value={formData.email}
        required
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        type="date"
        value={formData.date}
        required
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
      />
      <select
        value={formData.time}
        required
        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
      >
        <option value="">Select Time Slot</option>
        <option value="09:00 AM">09:00 AM</option>
        <option value="10:00 AM">10:00 AM</option>
        <option value="11:00 AM">11:00 AM</option>
        <option value="02:00 PM">02:00 PM</option>
        <option value="03:00 PM">03:00 PM</option>
        <option value="04:00 PM">04:00 PM</option>
        <option value="05:00 PM">05:00 PM</option>
      </select>
      <button type="submit" className="submit-btn">Confirm Booking</button>
    </form>
    </div>
  );
}

export default AppointmentForm;
