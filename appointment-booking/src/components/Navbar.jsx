import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="home-header">
      <div className="header-left">
        <h1 className="brand-title">💈 GentleCuts</h1>
        <p className="header-time">Available 9:00 AM - 9:00 PM</p>
      </div>

      <div className="bottom-nav">
        <button
          className={`nav-btn ${
            location.pathname === "/" || location.pathname === "/home"
              ? "active"
              : ""
          }`}
          onClick={() => navigate("/home")}
        >
          🏠 Home
        </button>

        <button
          className={`nav-btn ${location.pathname === "/book" ? "active" : ""}`}
          onClick={() => navigate("/book")}
        >
          📅 Book
        </button>

        <button
          className={`nav-btn ${location.pathname === "/chat" ? "active" : ""}`}
          onClick={() => navigate("/chat")}
        >
          💬 Chat
        </button>

        <button
          className={`nav-btn ${location.pathname === "/profile" ? "active" : ""}`}
          onClick={() => navigate("/profile")}
        >
          👤 Profile
        </button>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Navbar;