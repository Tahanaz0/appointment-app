import { useState, useEffect } from "react";
import "./App.css";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

import SplashScreen from "./components/SplashScreen";
import HomePage from "./components/HomePage";

function App() {
  const [appointments, setAppointments] = useState([]);
  const [showSplash, setShowSplash] = useState(true);

  // Handle splash screen timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    },2000); // Show splash screen for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  // Fetch appointments from Firebase
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
    <>
      {showSplash ? (
        <SplashScreen />
      ) : (
        <HomePage appointments={appointments} addAppointment={addAppointment} />
      )}
    </>
  );
}

export default App;
