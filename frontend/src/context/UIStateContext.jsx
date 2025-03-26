import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const UIStateContext = createContext();

export const UI_MODALS = {
  // Photo related modals
  CREATE_PHOTO: 'createPhoto',
  EDIT_PHOTO: 'editPhoto',
  VIEW_PHOTO: 'viewPhoto',
  PHOTO_DETAILS: 'photoDetails',
  
  // Post related modals
  CREATE_POST: 'createPost',
  EDIT_POST: 'editPost',
  
  // Collection related modals
  CREATE_COLLECTION: 'createCollection',
  EDIT_COLLECTION: 'editCollection',
  ADD_TO_COLLECTION: 'addToCollection',
  
  // Profile related modals
  EDIT_PROFILE: 'editProfile',
  USER_PREFERENCES: 'userPreferences',
  
  // Sharing related modals
  SHARE_PHOTO: 'sharePhoto',
  SHARE_POST: 'sharePost',
  SHARE_COLLECTION: 'shareCollection',
  
  // Preview modals
  IMAGE_PREVIEW: 'imagePreview',
  GALLERY_PREVIEW: 'galleryPreview',
  
  // Category related modals
  MANAGE_CATEGORIES: 'manageCategories',
  
  // Download related modals
  DOWNLOAD_OPTIONS: 'downloadOptions',
  DOWNLOAD_PROGRESS: 'downloadProgress',
};

export const UI_STATES = {
  UPLOADING: 'uploading',
  DOWNLOADING: 'downloading',
  PROCESSING: 'processing',
  SAVING: 'saving',
  LOADING_MORE: 'loadingMore',
};

