import React, { useEffect, useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { CollectionsManager } from '../../../api/features/collection/manage';
import CollectionSlider from './CollectionSlider';
import LoadingOverlay from '../../Screen/Common/LoadingOverlay';
import { useLoading } from '../../../context/LoadingContext';
import { useUIState } from '../../../context/UIStateContext';

const CollectionList = memo(({ userId, username, isModalOpen }) => {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useUIState();
  const collectionsManager = new CollectionsManager();

  const fetchCollections = useCallback(async () => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    try {
      setIsLoading(true);
      showLoading();
      setError(null);

      const response = await collectionsManager.getUserCollections(userId);
      const data = response?.data || [];
      
      setCollections(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err.response?.status === 404 ? 'No collections found' :
                          err.response?.status === 403 ? 'Access denied' :
                          'Failed to fetch collections. Please try again later.';
      
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      setCollections([]);
      console.error('Error fetching collections:', err);
    } finally {
      hideLoading();
      setIsLoading(false);
    }
  }, [userId, showLoading, hideLoading, showNotification]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  if (isLoading) return <LoadingOverlay />;
  
  if (error) {
    return (
      <div className="text-center py-8 text-black border-2 border-black p-4" role="alert">
        {error}
      </div>
    );
  }

  if (!collections.length) {
    return (
      <div className="text-center py-8 text-gray-500" role="status">
        No collections found
      </div>
    );
  }

  return (
    <div className="w-full">
      <CollectionSlider 
        collections={collections} 
        title={`${username}'s Collections`}
        isModalOpen={isModalOpen}
        onCollectionUpdate={fetchCollections}
      />
    </div>
  );
});

CollectionList.propTypes = {
  userId: PropTypes.number.isRequired,
  username: PropTypes.string.isRequired,
  isModalOpen: PropTypes.bool
};

CollectionList.displayName = 'CollectionList';

export default CollectionList;
