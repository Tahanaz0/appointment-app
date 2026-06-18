import { useState } from "react";
import DoctorList from "./DoctorList";
import AppointmentForm from "./AppointmentForm";

function HomePage({ appointments, addAppointment }) {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Sample doctors data - you can fetch this from Firebase later
  const doctors = [
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      specialty: "Cardiologist",
      avatar: "👨‍⚕️",
      rating: 4.8,
      experience: 12,
      fee: 500,
    },
    {
      id: 2,
      name: "Dr. Priya Singh",
      specialty: "Dermatologist",
      avatar: "👩‍⚕️",
      rating: 4.9,
      experience: 10,
      fee: 400,
    },
    {
      id: 3,
      name: "Dr. Amit Patel",
      specialty: "Orthopedic Surgeon",
      avatar: "👨‍⚕️",
      rating: 4.7,
      experience: 15,
      fee: 600,
    },
    {
      id: 4,
      name: "Dr. Sana Kapoor",
      specialty: "Pediatrician",
      avatar: "👩‍⚕️",
      rating: 4.6,
      experience: 8,
      fee: 350,
    },
    {
      id: 5,
      name: "Dr. Vikram Desai",
      specialty: "General Physician",
      avatar: "👨‍⚕️",
      rating: 4.5,
      experience: 20,
      fee: 300,
    },
    {
      id: 6,
      name: "Dr. Neha Gupta",
      specialty: "Psychiatrist",
      avatar: "👩‍⚕️",
      rating: 4.8,
      experience: 11,
      fee: 450,
    },
  ];

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleBackFromForm = () => {
    setSelectedDoctor(null);
  };

  return (
    <>
      {selectedDoctor ? (
        <AppointmentForm
          selectedDoctor={selectedDoctor}
          addAppointment={addAppointment}
          onBack={handleBackFromForm}
        />
      ) : (
        <DoctorList doctors={doctors} onSelectDoctor={handleSelectDoctor} />
      )}
    </>
  );
}

export default HomePage;
