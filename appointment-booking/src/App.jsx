import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { collection, query, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "./firebase";
import SignupPage from "./components/SignupPage";
import SplashScreen from "./components/SplashScreen";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";

function App() {
  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visitedApp, setVisitedApp] = useState(false);

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Splash Screen - only show on first visit */}
        <Route
          path="/"
          element={
            !visitedApp && !user ? (
              <SplashScreen onGetStarted={() => {
                // setVisitedApp(true);
              }} />
            ) : user ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Login Page */}
        <Route
          path="/login"
          element={user ? <Navigate to="/home" replace /> : <LoginPage />}
        />

<Route path="/signup" element={<SignupPage />} />
        {/* Home Page - Protected */}
        <Route
          path="/home"
          element={
            user ? (
              <div className="home-slide-in">
                <HomePage appointments={appointments} addAppointment={addAppointment} />
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
