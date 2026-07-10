import { signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import "./AdminNavbar.css";

import {
  FaTachometerAlt,
  FaCheckCircle,
  FaComments,
  FaUserCircle,
  FaSignOutAlt,
  FaCut,
} from "react-icons/fa";

function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin/login");
  };

  return (
    <header className="admin-header">
      {/* Left */}
      <div className="header-left">
        <div className="header-brand">
          <div className="logo-box">
            <FaCut />
          </div>

          <div>
            <span className="admin-eyebrow">Admin Panel</span>

            <h1>
              Gentle<span>Cuts</span> 
            </h1>

            <p className="header-time">
              Manage bookings, barbers, gallery and chat
            </p>
          </div>
        </div>
      </div>

      {/* Center */}
      <div className="admin-bottom-nav">
        <button
          className={`admin-nav-btn ${
            location.pathname === "/admin/dashboard" ? "active" : ""
          }`}
          onClick={() => navigate("/admin/dashboard")}
        >
          <FaTachometerAlt />
          <span>Dashboard</span>
        </button>

        <button
          className={`admin-nav-btn ${
            location.pathname === "/admin/completed-bookings"
              ? "active"
              : ""
          }`}
          onClick={() => navigate("/admin/completed-bookings")}
        >
          <FaCheckCircle />
          <span>Bookings</span>
        </button>

        <button
          className={`admin-nav-btn ${
            location.pathname === "/admin/chat" ? "active" : ""
          }`}
          onClick={() => navigate("/admin/chat")}
        >
          <FaComments />
          <span>Chat</span>
        </button>

        <button
          className={`admin-nav-btn ${
            location.pathname === "/admin/profile" ? "active" : ""
          }`}
          onClick={() => navigate("/admin/profile")}
        >
          <FaUserCircle />
          <span>Profile</span>
        </button>
      </div>

      {/* Right */}
      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt />
        <span>Logout</span>
      </button>
    </header>
  );
}

export default AdminNavbar;