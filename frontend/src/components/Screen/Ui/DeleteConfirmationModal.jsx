import React, { useEffect } from 'react';
import Modal from 'react-modal';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    position: 'relative',
    background: '#ffffff',
    border: '2px solid #000000',
    padding: '0',
    width: '100%',
    maxWidth: '500px',
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column'
  }
};

Modal.setAppElement('#root');

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isDownloadedPhoto }) => {
  // Handle body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error during deletion:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={modalStyles}
      contentLabel="Delete Confirmation"
    >
      <div className="p-4 border-b-2 border-black flex justify-between items-center">
        <div className="flex items-center gap-2 text-black">
          <FaExclamationTriangle className="text-red-500" />
          <h2 className="text-xl font-bold">
            {isDownloadedPhoto ? 'Remove from Downloads' : 'Delete Photo'}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:text-gray-600"
          aria-label="Close modal"
        >
          <FaTimes className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4">
        <p className="text-black mb-4">
          {isDownloadedPhoto
            ? 'Are you sure you want to remove this photo from your downloads?'
            : 'Are you sure you want to delete this photo? This action cannot be undone.'}
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border-2 border-black text-black hover:bg-black hover:text-white transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-500 text-white border-2 border-red-500 hover:bg-white hover:text-red-500 transition-all duration-300"
          >
            {isDownloadedPhoto ? 'Remove' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal; 