import React, { useState, memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaRegHeart, FaHeart, FaUsers } from 'react-icons/fa';
import { useLoading } from '../../../context/LoadingContext';
import { useUIState } from '../../../context/UIStateContext';
import { CollectionsManager } from '../../../api/features/collection/manage';

const CollectionCard = memo(({ collection, onUpdate }) => {
  const [liked, setLiked] = useState(collection.is_liked || false);
  const [followed, setFollowed] = useState(collection.is_followed || false);
  const [likesCount, setLikesCount] = useState(collection.likes_count || 0);
  const [followersCount, setFollowersCount] = useState(collection.followers_count || 0);
  
  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useUIState();
  const collectionsManager = new CollectionsManager();
  
  const {
    id,
    name,
    description,
    is_public,
    created_at,
    photo_count = 0
  } = collection;

  const handleLike = useCallback(async (e) => {
    e.preventDefault(); // Prevent navigation
    try {
      showLoading();
      const response = await collectionsManager.likeCollection(id);
      
      if (response?.success) {
        setLiked(prev => !prev);
        setLikesCount(prev => liked ? prev - 1 : prev + 1);
        showNotification(liked ? 'Collection unliked' : 'Collection liked', 'success');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      showNotification('Failed to update like status', 'error');
    } finally {
      hideLoading();
      if (onUpdate) onUpdate();
    }
  }, [id, liked, showLoading, hideLoading, showNotification, onUpdate]);

  const handleFollow = useCallback(async (e) => {
    e.preventDefault(); // Prevent navigation
    try {
      showLoading();
      const response = await collectionsManager.followCollection(id);
      
      if (response?.success) {
        setFollowed(prev => !prev);
        setFollowersCount(prev => followed ? prev - 1 : prev + 1);
        showNotification(
          followed ? 'Unfollowed collection' : 'Following collection', 
          'success'
        );
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      showNotification('Failed to update follow status', 'error');
    } finally {
      hideLoading();
      if (onUpdate) onUpdate();
    }
  }, [id, followed, showLoading, hideLoading, showNotification, onUpdate]);

  const formattedDate = new Date(created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="h-full">
      <Link 
        to={`/collections/${id}`}
        className="border-2 border-black p-4 group hover:bg-black transition-all duration-300 h-full flex flex-col"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-transparent">
          <h3 className="text-lg font-semibold text-black group-hover:text-white truncate bg-transparent">
            {name}
          </h3>
          <span className="text-xs text-black group-hover:text-white bg-transparent">
            {formattedDate}
          </span>
        </div>
        {description && (
          <p className="mt-1 text-sm text-black group-hover:text-white line-clamp-2 bg-transparent flex-grow">
            {description}
          </p>
        )}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-black group-hover:text-white bg-transparent">
          <div className="flex items-center gap-2 bg-transparent">
            <span 
              className="text-black group-hover:text-white bg-transparent"
              aria-label={is_public ? "Public collection" : "Private collection"}
            >
              {is_public ? "Public" : "Private"}
            </span>
          </div>
          <div className="flex items-center gap-4 bg-transparent">
            <span 
              className="flex items-center gap-1 bg-transparent"
              aria-label={`${photo_count} photos`}
            >
              <span className="text-black group-hover:text-white bg-transparent">📁</span>
              <span className="bg-transparent">{photo_count}</span>
            </span>
            <button 
              onClick={handleLike}
              className="flex items-center gap-1 bg-transparent"
              aria-label={liked ? "Unlike collection" : "Like collection"}
            >
              {liked ? (
                <FaHeart className="h-4 w-4 text-black group-hover:text-white bg-transparent" />
              ) : (
                <FaRegHeart className="h-4 w-4 text-black group-hover:text-white bg-transparent" />
              )}
              <span className="bg-transparent">{likesCount}</span>
            </button>
            <button
              onClick={handleFollow}
              className="flex items-center gap-1 bg-transparent"
              aria-label={followed ? "Unfollow collection" : "Follow collection"}
            >
              <FaUsers className={`h-4 w-4 text-black group-hover:text-white bg-transparent ${followed ? 'fill-current' : ''}`} />
              <span className="bg-transparent">{followersCount}</span>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
});

CollectionCard.propTypes = {
  collection: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    is_public: PropTypes.bool.isRequired,
    likes_count: PropTypes.number,
    followers_count: PropTypes.number,
    created_at: PropTypes.string.isRequired,
    photo_count: PropTypes.number,
    is_liked: PropTypes.bool,
    is_followed: PropTypes.bool
  }).isRequired,
  onUpdate: PropTypes.func
};

CollectionCard.displayName = 'CollectionCard';

export default CollectionCard; 