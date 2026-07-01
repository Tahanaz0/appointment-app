import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { collection, deleteDoc, doc, query, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "./firebase";
import SignupPage from "./components/SignupPage";
import SplashScreen from "./components/SplashScreen";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import ServicePage from "./pages/ServicePage";
import BookPage from "./pages/BookPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import SpecialistPage from "./pages/SpecialistPage";

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

  const deleteAppointment = async (appointmentId) => {
    await deleteDoc(doc(db, "appointments", appointmentId));
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
                setVisitedApp(true);
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
        <Route path="/" element={<HomePage />} />
        <Route
          path="/book"
          element={
            user ? (
              <BookPage
                appointments={appointments}
                deleteAppointment={deleteAppointment}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/specialist/:id"
          element={
            user ? (
              <SpecialistPage addAppointment={addAppointment} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/service/:name"
          element={
            user ? (
              <ServicePage addAppointment={addAppointment} />
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
