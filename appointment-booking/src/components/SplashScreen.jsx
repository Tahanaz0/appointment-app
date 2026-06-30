import "./SplashScreen.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SplashScreen({ onGetStarted }) {
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    setIsClosing(true);
    setTimeout(() => {
      onGetStarted && onGetStarted();
      navigate("/login");
    }, 600);
  };
  return (
  <div className={`splash-screen ${isClosing ? "fade-out" : ""}`}>
  <div className="splash-left">
    <div className="brand-container">
      <h1 className="brand">GentleCuts</h1>
      <p className="subtitle">Premium Men's Salon</p>
    </div>

    <p className="tagline">
      Book Your Haircut, Beard Trim <br />
      & Grooming Services
    </p>

    <button className="btn" onClick={handleGetStarted}>
      Get Started
    </button>
  </div>

  
</div>
  );
}

export default SplashScreen;