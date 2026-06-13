function AppointmentList({ appointments }) {
    // console.log("Appointments:", appointments);

  return (
    <div className="list">
      <h2>Appointments</h2>

      {appointments.length === 0 ? (
        <p>No appointments yet</p>
      ) : (
        appointments.map((item) => (
          <div key={item.id} className="card">
            <p><b>Name:</b> {item.name}</p>
            <p><b>Email:</b> {item.email}</p>
            <p><b>Date:</b> {item.date}</p>
            <p><b>Time:</b> {item.time}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default AppointmentList;