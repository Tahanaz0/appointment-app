import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAGci1haiiwru3fMtCS3cnvHTS74dLd8Bg",
  authDomain: "appointment-booking-43666.firebaseapp.com",
  projectId: "appointment-booking-43666",
  storageBucket: "appointment-booking-43666.firebasestorage.app",
  messagingSenderId: "274643900719",
  appId: "1:274643900719:web:15b7e0d464f2444a1d69da",
  measurementId: "G-7FLPMYY04Q",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
