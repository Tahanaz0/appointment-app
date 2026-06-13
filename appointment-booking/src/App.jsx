import { useState, useEffect } from "react";
import "./App.css";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

import AppointmentForm from "./components/AppointmentForm";
import AppointmentList from "./components/AppointmentList";

function App() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "appointments"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const appointmentList = [];
        snapshot.forEach((doc) => {
          appointmentList.push({ id: doc.id, ...doc.data() });
        });
        setAppointments(appointmentList);
      },
      (error) => {
        console.error("Error fetching appointments:", error);
        alert("Error loading appointments: " + error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  const addAppointment = (newAppointment) => {
    setAppointments([...appointments, newAppointment]);
  };

  return (
    <div className="container">
      <h1>Appointment Booking</h1>

      <AppointmentForm addAppointment={addAppointment} />

      <AppointmentList appointments={appointments} />
    </div>
  );
}

export default App;
