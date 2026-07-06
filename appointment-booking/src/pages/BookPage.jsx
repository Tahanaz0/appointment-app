import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import AppointmentList from "../components/AppointmentList";
import { auth } from "../firebase";
import "./BookPage.css";
import Navbar from "../components/Navbar";

function BookPage({ appointments, deleteAppointment }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="book-page">
      <Navbar onLogout={handleLogout} />

      <div className="book-content">
        <section className="booking-list-panel">
          <AppointmentList
            appointments={appointments}
            onDelete={deleteAppointment}
          />
        </section>
      </div>
    </div>
  );
}

export default BookPage;
