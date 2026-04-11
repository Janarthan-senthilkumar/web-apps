import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-icon danger">
                    <HiOutlineExclamationTriangle />
                </div>
                <h3 className="modal-title">{title || 'Confirm Delete'}</h3>
                <p className="modal-message">{message || 'Are you sure you want to delete this item? This action cannot be undone.'}</p>
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                    <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
