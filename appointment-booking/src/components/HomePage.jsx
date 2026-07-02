import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import AppointmentForm from "./AppointmentForm";
import "./HomePage.css";
import barbers from "./data/barbers";
import haircutImage from "../assets/image/haircut1.jpg";
import beardImage from "../assets/image/beard1.jpg";
import colorImage from "../assets/image/color1.jpg";
import facialImage from "../assets/image/facial1.jpg";
import spaImage from "../assets/image/spa.jfif";
import salonImage from "../assets/image/saloon.png";

function HomePage({ addAppointment }) {
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllGallery, setShowAllGallery] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

 
  

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
    {
      id: 3,
      name: "Ayesha Khan",
      time: "2 weeks ago",
      rating: 5,
      text: "My appointment started on time and the haircut was exactly what I asked for. Very professional team.",
    },
    {
      id: 4,
      name: "Ali Raza",
      time: "3 weeks ago",
      rating: 5,
      text: "Clean shop, friendly barber, and a really smooth booking experience. I will book again.",
    },
    {
      id: 5,
      name: "Sarah Ahmed",
      time: "1 month ago",
      rating: 4,
      text: "Loved the facial service. The staff explained everything clearly and made the visit comfortable.",
    },
  ];


  const galleryItems = [
    {
      id: 1,
      src: haircutImage,
      title: "Modern Haircut",
      category: "Haircut",
    },
    {
      id: 2,
      src: beardImage,
      title: "Beard Styling",
      category: "Beard",
    },
    {
      id: 3,
      src: colorImage,
      title: "Hair Color",
      category: "Color",
    },
    {
      id: 4,
      src: facialImage,
      title: "Facial Care",
      category: "Facial",
    },
    {
      id: 5,
      src: spaImage,
      title: "Relaxing Spa",
      category: "Spa",
    },
    {
      id: 6,
      src: salonImage,
      title: "Salon Interior",
      category: "Studio",
    },
  ];

  const visibleGalleryItems = showAllGallery
    ? galleryItems
    : galleryItems.slice(0, 3);

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

        <div className="bottom-nav">
          <button
            className={`nav-btn ${
              location.pathname === "/" || location.pathname === "/home" ? "active" : ""
            }`}
            onClick={() => navigate("/home")}
          >
            🏠 Home
          </button>

          <button
            className={`nav-btn ${location.pathname === "/book" ? "active" : ""}`}
            onClick={() => navigate("/book")}
          >
            🔍 Book
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
              <div
                key={barber.id}
                className="specialist-card"
                onClick={() => navigate(`/specialist/${barber.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    navigate(`/specialist/${barber.id}`);
                  }
                }}
                role="button"
                tabIndex="0"
              >
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
                  onClick={(event) => {
                    event.stopPropagation();
                    handleSelectBarber(barber);
                  }}
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
            <button
              type="button"
              className="view-all"
              onClick={() => setShowAllGallery((prev) => !prev)}
            >
              {showAllGallery ? "Show Less" : "View All"}
            </button>
          </div>
          <div className="gallery-grid">
            {visibleGalleryItems.map((item) => (
              <article key={item.id} className="gallery-item">
                <img src={item.src} alt={item.title} />
                <div className="gallery-caption">
                  <span>{item.category}</span>
                  <strong>{item.title}</strong>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="reviews-section">
          <div className="section-header">
            <h3 className="section-title">Customer Reviews</h3>
            <button
              type="button"
              className="view-all"
              onClick={() => setShowAllReviews((prev) => !prev)}
            >
              {showAllReviews ? "Show Less" : "View All"}
            </button>
          </div>

          <div className="reviews-list">
            {(showAllReviews ? reviews : reviews.slice(0, 2)).map((review) => (
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


    </div>
  );
}

export default HomePage;
