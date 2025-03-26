import React, { createContext, useContext, useCallback, useRef } from 'react';

const DataSyncContext = createContext();

// Event types for different data operations
export const SYNC_EVENTS = {
  // Photos
  PHOTO_CREATED: 'photo:created',
  PHOTO_UPDATED: 'photo:updated',
  PHOTO_DELETED: 'photo:deleted',
  PHOTO_LIKED: 'photo:liked',
  PHOTO_UNLIKED: 'photo:unliked',
  PHOTO_DOWNLOADED: 'photo:downloaded',
  PHOTOS_LOADED: 'photos:loaded',
  
  // Posts
  POST_CREATED: 'post:created',
  POST_UPDATED: 'post:updated',
  POST_DELETED: 'post:deleted',
  
  // Comments
  COMMENT_CREATED: 'comment:created',
  COMMENT_UPDATED: 'comment:updated',
  COMMENT_DELETED: 'comment:deleted',
  
  // Likes
  LIKE_TOGGLED: 'like:toggled',
  
  // Collections
  COLLECTION_CREATED: 'collection:created',
  COLLECTION_UPDATED: 'collection:updated',
  COLLECTION_DELETED: 'collection:deleted',
  COLLECTION_ITEM_ADDED: 'collection:item:added',
  COLLECTION_ITEM_REMOVED: 'collection:item:removed',
  
  // Categories
  CATEGORY_CREATED: 'category:created',
  CATEGORY_UPDATED: 'category:updated',
  CATEGORY_DELETED: 'category:deleted',
  
  // Followers
  FOLLOWER_ADDED: 'follower:added',
  FOLLOWER_REMOVED: 'follower:removed',
  
  // Downloads
  DOWNLOAD_STARTED: 'download:started',
  DOWNLOAD_COMPLETED: 'download:completed',
  DOWNLOAD_FAILED: 'download:failed',
  
  // User
  USER_UPDATED: 'user:updated',
  USER_PREFERENCES_CHANGED: 'user:preferences:changed',
};

