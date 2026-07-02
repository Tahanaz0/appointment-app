import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { collection, deleteDoc, doc, getDoc, query, onSnapshot, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "./firebase";
import SignupPage from "./components/SignupPage";
import SplashScreen from "./components/SplashScreen";
import LoginPage from "./components/LoginPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import HomePage from "./components/HomePage";
import ServicePage from "./pages/ServicePage";
import BookPage from "./pages/BookPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import SpecialistPage from "./pages/SpecialistPage";
import defaultBarbers from "./components/data/barbers";

const createSlotId = (date, time) =>
  `${date}_${time}`.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase();

function App() {
  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visitedApp, setVisitedApp] = useState(false);
  const [barberAvailability, setBarberAvailability] = useState({});

  const barbers = defaultBarbers.map((barber) => ({
    ...barber,
    available:
      barberAvailability[barber.id] === undefined
        ? barber.available
        : barberAvailability[barber.id],
  }));

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setUserRole(null);
        setAppointments([]);
        setLoading(false);
        return;
      }

      try {
        const profileSnap = await getDoc(doc(db, "users", currentUser.uid));
        const role = profileSnap.exists() ? profileSnap.data().role : "user";
        setUserRole(role);
      } catch (error) {
        console.error("Error loading user role:", error);
        setUserRole("user");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch appointments for admin or the logged-in user
  useEffect(() => {
    if (!user || !userRole) {
      return;
    }

    const appointmentsRef = collection(db, "appointments");
    const q =
      userRole === "admin"
        ? query(appointmentsRef)
        : query(appointmentsRef, where("userId", "==", user.uid));

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
  }, [user, userRole]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "barbers"),
      (snapshot) => {
        const availability = {};

        snapshot.forEach((barberDoc) => {
          const data = barberDoc.data();

          if (typeof data.available === "boolean") {
            availability[barberDoc.id] = data.available;
          }
        });

        setBarberAvailability(availability);
      },
      (error) => {
        console.error("Error fetching barbers:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const addAppointment = (newAppointment) => {
    setAppointments([...appointments, newAppointment]);
  };

  const deleteAppointment = async (appointmentId) => {
    const appointmentRef = doc(db, "appointments", appointmentId);
    const appointmentSnap = await getDoc(appointmentRef);
    const appointment = appointmentSnap.exists() ? appointmentSnap.data() : null;
    const bookingSlotId =
      appointment?.bookingSlotId ||
      (appointment?.date && appointment?.time
        ? createSlotId(appointment.date, appointment.time)
        : null);

    await deleteDoc(appointmentRef);

    if (bookingSlotId) {
      await deleteDoc(doc(db, "bookingSlots", bookingSlotId));
    }
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
            ) : user && userRole === "admin" ? (
              <Navigate to="/admin/dashboard" replace />
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
          element={
            user ? (
              <Navigate to={userRole === "admin" ? "/admin/dashboard" : "/home"} replace />
            ) : (
              <LoginPage />
            )
          }
        />

        <Route
          path="/admin/login"
          element={
            user ? (
              <Navigate to={userRole === "admin" ? "/admin/dashboard" : "/home"} replace />
            ) : (
              <AdminLoginPage />
            )
          }
        />

        <Route path="/signup" element={<SignupPage />} />
        {/* Home Page - Protected */}
        <Route
          path="/home"
          element={
            user && userRole !== "admin" ? (
              <div className="home-slide-in">
                <HomePage
                  appointments={appointments}
                  addAppointment={addAppointment}
                  barbers={barbers}
                />
              </div>
            ) : user ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/book"
          element={
            user && userRole !== "admin" ? (
              <BookPage
                appointments={appointments}
                deleteAppointment={deleteAppointment}
                barbers={barbers}
              />
            ) : user ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/chat"
          element={
            user && userRole !== "admin" ? (
              <ChatPage />
            ) : user ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/profile"
          element={
            user && userRole !== "admin" ? (
              <ProfilePage user={user} appointments={appointments} />
            ) : user ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            user && userRole === "admin" ? (
              <AdminDashboard
                appointments={appointments}
                deleteAppointment={deleteAppointment}
                barbers={barbers}
              />
            ) : user ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route
          path="/specialist/:id"
          element={
            user && userRole !== "admin" ? (
              <SpecialistPage addAppointment={addAppointment} barbers={barbers} />
            ) : user ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/service/:name"
          element={
            user && userRole !== "admin" ? (
              <ServicePage addAppointment={addAppointment} barbers={barbers} />
            ) : user ? (
              <Navigate to="/admin/dashboard" replace />
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
