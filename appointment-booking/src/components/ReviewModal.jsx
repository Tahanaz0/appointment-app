import { useState } from "react";
import "./ReviewModal.css";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
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
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <div key={star} className="star-wrapper">
                {/* Left Half */}
                <span
                  className="half-star left"
                  onClick={() =>
                    setReviewForm({
                      ...reviewForm,
                      rating: star - 0.5,
                    })
                  }
                />

                {/* Right Half */}
                <span
                  className="half-star right"
                  onClick={() =>
                    setReviewForm({
                      ...reviewForm,
                      rating: star,
                    })
                  }
                />

                {reviewForm.rating >= star ? (
                  <FaStar className="star filled" />
                ) : reviewForm.rating >= star - 0.5 ? (
                  <FaStarHalfAlt className="star filled" />
                ) : (
                  <FaRegStar className="star" />
                )}
              </div>
            ))}
          </div>
          <span className="rating-value">{reviewForm.rating} / 5</span>
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
          <button
            type="button"
            className="review-dismiss-btn"
            onClick={onClose}
          >
            Maybe later
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReviewModal;
