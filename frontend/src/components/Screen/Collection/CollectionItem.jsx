import React, { useState, memo, useCallback } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaUserPlus, FaUserMinus } from "react-icons/fa";
import { formatCollectionData } from "../../../api/utils/features/collectionUtils";
import { useLoading } from '../../../context/LoadingContext';
import { useUIState } from '../../../context/UIStateContext';
import { CollectionsManager } from '../../../api/features/collections/manage';

const CollectionItem = memo(({ collection, onUpdate }) => {
  const [liked, setLiked] = useState(collection.is_liked || false);
  const [followed, setFollowed] = useState(collection.is_followed || false);
  const [likesCount, setLikesCount] = useState(collection.likes_count || 0);
  const [followersCount, setFollowersCount] = useState(collection.followers_count || 0);
  
  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useUIState();
  const collectionsManager = new CollectionsManager();
  const formattedCollection = formatCollectionData(collection);

  const toggleLike = useCallback(async () => {
    try {
      showLoading();
      const response = await collectionsManager.likeCollection(formattedCollection.id);
      
      if (response?.success) {
        setLiked(prev => !prev);
        setLikesCount(prev => liked ? prev - 1 : prev + 1);
        showNotification(
          liked ? 'Collection unliked' : 'Collection liked',
          'success'
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      showNotification('Failed to update like status', 'error');
    } finally {
      hideLoading();
      if (onUpdate) onUpdate();
    }
  }, [formattedCollection.id, liked, showLoading, hideLoading, showNotification, onUpdate]);

  const toggleFollow = useCallback(async () => {
    try {
      showLoading();
      const response = await collectionsManager.followCollection(formattedCollection.id);
      
      if (response?.success) {
        setFollowed(prev => !prev);
        setFollowersCount(prev => followed ? prev - 1 : prev + 1);
        showNotification(
          followed ? 'Unfollowed collection' : 'Following collection',
          'success'
        );
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      showNotification('Failed to update follow status', 'error');
    } finally {
      hideLoading();
      if (onUpdate) onUpdate();
    }
  }, [formattedCollection.id, followed, showLoading, hideLoading, showNotification, onUpdate]);

  return (
    <div className="border-2 border-black p-4 group hover:bg-black transition-all duration-300">
      <Link 
        to={`/collections/${formattedCollection.id}`} 
        className="block"
        aria-label={`View ${formattedCollection.title} collection`}
      >
        <h3 className="text-lg font-bold mb-2 text-black group-hover:text-white bg-transparent">
          {formattedCollection.title}
        </h3>
      </Link>
      
      <p className="text-black mb-4 line-clamp-2 group-hover:text-white bg-transparent">
        {formattedCollection.description || "No description"}
      </p>

      <div className="flex justify-between items-center text-sm text-black group-hover:text-white bg-transparent">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLike}
            className="flex items-center gap-1 group-hover:text-white transition-colors bg-transparent"
            aria-label={liked ? "Unlike collection" : "Like collection"}
          >
            {liked ? (
              <FaHeart className="text-black group-hover:text-white" aria-hidden="true" />
            ) : (
              <FaRegHeart className="group-hover:text-white" aria-hidden="true" />
            )}
            <span className="bg-transparent">{likesCount}</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFollow}
            className="flex items-center gap-1 group-hover:text-white transition-colors bg-transparent"
            aria-label={followed ? "Unfollow collection" : "Follow collection"}
          >
            {followed ? (
              <FaUserMinus className="text-black group-hover:text-white" aria-hidden="true" />
            ) : (
              <FaUserPlus className="group-hover:text-white" aria-hidden="true" />
            )}
            <span className="bg-transparent">{followersCount}</span>
          </button>
        </div>
      </div>

      <div className="text-sm text-black mt-2 group-hover:text-white bg-transparent">
        <span 
          className="text-black group-hover:text-white bg-transparent"
          aria-label={formattedCollection.isPublic ? "Public collection" : "Private collection"}
        >
          {formattedCollection.isPublic ? "Public" : "Private"}
        </span>
        <span className="ml-4 bg-transparent">
          Created on {formattedCollection.createdAt.toLocaleDateString()}
        </span>
      </div>

      {formattedCollection.coverPhoto && (
        <div className="mt-4">
          <img
            src={formattedCollection.coverPhoto}
            alt={`Cover for ${formattedCollection.title}`}
            className="w-full h-48 object-cover border-2 border-black"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
});

CollectionItem.propTypes = {
  collection: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    is_public: PropTypes.bool.isRequired,
    likes_count: PropTypes.number,
    followers_count: PropTypes.number,
    created_at: PropTypes.string.isRequired,
    cover_photo: PropTypes.string,
    is_liked: PropTypes.bool,
    is_followed: PropTypes.bool
  }).isRequired,
  onUpdate: PropTypes.func
};

CollectionItem.displayName = 'CollectionItem';

export default CollectionItem; 