export const UIStateProvider = ({ children }) => {
  // Modal states
  const [activeModals, setActiveModals] = useState(new Set());
  const [modalData, setModalData] = useState(new Map());
  
  // Scroll states
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // UI States
  const [uiStates, setUiStates] = useState(new Map());
  const [stateData, setStateData] = useState(new Map());
  
  // Refs for event listeners
  const scrollListenerRef = useRef(null);

  // Notification state
  const [notification, setNotification] = useState(null);
  const notificationTimeoutRef = useRef(null);

  // Modal management
  const openModal = useCallback((modalId, data = null) => {
    setActiveModals(prev => {
      const newModals = new Set(prev);
      newModals.add(modalId);
      return newModals;
    });
    
    if (data) {
      setModalData(prev => {
        const newData = new Map(prev);
        newData.set(modalId, data);
        return newData;
      });
    }
    
    // Lock scroll when modal opens
    setIsScrollLocked(true);
    setScrollPosition(window.scrollY);
  }, []);

  const closeModal = useCallback((modalId) => {
    setActiveModals(prev => {
      const newModals = new Set(prev);
      newModals.delete(modalId);
      return newModals;
    });
    
    setModalData(prev => {
      const newData = new Map(prev);
      newData.delete(modalId);
      return newData;
    });
    
    // Unlock scroll if no modals are open
    if (activeModals.size === 1) {
      setIsScrollLocked(false);
    }
  }, [activeModals]);

  const getModalData = useCallback((modalId) => {
    return modalData.get(modalId);
  }, [modalData]);

  // UI State management
  const setUIState = useCallback((stateId, isActive, data = null) => {
    setUiStates(prev => {
      const newStates = new Map(prev);
      if (isActive) {
        newStates.set(stateId, true);
      } else {
        newStates.delete(stateId);
      }
      return newStates;
    });

    if (data) {
      setStateData(prev => {
        const newData = new Map(prev);
        newData.set(stateId, data);
        return newData;
      });
    }
  }, []);

  const getUIState = useCallback((stateId) => {
    return {
      isActive: uiStates.has(stateId),
      data: stateData.get(stateId)
    };
  }, [uiStates, stateData]);

  // Scroll management
  useEffect(() => {
    if (isScrollLocked) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollPosition);
    }
  }, [isScrollLocked, scrollPosition]);

  // Infinite scroll helper
  const setupInfiniteScroll = useCallback((callback, options = {}) => {
    const { threshold = 100, enabled = true } = options;
    
    if (scrollListenerRef.current) {
      window.removeEventListener('scroll', scrollListenerRef.current);
    }

    if (!enabled) return;

    const handleScroll = () => {
      if (uiStates.has(UI_STATES.LOADING_MORE)) return;

      const scrolledToBottom = 
        window.innerHeight + window.scrollY >= 
        document.documentElement.scrollHeight - threshold;

      if (scrolledToBottom) {
        callback();
      }
    };

    scrollListenerRef.current = handleScroll;
    window.addEventListener('scroll', handleScroll);

    return () => {
      if (scrollListenerRef.current) {
        window.removeEventListener('scroll', scrollListenerRef.current);
      }
    };
  }, [uiStates]);

  // Show notification
  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    setNotification({ message, type });

    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, duration);
  }, []);

  // Clear notification
  const clearNotification = useCallback(() => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const value = {
    // Modal methods
    openModal,
    closeModal,
    isModalOpen: useCallback((modalId) => activeModals.has(modalId), [activeModals]),
    getModalData,
    
    // UI State methods
    setUIState,
    getUIState,
    
    // Scroll state
    isScrollLocked,
    setupInfiniteScroll,
    
    // Helper methods for common modals
    openCreatePhoto: (data) => openModal(UI_MODALS.CREATE_PHOTO, data),
    openEditPhoto: (data) => openModal(UI_MODALS.EDIT_PHOTO, data),
    openViewPhoto: (data) => openModal(UI_MODALS.VIEW_PHOTO, data),
    openPhotoDetails: (data) => openModal(UI_MODALS.PHOTO_DETAILS, data),
    openCreatePost: (data) => openModal(UI_MODALS.CREATE_POST, data),
    openEditPost: (data) => openModal(UI_MODALS.EDIT_POST, data),
    openCreateCollection: (data) => openModal(UI_MODALS.CREATE_COLLECTION, data),
    openEditCollection: (data) => openModal(UI_MODALS.EDIT_COLLECTION, data),
    openAddToCollection: (data) => openModal(UI_MODALS.ADD_TO_COLLECTION, data),
    openEditProfile: (data) => openModal(UI_MODALS.EDIT_PROFILE, data),
    openUserPreferences: (data) => openModal(UI_MODALS.USER_PREFERENCES, data),
    openSharePhoto: (data) => openModal(UI_MODALS.SHARE_PHOTO, data),
    openSharePost: (data) => openModal(UI_MODALS.SHARE_POST, data),
    openShareCollection: (data) => openModal(UI_MODALS.SHARE_COLLECTION, data),
    openImagePreview: (data) => openModal(UI_MODALS.IMAGE_PREVIEW, data),
    openGalleryPreview: (data) => openModal(UI_MODALS.GALLERY_PREVIEW, data),
    openManageCategories: (data) => openModal(UI_MODALS.MANAGE_CATEGORIES, data),
    openDownloadOptions: (data) => openModal(UI_MODALS.DOWNLOAD_OPTIONS, data),
    openDownloadProgress: (data) => openModal(UI_MODALS.DOWNLOAD_PROGRESS, data),
    
    // Helper methods for common UI states
    setUploading: (isActive, data) => setUIState(UI_STATES.UPLOADING, isActive, data),
    setDownloading: (isActive, data) => setUIState(UI_STATES.DOWNLOADING, isActive, data),
    setProcessing: (isActive, data) => setUIState(UI_STATES.PROCESSING, isActive, data),
    setSaving: (isActive, data) => setUIState(UI_STATES.SAVING, isActive, data),
    setLoadingMore: (isActive, data) => setUIState(UI_STATES.LOADING_MORE, isActive, data),
    
    // Notification methods
    showNotification,
    clearNotification,
    notification,
  };

  return (
    <UIStateContext.Provider value={value}>
      {children}
      {notification && (
        <div 
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === 'error' ? 'bg-red-500' :
            notification.type === 'success' ? 'bg-green-500' :
            notification.type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
          } text-white`}
        >
          {notification.message}
          <button
            onClick={clearNotification}
            className="ml-2 text-white hover:text-gray-200"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}
    </UIStateContext.Provider>
  );
};

export const useUIState = () => {
  const context = useContext(UIStateContext);
  if (!context) {
    throw new Error('useUIState must be used within a UIStateProvider');
  }
  return context;
}; 