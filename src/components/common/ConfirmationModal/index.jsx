import React, { useState, useEffect } from 'react';
import './styles.css';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    requireInput = '', // If provided, user must type this exact string to confirm
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = true
}) => {
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (isOpen) {
            setInputValue('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isButtonDisabled = requireInput && inputValue !== requireInput;

    const handleConfirm = () => {
        if (isButtonDisabled) return;
        onConfirm();
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">{title}</h3>
                <p className="modal-message">{message}</p>

                {requireInput && (
                    <div className="modal-input-group">
                        <label>
                            Type <strong>{requireInput}</strong> to confirm:
                        </label>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={requireInput}
                            autoFocus
                            className="modal-input"
                        />
                    </div>
                )}

                <div className="modal-actions">
                    <button className="btn-modal-cancel" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button
                        className={`btn-modal-confirm ${isDestructive ? 'destructive' : ''}`}
                        onClick={handleConfirm}
                        disabled={isButtonDisabled}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
