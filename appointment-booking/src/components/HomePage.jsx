import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import AppointmentForm from "./AppointmentForm";
import "./HomePage.css";

function HomePage({ appointments, addAppointment }) {
  const [selectedBarber, setSelectedBarber] = useState(null);
  const navigate = useNavigate();

  // 💈 Barber Shop Data
  const barbers = [
    {
      id: 1,
      name: "Amir Khan",
      specialty: "Senior Barber",
      avatar: "💈",
      rating: 4.9,
      experience: 15,
      fee: 500,
      available: true,
    },
    {
      id: 2,
      name: "Rajveer Singh",
      specialty: "Hair Stylist",
      avatar: "✂️",
      rating: 4.8,
      experience: 12,
      fee: 450,
      available: false,
    },
    {
      id: 3,
      name: "Vikram Patel",
      specialty: "Beard Specialist",
      avatar: "🧔",
      rating: 4.9,
      experience: 10,
      fee: 400,
      available: true,
    },
    {
      id: 4,
      name: "Hassan Ali",
      specialty: "Master Barber",
      avatar: "💈",
      rating: 4.7,
      experience: 18,
      fee: 600,
      available: true,
    },
    {
      id: 5,
      name: "Arjun Kumar",
      specialty: "Hair & Beard Care",
      avatar: "💇",
      rating: 4.8,
      experience: 8,
      fee: 350,
      available: false,
    },
    {
      id: 6,
      name: "Sameer Malik",
      specialty: "Grooming Expert",
      avatar: "🧴",
      rating: 4.9,
      experience: 11,
      fee: 550,
      available: true,
    },
  ];

  const services = [
    {
      id: "haircut",
      name: "Haircut",
      emoji: "✂️",
      price: "$20",
      duration: "30 min",
      description: "Professional haircut with modern styling.",
    },
    {
      id: "beard",
      name: "Beard",
      emoji: "🧔",
      price: "$10",
      duration: "20 min",
      description: "Premium beard trimming and shaping.",
    },
    {
      id: "hair-color",
      name: "Hair Color",
      emoji: "🎨",
      price: "$60",
      duration: "1 Hour",
      description: "Hair coloring with premium products.",
    },
    {
      id: "facial",
      name: "Facial",
      emoji: "💆",
      price: "$40",
      duration: "45 min",
      description: "Relaxing facial treatment for glowing skin.",
    },
  ];

  const reviews = [
    {
      id: 1,
      name: "Harish McKinney",
      time: "2 days ago",
      rating: 5,
      text: "I came here for a quick trim and left extremely satisfied. The atmosphere is calm and relaxing. Amazing work!",
    },
    {
      id: 2,
      name: "Cameron Williamson",
      time: "7 days ago",
      rating: 4,
      text: "The place was very calm and I love the service. Outstandingly good. Would definitely recommend to friends and family.",
    },
  ];

  const galleryImages = ["🖼️", "🖼️", "🖼️"];

  const handleSelectBarber = (barber) => {
    setSelectedBarber(barber);
  };

  const handleBack = () => {
    setSelectedBarber(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  if (selectedBarber) {
    return (
      <AppointmentForm
        selectedBarber={selectedBarber}
        addAppointment={addAppointment}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="home-wrapper">
      {/* 🔝 Top Header */}
      <div className="home-header">
        <div className="header-left">
          <h1 className="brand-title">💈 GentleCuts</h1>
          <p className="header-time">Available 9:00 AM - 9:00 PM</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* 🪮 Main Content */}
      <div className="home-content">
        {/* Promo Banner */}
        <div className="promo-banner">
          <div className="promo-text">
            <h3>Special Offer</h3>
            <p>Get 30% discount on your first booking</p>
          </div>
          <div className="promo-badge">30%</div>
        </div>

        {/* Services Category */}
        <div className="services-section">
          <h3 className="section-title">What are you looking for?</h3>
          <div className="services-grid">
            {services.map((service) => (
              <Link
                key={service.id}
                to={`/service/${service.id}`}
                className="service-card"
              >
                <div className="service-emoji">{service.emoji}</div>
                <p>{service.name}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Favorite Specialists */}
        <div className="specialists-section">
          <div className="section-header">
            <h3 className="section-title">Your Favorite Specialists</h3>
            <a href="#" className="view-all">
              View All
            </a>
          </div>

          <div className="specialists-list">
            {barbers.slice(0, 3).map((barber) => (
              <div key={barber.id} className="specialist-card">
                <div className="specialist-avatar">{barber.avatar}</div>
                <div className="specialist-info">
                  <h4>{barber.name}</h4>
                  <p className="specialty">{barber.specialty}</p>
                  <p className="availability">
                    {barber.available ? (
                      <span className="available">✓ Available</span>
                    ) : (
                      <span className="unavailable">Not Available</span>
                    )}
                  </p>
                </div>
                <button
                  className="book-specialist-btn"
                  onClick={() => handleSelectBarber(barber)}
                >
                  Book
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery */}
        <div className="gallery-section">
          <div className="section-header">
            <h3 className="section-title">Gallery</h3>
            <a href="#" className="view-all">
              View All
            </a>
          </div>
          <div className="gallery-grid">
            {galleryImages.map((img, idx) => (
              <div key={idx} className="gallery-item">
                {img}
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="reviews-section">
          <div className="section-header">
            <h3 className="section-title">Customer Reviews</h3>
            <a href="#" className="view-all">
              View All
            </a>
          </div>

          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <h5>{review.name}</h5>
                    <span className="review-time">{review.time}</span>
                  </div>
                  <div className="review-rating">
                    {"⭐".repeat(review.rating)}
                  </div>
                </div>
                <p className="review-text">{review.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Spacer for bottom nav */}
        <div style={{ height: "80px" }}></div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className="nav-btn active">🏠 Home</button>
        <button className="nav-btn">🔍 Book</button>
        <button className="nav-btn">💬 Chat</button>
        <button className="nav-btn">👤 Profile</button>
      </div>
    </div>
  );
}

export default HomePage;
