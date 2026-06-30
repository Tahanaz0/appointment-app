import "./DoctorList.css";

function DoctorList({ doctors, onSelectDoctor }) {
  return (
    <div className="doctor-list-container">
      <div className="doctor-list-header">
        <h1>Our Stylists</h1>
        <p>Choose your favorite barber for premium grooming</p>
      </div>

      <div className="doctor-cards">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="doctor-card">
            <div className="doctor-avatar">{doctor.avatar}</div>
            <h3>{doctor.name}</h3>
            <p className="specialty">{doctor.specialty}</p>
            <div className="doctor-info">
              <span className="rating">⭐ {doctor.rating}</span>
              <span className="experience">{doctor.experience} yrs</span>
            </div>
            <p className="fee">₹{doctor.fee}</p>
            <button 
              className="book-btn"
              onClick={() => onSelectDoctor(doctor)}
            >
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DoctorList;
