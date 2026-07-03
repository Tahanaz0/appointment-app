function DeleteConfirmationModal({ itemType, itemName, onCancel, onConfirm }) {
  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal admin-delete-modal">
        <div className="admin-modal-header">
          <h3>Confirm Delete</h3>
        </div>
        <p className="admin-delete-message">
          {itemType === "barber"
            ? `Are you sure you want to delete ${itemName}?`
            : "Are you sure you want to delete this booking?"}
        </p>
        <div className="admin-modal-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="admin-delete-confirm-btn" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;
