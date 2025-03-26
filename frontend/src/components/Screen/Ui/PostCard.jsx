import React, { useState } from 'react';
import {
  FaTimes,
  FaHeart,
  FaComment,
  FaDownload,
  FaTrash,
} from "react-icons/fa";
import { useLoading } from '../../../context/LoadingContext';
import { useUIState } from '../../../context/UIStateContext';
import { useDataSync } from '../../../context/DataSyncContext';
import { useAuth } from '../../../context/AuthContext';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useNavigate } from 'react-router-dom';
import  likesManager  from '../../../api/features/likes/manage';
import downloadsManager from '../../../api/features/downloads/manage';
import  photosManager  from '../../../api/features/photos/manage';

// Action button component
const ActionButton = ({ onClick, icon: Icon, count, label }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1 text-black hover:text-gray-600 transition-colors"
    title={label}
  >
    <Icon className="w-5 h-5" />
    {count !== undefined && <span>{count}</span>}
  </button>
);

const PostCard = ({ post, onDelete, isDownloadedPhoto, onPhotoClick }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [liked, setLiked] = useState(post?.is_liked || false);
  
  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useUIState();
  const { updatePhotoStats, removePhoto } = useDataSync();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!post) {
    console.error('Invalid post data received:', post);
    return null;
  }

  const handleAction = async (action, handler) => {
    if (!user) {
      showNotification(`Please login to ${action} photos`, 'info');
      return;
    }

    try {
      showLoading();
      await handler();
    } catch (error) {
      showNotification(`Failed to ${action} photo`, 'error');
      console.error(`Error ${action}ing photo:`, error);
    } finally {
      hideLoading();
    }
  };

  const handleLike = (e) => {
    e.preventDefault();
    handleAction('like', async () => {
      await likesManager.toggle(post.id);
      setLiked(!liked);
      updatePhotoStats({ type: 'like', photoId: post.id, value: !liked ? 1 : -1 });
    });
  };

  const handleDownload = (e) => {
    e.preventDefault();
    handleAction('download', async () => {
      await downloadsManager.downloadPhoto(post.id);
      updatePhotoStats({ type: 'download', photoId: post.id, value: 1 });
      showNotification('Photo downloaded successfully', 'success');
    });
  };

  const handleDelete = async () => {
    try {
      showLoading();
      await photoManager.deletePhoto(post.id);
      setIsDeleteModalOpen(false);
      removePhoto(post.id);
      if (onDelete) onDelete(post.id);
      showNotification('Photo deleted successfully', 'success');
    } catch (error) {
      showNotification('Failed to delete photo', 'error');
      console.error('Error deleting photo:', error);
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <div 
        key={`${post.username}-${post.upload_date}`} 
        className="mb-4 group relative overflow-hidden border-2 border-black cursor-pointer"
        onClick={() => onPhotoClick(post)}
      >
        {/* Image Container */}
        <div className="w-full">
          <img
            src={post.image}
            alt={post.title}
            className="w-full object-contain bg-white"
            style={{ maxHeight: '80vh' }}
          />
        </div>

        {/* Details Panel - Slides up from bottom on hover */}
        <div className="absolute inset-x-0 bottom-0 bg-white transform translate-y-full transition-transform duration-300 ease-in-out group-hover:translate-y-0">
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-black">{post.title}</h3>
              {user && (
                <ActionButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteModalOpen(true);
                  }}
                  icon={isDownloadedPhoto ? FaTrash : FaTimes}
                  label={isDownloadedPhoto ? "Remove from downloads" : "Delete photo"}
                />
              )}
            </div>
            
            <p className="text-sm text-black mb-2 line-clamp-2">{post.description}</p>
            
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <ActionButton
                  onClick={handleLike}
                  icon={FaHeart}
                  count={post.likes_count || 0}
                  label="Like photo"
                />
                <ActionButton
                  onClick={handleDownload}
                  icon={FaDownload}
                  count={post.downloads_count || 0}
                  label="Download photo"
                />
                <ActionButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onPhotoClick(post);
                  }}
                  icon={FaComment}
                  count={post.comments_count || 0}
                  label="View comments"
                />
              </div>
              <span className="text-sm text-gray-500">
                {new Date(post.upload_date).toLocaleDateString()}
              </span>
            </div>

            {post.ai_tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.ai_tags.slice(0, 4).map((tag, index) => (
                  <span 
                    key={index} 
                    className="text-xs bg-black text-white px-2 py-0.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
                {post.ai_tags.length > 4 && (
                  <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">
                    +{post.ai_tags.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isDownloadedPhoto={isDownloadedPhoto}
      />
    </>
  );
};

export default PostCard; 