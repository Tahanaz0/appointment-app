import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
function AppointmentForm({ addAppointment }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
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
    });
  } catch (error) {
    console.log(error);
    alert("Error booking appointment");
  }
};

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter Name"
        value={formData.name}
        required
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <input
        type="email"
        placeholder="Enter Email"
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
        <option value="">Select Time</option>
        <option value="09:00 AM">09:00 AM</option>
        <option value="10:00 AM">10:00 AM</option>
        <option value="11:00 AM">11:00 AM</option>
      </select>
      <button type="submit">Book Appointment</button>
    </form>
  );
}

export default AppointmentForm;
