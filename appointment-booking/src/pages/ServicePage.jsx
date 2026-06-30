import { useParams, useNavigate } from "react-router-dom";
import "./ServicePage.css";

import banner from "../assets/image/banner2.jpg";
import fade from "../assets/image/haircut1.jpg";
import crew from "../assets/image/haircut2.jpg";
import undercut from "../assets/image/haircut3.jpg";
import tools from "../assets/image/haircut4.jpg";
import beardBanner from "../assets/image/beard-banner.jpg";
import beard1 from "../assets/image/beard1.jpg";
import beard2 from "../assets/image/beard2.jpg";
import beard3 from "../assets/image/beard3.jpg";
import beard4 from "../assets/image/beard4.jpg";
import colorBanner from "../assets/image/color-banner.jpg";
import color1 from "../assets/image/color1.jpg";
import color2 from "../assets/image/color2.jpg";    
import color3 from "../assets/image/color3.jpg";
import color4 from "../assets/image/color4.jpg";
import facialBanner from "../assets/image/facial-banner.avif";
import facial1 from "../assets/image/facial1.jpg";
import facial2 from "../assets/image/facial2.avif";
import facial3 from "../assets/image/facial3.jpg";
import facial4 from "../assets/image/facial4.jpg";

function ServicePage() {
  const { name } = useParams();
  const navigate = useNavigate();

  const services = {
    haircut: {
      title: "Haircut",
      emoji: "✂️",
      price: "$20",
      duration: "30 min",
      description: "Professional haircut by experienced barbers.",

      banner: banner,

      styles: [
        { image: fade, title: "Fade Cut" },
        { image: crew, title: "Crew Cut" },
        { image: undercut, title: "Undercut" },
        { image: tools, title: "Classic Cut" },
      ],
    },

    beard: {
      title: "Beard",
      emoji: "🧔",
      price: "$10",
      duration: "20 min",
      description: "Premium beard trimming and shaping.",

      banner: beardBanner,

      styles: [
        { image: beard1, title: "Short Beard" },
        { image: beard2, title: "Long Beard" },
        { image: beard3, title: "Royal Beard" },
        { image: beard4, title: "French Beard" },
      ],
    },

    "hair-color": {
      title: "Hair Color",
      emoji: "🎨",
      price: "$60",
      duration: "1 Hour",
      description: "Hair coloring with premium products.",

      banner: colorBanner,

      styles: [
        { image: color1, title: "Brown" },
        { image: color2, title: "Ash Grey" },
        { image: color3, title: "Golden" },
        { image: color4, title: "Burgundy" },
      ],
    },

    facial: {
      title: "Facial",
      emoji: "💆",
      price: "$40",
      duration: "45 min",
      description: "Relaxing facial treatment.",

      banner: facialBanner,

      styles: [
        { image: facial1, title: "Gold Facial" },
        { image: facial2, title: "Fruit Facial" },
        { image: facial3, title: "Charcoal" },
        { image: facial4, title: "Hydra Facial" },
      ],
    },
  };

  const service = services[name];

  if (!service) {
    return (
      <div className="service-page">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <p>Service not found.</p>
      </div>
    );
  }

  return (
    <div className="service-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <img src={service.banner} alt={service.title} className="banner" />

      <div className="service-card">
        <h1>
          {service.emoji} {service.title}
        </h1>

        <p>{service.description}</p>

        <div className="info">
          <div>
            <h3>⭐ 4.9</h3>
            <span>Rating</span>
          </div>

          <div>
            <h3>{service.duration}</h3>
            <span>Duration</span>
          </div>

          <div>
            <h3>{service.price}</h3>
            <span>Price</span>
          </div>
        </div>
      </div>

      <h2>Popular Styles</h2>

      <div className="styles-grid">
        {service.styles.map((style, index) => (
          <div className="style-card" key={index}>
            <img src={style.image} alt={style.title} />
            <p>{style.title}</p>
          </div>
        ))}
      </div>

      <div className="include-card">
        <h2>What's Included?</h2>

        <p>✔ Hair Wash</p>
        <p>✔ Hair Cutting</p>
        <p>✔ Hair Styling</p>
        <p>✔ Blow Dry</p>
      </div>

      <button className="book-btn">Book Appointment</button>
    </div>
  );
}

export default ServicePage;
