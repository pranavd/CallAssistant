// src/components/Modal.jsx
import React from 'react';

const Modal = ({ isVisible, onClose, children }) => {
    if (!isVisible) return null;

    const handleClose = (e) => {
        if (e.target.id === 'wrapper') onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleClose}
            id="wrapper"
        >
            <div className="bg-white p-6 rounded-lg shadow-xl relative w-full max-w-md">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                    onClick={onClose}
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;