export const DataSyncProvider = ({ children }) => {
  // Using useRef for subscribers to maintain reference across renders
  const subscribers = useRef(new Map()).current;
  const batchUpdates = useRef(new Map()).current;
  const batchTimeout = useRef(null);

  // Subscribe to data changes
  const subscribe = useCallback((eventType, callback) => {
    if (!subscribers.has(eventType)) {
      subscribers.set(eventType, new Set());
    }
    subscribers.get(eventType).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = subscribers.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          subscribers.delete(eventType);
        }
      }
    };
  }, []);

  // Batch notifications to prevent multiple re-renders
  const processBatchUpdates = useCallback(() => {
    batchUpdates.forEach((data, eventType) => {
      const callbacks = subscribers.get(eventType);
      if (callbacks) {
        callbacks.forEach(callback => callback(data));
      }
    });
    batchUpdates.clear();
  }, []);

  // Notify all subscribers of a data change
  const notify = useCallback((eventType, data) => {
    batchUpdates.set(eventType, data);
    
    // Clear existing timeout
    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current);
    }
    
    // Process batch updates in next tick
    batchTimeout.current = setTimeout(processBatchUpdates, 0);
  }, [processBatchUpdates]);

  // Helper functions for common operations
  const notifyPhotoChange = useCallback((type, photoData) => {
    notify(type, photoData);
  }, [notify]);

  const notifyPostChange = useCallback((type, postData) => {
    notify(type, postData);
  }, [notify]);

  const notifyCommentChange = useCallback((type, commentData) => {
    notify(type, commentData);
  }, [notify]);

  const notifyLikeChange = useCallback((likeData) => {
    notify(SYNC_EVENTS.LIKE_TOGGLED, likeData);
  }, [notify]);

  const notifyCollectionChange = useCallback((type, collectionData) => {
    notify(type, collectionData);
  }, [notify]);

  const notifyCategoryChange = useCallback((type, categoryData) => {
    notify(type, categoryData);
  }, [notify]);

  const notifyDownloadChange = useCallback((type, downloadData) => {
    notify(type, downloadData);
  }, [notify]);

  const notifyUserChange = useCallback((type, userData) => {
    notify(type, userData);
  }, [notify]);

  const value = {
    // Subscribe to data changes
    subscribe,
    
    // Photo operations
    onPhotoCreated: (data) => notifyPhotoChange(SYNC_EVENTS.PHOTO_CREATED, data),
    onPhotoUpdated: (data) => notifyPhotoChange(SYNC_EVENTS.PHOTO_UPDATED, data),
    onPhotoDeleted: (data) => notifyPhotoChange(SYNC_EVENTS.PHOTO_DELETED, data),
    onPhotoLiked: (data) => notifyPhotoChange(SYNC_EVENTS.PHOTO_LIKED, data),
    onPhotoUnliked: (data) => notifyPhotoChange(SYNC_EVENTS.PHOTO_UNLIKED, data),
    onPhotoDownloaded: (data) => notifyPhotoChange(SYNC_EVENTS.PHOTO_DOWNLOADED, data),
    onPhotosLoaded: (data) => notifyPhotoChange(SYNC_EVENTS.PHOTOS_LOADED, data),
    
    // Post operations
    onPostCreated: (data) => notifyPostChange(SYNC_EVENTS.POST_CREATED, data),
    onPostUpdated: (data) => notifyPostChange(SYNC_EVENTS.POST_UPDATED, data),
    onPostDeleted: (data) => notifyPostChange(SYNC_EVENTS.POST_DELETED, data),
    
    // Comment operations
    onCommentCreated: (data) => notifyCommentChange(SYNC_EVENTS.COMMENT_CREATED, data),
    onCommentUpdated: (data) => notifyCommentChange(SYNC_EVENTS.COMMENT_UPDATED, data),
    onCommentDeleted: (data) => notifyCommentChange(SYNC_EVENTS.COMMENT_DELETED, data),
    
    // Like operations
    onLikeToggled: (data) => notifyLikeChange(data),
    
    // Collection operations
    onCollectionCreated: (data) => notifyCollectionChange(SYNC_EVENTS.COLLECTION_CREATED, data),
    onCollectionUpdated: (data) => notifyCollectionChange(SYNC_EVENTS.COLLECTION_UPDATED, data),
    onCollectionDeleted: (data) => notifyCollectionChange(SYNC_EVENTS.COLLECTION_DELETED, data),
    onCollectionItemAdded: (data) => notifyCollectionChange(SYNC_EVENTS.COLLECTION_ITEM_ADDED, data),
    onCollectionItemRemoved: (data) => notifyCollectionChange(SYNC_EVENTS.COLLECTION_ITEM_REMOVED, data),
    
    // Category operations
    onCategoryCreated: (data) => notifyCategoryChange(SYNC_EVENTS.CATEGORY_CREATED, data),
    onCategoryUpdated: (data) => notifyCategoryChange(SYNC_EVENTS.CATEGORY_UPDATED, data),
    onCategoryDeleted: (data) => notifyCategoryChange(SYNC_EVENTS.CATEGORY_DELETED, data),
    
    // Download operations
    onDownloadStarted: (data) => notifyDownloadChange(SYNC_EVENTS.DOWNLOAD_STARTED, data),
    onDownloadCompleted: (data) => notifyDownloadChange(SYNC_EVENTS.DOWNLOAD_COMPLETED, data),
    onDownloadFailed: (data) => notifyDownloadChange(SYNC_EVENTS.DOWNLOAD_FAILED, data),
    
    // User operations
    onUserUpdated: (data) => notifyUserChange(SYNC_EVENTS.USER_UPDATED, data),
    onUserPreferencesChanged: (data) => notifyUserChange(SYNC_EVENTS.USER_PREFERENCES_CHANGED, data),
  };

  return (
    <DataSyncContext.Provider value={value}>
      {children}
    </DataSyncContext.Provider>
  );
};

export const useDataSync = () => {
  const context = useContext(DataSyncContext);
  if (!context) {
    throw new Error('useDataSync must be used within a DataSyncProvider');
  }
  return context;
}; 