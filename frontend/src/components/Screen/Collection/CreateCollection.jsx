import React, { useState, useEffect, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { FaTimes } from 'react-icons/fa';

// Local imports
import { CollectionsManager } from '../../../api/features/collection/manage';
import { useAuth } from '../../../context/AuthContext';
import { useLoading } from '../../../context/LoadingContext';
import { useUIState } from '../../../context/UIStateContext';

// Constants
const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 500;

// Modal styles configuration
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 49,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  content: {
    position: 'relative',
    background: '#ffffff',
    border: 'none',
    padding: 0,
    width: '100%',
    maxWidth: '800px',
    maxHeight: '90vh',
    margin: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50
  }
};

// Initialize Modal
Modal.setAppElement('#root');

/**
 * CreateCollection Component
 * A modal form for creating new collections with validation and error handling
 */
const CreateCollection = memo(({ isOpen, onClose, onSuccess }) => {
  // Hooks
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useUIState();
  const collectionsManager = new CollectionsManager();

  // State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effects
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        is_public: true
      });
      setErrors({});
    }
  }, [isOpen]);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    const { name, description } = formData;

    if (!name.trim()) {
      newErrors.name = 'Collection name is required';
    } else if (name.length < MIN_NAME_LENGTH) {
      newErrors.name = `Collection name must be at least ${MIN_NAME_LENGTH} characters`;
    } else if (name.length > MAX_NAME_LENGTH) {
      newErrors.name = `Collection name cannot exceed ${MAX_NAME_LENGTH} characters`;
    }

    if (description && description.length > MAX_DESCRIPTION_LENGTH) {
      newErrors.description = `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Event Handlers
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear specific field error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting || !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      showLoading();
      
      const response = await collectionsManager.createCollection({
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim()
      });

      if (response?.success) {
        showNotification('Collection created successfully', 'success');
        window.dispatchEvent(new Event('collectionsUpdated'));
        if (onSuccess) onSuccess(response.data);
        onClose();
        navigate(`/profile/${user.username}`);
      } else {
        throw new Error('Failed to create collection');
      }
    } catch (err) {
      const errorMessage = err.error || err.message || 'Failed to create collection';
      setErrors(prev => ({
        ...prev,
        submit: errorMessage
      }));
      showNotification(errorMessage, 'error');
      console.error('Collection creation error:', err);
    } finally {
      hideLoading();
      setIsSubmitting(false);
    }
  };

  // Render Methods
  const renderFormFields = () => (
    <div className="space-y-4">
      {/* Name Field */}
      <div>
        <label className="block mb-2 font-bold text-black">
          Collection Name
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full mt-1 px-3 py-2 border-2 ${
              errors.name ? 'border-red-500' : 'border-black'
            } focus:outline-none text-black placeholder-gray-500`}
            required
            minLength={MIN_NAME_LENGTH}
            maxLength={MAX_NAME_LENGTH}
            placeholder={`Enter collection name (${MIN_NAME_LENGTH}-${MAX_NAME_LENGTH} characters)`}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
        </label>
        {errors.name && (
          <p id="name-error" className="mt-1 text-red-500 text-sm">
            {errors.name}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label className="block mb-2 font-bold text-black">
          Description
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full mt-1 px-3 py-2 border-2 ${
              errors.description ? 'border-red-500' : 'border-black'
            } focus:outline-none resize-none h-20 text-black placeholder-gray-500`}
            placeholder="Enter collection description (optional)"
            maxLength={MAX_DESCRIPTION_LENGTH}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
        </label>
        {errors.description && (
          <p id="description-error" className="mt-1 text-red-500 text-sm">
            {errors.description}
          </p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {formData.description.length}/{MAX_DESCRIPTION_LENGTH} characters
        </p>
      </div>

      {/* Privacy Toggle */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_public"
          name="is_public"
          checked={formData.is_public}
          onChange={handleChange}
          className="h-4 w-4 text-black border-2 border-black rounded focus:ring-black focus:ring-offset-0 checked:bg-black checked:border-black appearance-none checked:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M16.707%205.293a1%201%200%20010%201.414l-8%208a1%201%200%2001-1.414%200l-4-4a1%201%200%20011.414-1.414L8%2012.586l7.293-7.293a1%201%200%20011.414%200z%22%2F%3E%3C%2Fsvg%3E')] checked:bg-center checked:bg-no-repeat checked:bg-[length:16px_16px]"
          aria-label="Make collection public"
        />
        <label htmlFor="is_public" className="ml-2 block text-sm text-black">
          Make collection public
        </label>
      </div>
    </div>
  );

  const renderButtons = () => (
    <div className="mt-8 flex flex-col sm:flex-row justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="w-full sm:w-auto px-4 py-2 border-2 border-black text-black hover:bg-black hover:text-white transition-all duration-300"
        disabled={isSubmitting}
      >
        Cancel
      </button>
      <button
        type="submit"
        className="w-full sm:w-auto px-4 py-2 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating...' : 'Create Collection'}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 flex items-center justify-center p-4 z-[50]"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-[49]"
      style={modalStyles}
      contentLabel="Create Collection Modal"
    >
      <div className="w-full bg-white border-2 border-black overflow-y-scroll no-scrollbar">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b-2 border-black sticky z-10 top-0 bg-white">
          <h2 className="text-xl font-bold text-black">Create Collection</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:text-gray-600"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <FaTimes className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          {errors.submit && (
            <div className="mb-4 p-3 border-2 border-red-500 text-red-500 bg-red-50">
              {errors.submit}
            </div>
          )}

          {renderFormFields()}
          {renderButtons()}
        </form>
      </div>
    </Modal>
  );
});

// PropTypes
CreateCollection.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};

CreateCollection.displayName = 'CreateCollection';

export default CreateCollection; 