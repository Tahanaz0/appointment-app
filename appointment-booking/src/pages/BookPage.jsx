import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import AppointmentList from "../components/AppointmentList";
import { auth } from "../firebase";
import "./BookPage.css";

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
      <div className="home-header">
        <div className="header-left">
          <h1 className="brand-title">GentleCuts</h1>
          <p className="header-time">Available 9:00 AM - 9:00 PM</p>
        </div>

        <div className="bottom-nav">
          <button className="nav-btn" onClick={() => navigate("/home")}>
            Home
          </button>

          <button className="nav-btn active" onClick={() => navigate("/book")}>
            Book
          </button>

          <button className="nav-btn" onClick={() => navigate("/chat")}>
            Chat
          </button>

          <button className="nav-btn" onClick={() => navigate("/profile")}>
            Profile
          </button>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

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
