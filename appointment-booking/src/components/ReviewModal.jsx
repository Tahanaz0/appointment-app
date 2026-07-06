import { useState } from "react";
import "./ReviewModal.css";

function ReviewModal({ appointment, user, onSubmit, onClose, isSubmitting }) {
  const [reviewForm, setReviewForm] = useState({
    name: user?.displayName || appointment?.name || "",
    rating: 5,
    text: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!appointment || !onSubmit) {
      return;
    }

    try {
      setError("");
      await onSubmit(appointment, {
        ...reviewForm,
        name: reviewForm.name.trim() || appointment.name || "Customer",
        text: reviewForm.text.trim(),
      });
      
      onClose();
    } catch (submitError) {
      console.error(submitError);
      setError("Unable to submit review. Please try again.");
    }
  };

  return (
    <div
      className="review-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <form
        className="review-modal"
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="review-modal-close"
          onClick={onClose}
          aria-label="Close review modal"
        >
          ×
        </button>

        <div className="review-modal-header">
          <span>Service completed</span>
          <h3>Rate your visit</h3>
          <p>
            {appointment.service || "Your service"} with{" "}
            {appointment.barber || appointment.doctor || "GentleCuts"}
          </p>
        </div>

        <label>
          Your name
          <input
            type="text"
            value={reviewForm.name}
            onChange={(event) =>
              setReviewForm({ ...reviewForm, name: event.target.value })
            }
            placeholder="Customer name"
          />
        </label>

        <label>
          Rating
          <select
            value={reviewForm.rating}
            onChange={(event) =>
              setReviewForm({ ...reviewForm, rating: Number(event.target.value) })
            }
          >
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </label>

        <label>
          Review
          <textarea
            required
            rows="4"
            value={reviewForm.text}
            onChange={(event) =>
              setReviewForm({ ...reviewForm, text: event.target.value })
            }
            placeholder="Apna experience likhein"
          />
        </label>

        {error && <p className="review-modal-error">{error}</p>}

        <div className="review-modal-actions">
          <button
            type="submit"
            className="review-submit-modal-btn"
            disabled={isSubmitting || !reviewForm.text.trim()}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
          <button type="button" className="review-dismiss-btn" onClick={onClose}>
            Maybe later
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReviewModal;
