import "./SplashScreen.css";
import splashIcon from "../assets/image/splash-icon.png";

function SplashScreen() {
  return (
    <div className="splash-screen">

      <div className="splash-left">
        <h1 className="brand">DocMedX</h1>
        <p className="tagline">
          Doctor Appointment Booking <br />
          App Design
        </p>

        <button className="btn">Get Started</button>
      </div>

      <div className="splash-right">

        <img
          className="phone phone1"
          src={splashIcon}
          alt="Splash icon"
        />


      </div>

    </div>
  );
}

export default SplashScreen;