import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "./firebase";
import SignupPage from "./components/SignupPage";
import SplashScreen from "./components/SplashScreen";
import LoginPage from "./components/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import HomePage from "./components/HomePage";
import ServicePage from "./pages/ServicePage";
import BookPage from "./pages/BookPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import SpecialistPage from "./pages/SpecialistPage";
import AdminChatPage from "./pages/AdminChatPage";
import AdminCompletedBookings from "./pages/AdminCompletedBookings";
import defaultBarbers from "./components/data/barbers";
import UserReviewPrompt from "./components/UserReviewPrompt";
import { writeBatch } from "firebase/firestore";

const createSlotId = (date, time) =>
  `${date}_${time}`.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase();

function App() {


  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visitedApp, setVisitedApp] = useState(false);
  const [firestoreBarbers, setFirestoreBarbers] = useState([]);
  const [reviews, setReviews] = useState([]);

  const barbers = [
    ...defaultBarbers.map((barber) => {
      const firestoreBarber = firestoreBarbers.find(
        (item) => String(item.id) === String(barber.id)
      );

      return firestoreBarber
        ? {
          ...barber,
          ...firestoreBarber,
          available:
            firestoreBarber.available === undefined
              ? barber.available
              : firestoreBarber.available,
        }
        : barber;
    }),
    ...firestoreBarbers.filter(
      (item) => !defaultBarbers.some((barber) => String(barber.id) === String(item.id))
    ),
  ];

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

        const role = profileSnap.exists()
        ? profileSnap.data().role || "user"
        : "user";
      
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
    const mapDocs = (snapshot) =>
      snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }));

    if (userRole === "admin") {
      const unsubscribe = onSnapshot(
        query(appointmentsRef),
        (snapshot) => setAppointments(mapDocs(snapshot)),
        (error) => console.error("Error fetching appointments:", error)
      );

      return () => unsubscribe();
    }

    const byUserId = { current: [] };
    const byUserEmail = { current: [] };
    const byEmail = { current: [] };

    const syncAppointments = () => {
      const merged = new Map();
      [...byUserId.current, ...byUserEmail.current, ...byEmail.current].forEach(
        (appointment) => {
          merged.set(appointment.id, appointment);
        }
      );
      setAppointments(Array.from(merged.values()));
    };

    const unsubscribeUserId = onSnapshot(
      query(appointmentsRef, where("userId", "==", user.uid)),
      (snapshot) => {
        byUserId.current = mapDocs(snapshot);
        syncAppointments();
      },
      (error) => console.error("Error fetching appointments by userId:", error)
    );

    const unsubscribeUserEmail = user.email
      ? onSnapshot(
        query(appointmentsRef, where("userEmail", "==", user.email)),
        (snapshot) => {
          byUserEmail.current = mapDocs(snapshot);
          syncAppointments();
        },
        (error) => console.error("Error fetching appointments by userEmail:", error)
      )
      : () => { };

    const unsubscribeEmail = user.email
      ? onSnapshot(
        query(appointmentsRef, where("email", "==", user.email)),
        (snapshot) => {
          byEmail.current = mapDocs(snapshot);
          syncAppointments();
        },
        (error) => console.error("Error fetching appointments by email:", error)
      )
      : () => { };

    return () => {
      unsubscribeUserId();
      unsubscribeUserEmail();
      unsubscribeEmail();
    };
  }, [user, userRole]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "barbers"),
      (snapshot) => {
        const barberList = [];

        snapshot.forEach((barberDoc) => {
          barberList.push({ id: barberDoc.id, ...barberDoc.data() });
        });

        setFirestoreBarbers(barberList);
      },
      (error) => {
        console.error("Error fetching barbers:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "reviews"),
      (snapshot) => {
        const reviewList = [];

        snapshot.forEach((reviewDoc) => {
          reviewList.push({ id: reviewDoc.id, ...reviewDoc.data() });
        });

        reviewList.sort((first, second) => {
          const firstTime = first.createdAt?.toMillis?.() || 0;
          const secondTime = second.createdAt?.toMillis?.() || 0;
          return secondTime - firstTime;
        });

        setReviews(reviewList);
      },
      (error) => {
        console.error("Error fetching reviews:", error);
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

  const completeAppointment = async (appointmentId) => {
    await updateDoc(doc(db, "appointments", appointmentId), {
      status: "completed",
      completedAt: serverTimestamp(),
      reviewStatus: "pending",
      reviewSubmitted: false,
      reviewPending: true,
    });
  };

  

  const submitReview = async (appointment, reviewData) => {
    const appointmentRef = doc(db, "appointments", appointment.id);
    const reviewRef = doc(db, "reviews", appointment.id);
  
    const batch = writeBatch(db);
  
    batch.set(reviewRef, {
      appointmentId: appointment.id,
      userId: user?.uid || appointment.userId || "",
      userEmail: user?.email || appointment.userEmail || appointment.email || "",
      name: reviewData.name,
      rating: Number(reviewData.rating),
      text: reviewData.text,
      service: appointment.service || "",
      barber: appointment.barber || appointment.doctor || "",
      createdAt: serverTimestamp(),
    });
  
    batch.update(appointmentRef, {
      reviewSubmitted: true,
      reviewStatus: "submitted",
      reviewPending: false,
      reviewedAt: serverTimestamp(),
    });
  
    await batch.commit();
  };
  const dismissReview = async (appointmentId) => {
    await updateDoc(doc(db, "appointments", appointmentId), {
      reviewDismissed: true,
      reviewStatus: "dismissed",
    });
  };
  if (loading) {
    return <div>Loading...</div>;
  }
  {
    user && userRole === "user" && (
      <>
        {console.log("Rendering UserReviewPrompt")}
        <UserReviewPrompt
          submitReview={submitReview}
          user={user}
          userRole={userRole}
        />
      </>
    )
  }
  console.log("User:", user);
  console.log("Role:", userRole);
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
                  reviews={reviews}
                  user={user}
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
          path="/admin/chat"
          element={
            user && userRole === "admin" ? (
              <AdminChatPage />
            ) : user ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/completed-bookings"
          element={
            user && userRole === "admin" ? (
              <AdminCompletedBookings
                appointments={appointments}
                deleteAppointment={deleteAppointment}
              />
            ) : user ? (
              <Navigate to="/home" replace />
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
              <Navigate to="/admin/profile" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/profile"
          element={
            user && userRole === "admin" ? (
              <ProfilePage user={user} appointments={appointments} isAdmin />
            ) : user ? (
              <Navigate to="/home" replace />
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
                completeAppointment={completeAppointment}
              />
            ) : user ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/login" replace />
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

      {user && userRole === "user" && (
        <UserReviewPrompt
          submitReview={submitReview}
          dismissReview={dismissReview}
          user={user}
          userRole={userRole}
        />
      )}
    </Router>

  );
}

export default App;
