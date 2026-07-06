import { signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import "./AdminNavbar.css";

function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin/login");
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <span className="admin-eyebrow">Admin Panel</span>
        <h1>GentleCuts Dashboard</h1>
        <p className="header-time">
          Manage bookings, barbers, gallery and chat
        </p>
      </div>

      <div className="admin-bottom-nav">
        <button
          className={`admin-nav-btn ${
            location.pathname === "/admin/dashboard" ? "active" : ""
          }`}
          onClick={() => navigate("/admin/dashboard")}
        >
          Dashboard
        </button>

        <button
          className={`admin-nav-btn ${
            location.pathname === "/admin/completed-bookings"
              ? "active"
              : ""
          }`}
          onClick={() => navigate("/admin/completed-bookings")}
        >
          Completed
        </button>

        <button
          className={`admin-nav-btn ${
            location.pathname === "/admin/chat" ? "active" : ""
          }`}
          onClick={() => navigate("/admin/chat")}
        >
          Chat
        </button>

        <button
          className={`admin-nav-btn ${
            location.pathname === "/admin/profile" ? "active" : ""
          }`}
          onClick={() => navigate("/admin/profile")}
        >
          Profile
        </button>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
}

export default AdminNavbar;