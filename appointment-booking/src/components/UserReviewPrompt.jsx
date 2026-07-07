import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import ReviewModal from "./ReviewModal";

function belongsToUser(appointment, user) {
  if (!user?.uid) {
    return false;
  }

  if (appointment.userId && appointment.userId === user.uid) {
    return true;
  }

  const userEmail = user.email?.trim().toLowerCase();

  if (!userEmail) {
    return false;
  }

  const appointmentEmails = [appointment.userEmail, appointment.email]
    .filter(Boolean)
    .map((email) => email.trim().toLowerCase());

  return appointmentEmails.includes(userEmail);
}

function needsReview(appointment) {
  return (
    appointment.status === "completed" &&
    appointment.reviewSubmitted !== true &&
    appointment.reviewStatus !== "submitted" &&
    appointment.reviewDismissed !== true
  );
}

function UserReviewPrompt({ submitReview, dismissReview, user, userRole })  {
  const [appointmentsByUserId, setAppointmentsByUserId] = useState([]);
  const [appointmentsByUserEmail, setAppointmentsByUserEmail] = useState([]);
  const [appointmentsByEmail, setAppointmentsByEmail] = useState([]);
  const [dismissedForThisVisit, setDismissedForThisVisit] = useState(false);
  const [submittedIds, setSubmittedIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.uid || userRole !== "user") {
      setAppointmentsByUserId([]);
      setAppointmentsByUserEmail([]);
      setAppointmentsByEmail([]);
      return;
    }

    const appointmentsRef = collection(db, "appointments");

    const mapDocs = (snapshot) =>
      snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }));

    const unsubscribeUserId = onSnapshot(
      query(appointmentsRef, where("userId", "==", user.uid)),
      (snapshot) => setAppointmentsByUserId(mapDocs(snapshot))
    );

    const unsubscribeUserEmail = user.email
      ? onSnapshot(
          query(appointmentsRef, where("userEmail", "==", user.email)),
          (snapshot) => setAppointmentsByUserEmail(mapDocs(snapshot))
        )
      : () => {};

    const unsubscribeEmail = user.email
      ? onSnapshot(
          query(appointmentsRef, where("email", "==", user.email)),
          (snapshot) => setAppointmentsByEmail(mapDocs(snapshot))
        )
      : () => {};

    return () => {
      unsubscribeUserId();
      unsubscribeUserEmail();
      unsubscribeEmail();
    };
  }, [user, userRole]);

  const userAppointments = useMemo(() => {
    const merged = new Map();

    [...appointmentsByUserId, ...appointmentsByUserEmail, ...appointmentsByEmail].forEach(
      (appointment) => {
        if (belongsToUser(appointment, user)) {
          merged.set(appointment.id, appointment);
        }
      }
    );

    return Array.from(merged.values());
  }, [appointmentsByUserId, appointmentsByUserEmail, appointmentsByEmail, user]);

  const pendingReviewAppointment = useMemo(() => {
    const pending = userAppointments
      .filter(
        (appointment) =>
          needsReview(appointment) &&
          !submittedIds.includes(appointment.id)
      )
      .sort((a, b) => {
        const aTime = a.completedAt?.toMillis?.() || 0;
        const bTime = b.completedAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
  
    console.log("Pending review appointments:", pending); // ye line add karo
    return pending[0] || null;
  }, [userAppointments, submittedIds]);

  const shouldShowModal =
    !!pendingReviewAppointment && !dismissedForThisVisit;

  // useEffect(() => {
  //   setDismissedForThisVisit(false);
  // }, [pendingReviewAppointment?.id]);

  useEffect(() => {
    if (!shouldShowModal) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [shouldShowModal]);

  const handleDismiss = async () => {
    setDismissedForThisVisit(true);
  
    if (pendingReviewAppointment && dismissReview) {
      try {
        console.log("Dismissing appointment:", pendingReviewAppointment.id);
        await dismissReview(pendingReviewAppointment.id);
        console.log("Dismiss successful");
      } catch (error) {
        console.error("Dismiss FAILED:", error);
      }
    } else {
      console.log("dismissReview missing or no pendingReviewAppointment", { pendingReviewAppointment, dismissReview });
    }
  };
  const handleSubmit = async (appointment, reviewData) => {
    if (!submitReview) return;
  
    try {
      setIsSubmitting(true);
      await submitReview(appointment, reviewData);
      setSubmittedIds((prev) => [...prev, appointment.id]);
      setDismissedForThisVisit(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!shouldShowModal || !pendingReviewAppointment) {
    return null;
  }

  return createPortal(
    <ReviewModal
      appointment={pendingReviewAppointment}
      user={user}
      onSubmit={handleSubmit}
      onClose={handleDismiss}
      isSubmitting={isSubmitting}
    />,
    document.body
  );
}

export default UserReviewPrompt;