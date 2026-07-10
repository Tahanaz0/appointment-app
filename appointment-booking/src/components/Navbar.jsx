import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Navbar.css";

import {
  FaHome,
  FaCalendarAlt,
  FaComments,
  FaUserCircle,
  FaSignOutAlt,
  FaCut,
} from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openingTime, setOpeningTime] = useState("09:00");
  const [closingTime, setClosingTime] = useState("21:00");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "settings", "salon"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          setOpeningTime(data.openingTime || "09:00");
          setClosingTime(data.closingTime || "21:00");
        }
      },
      (error) => {
        console.error("Error loading salon timing:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="home-header">
      {/* Brand */}
      <div className="header-left">
        <div className="header-brand">
          <div className="logo-box">
            <FaCut />
          </div>

          <div>
            <span className="brand-tag">Premium Men's Salon</span>

            <h1 className="brand-title">
              Gentle<span>Cuts</span>
            </h1>

            <p className="header-time">
              Available {openingTime} - {closingTime}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bottom-nav">
        <button
          className={`nav-btn ${
            location.pathname === "/" || location.pathname === "/home"
              ? "active"
              : ""
          }`}
          onClick={() => navigate("/home")}
        >
          <FaHome />
          <span>Home</span>
        </button>

        <button
          className={`nav-btn ${
            location.pathname === "/book" ? "active" : ""
          }`}
          onClick={() => navigate("/book")}
        >
          <FaCalendarAlt />
          <span>Book</span>
        </button>

        <button
          className={`nav-btn ${
            location.pathname === "/chat" ? "active" : ""
          }`}
          onClick={() => navigate("/chat")}
        >
          <FaComments />
          <span>Chat</span>
        </button>

        <button
          className={`nav-btn ${
            location.pathname === "/profile" ? "active" : ""
          }`}
          onClick={() => navigate("/profile")}
        >
          <FaUserCircle />
          <span>Profile</span>
        </button>
      </div>

      {/* Logout */}
      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt />
        <span>Logout</span>
      </button>
    </header>
  );
}

export default Navbar;