import React, { useState, useEffect } from 'react';
import { FaTimes, FaHeart, FaRegHeart, FaDownload, FaUserCircle } from 'react-icons/fa';
import { useLoading } from '../../../context/LoadingContext';
import { useUIState } from '../../../context/UIStateContext';
import { useDataSync } from '../../../context/DataSyncContext';
import { useAuth } from '../../../context/AuthContext';
import  likesManager  from '../../../api/features/likes/manage';
import  downloadsManager from '../../../api/features/downloads/manage';
import  commentsManager  from '../../../api/features/comments/manage';
import  photosManager  from '../../../api/features/photos/manage';

// Components
const CommentItem = ({ comment }) => (
  <div className="flex gap-3 border-b-2 border-black pb-4">
    {comment.userProfilePic ? (
      <img
        src={comment.userProfilePic}
        alt={comment.username}
        className="w-10 h-10 rounded-full border-2 border-black object-cover"
      />
    ) : (
      <FaUserCircle className="w-10 h-10 text-black" />
    )}
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <span className="font-bold text-black">{comment.username}</span>
        <span className="text-sm text-gray-500">{comment.timestamp}</span>
      </div>
      <p className="text-black mt-1">{comment.text}</p>
    </div>
  </div>
);

const PhotoStats = ({ photo, liked, onLike, onDownload }) => (
  <div className="flex items-center space-x-4">
    <button
      onClick={onLike}
      className="flex items-center space-x-1 text-black hover:text-gray-600"
    >
      {liked ? <FaHeart /> : <FaRegHeart />}
      <span>{photo.likes_count || 0}</span>
    </button>
    <button
      onClick={onDownload}
      className="flex items-center space-x-1 text-black hover:text-gray-600"
    >
      <FaDownload />
      <span>{photo.downloads_count || 0}</span>
    </button>
  </div>
);

const PhotoTags = ({ tags }) => {
  if (!tags?.length) return null;
  
  return (
    <div className="mt-4">
      <h4 className="font-bold text-black mb-2">Tags:</h4>
      <div className="flex flex-wrap gap-2">
        {tags.slice(0, 4).map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-100 text-black border-2 border-black text-sm"
          >
            {tag}
          </span>
        ))}
        {tags.length > 4 && (
          <span className="px-2 py-1 bg-gray-100 text-black border-2 border-black text-sm">
            +{tags.length - 4} more
          </span>
        )}
      </div>
    </div>
  );
};

const PhotoDetailScreen = ({ photo, onClose, onPhotoAction }) => {
  // State
  const [liked, setLiked] = useState(photo.is_liked || false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  
  // Context
  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useUIState();
  const { updatePhotoStats } = useDataSync();
  const { user } = useAuth();

  // Effects
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    fetchComments();
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [photo.id]);

  // Handlers
  const fetchComments = async () => {
    try {
      showLoading();
      const response = await commentsManager.getPhotoComments(photo.id);
      setComments(response.results || []);
    } catch (error) {
      showNotification('Failed to load comments', 'error');
      console.error('Error fetching comments:', error);
    } finally {
      hideLoading();
    }
  };

  const handleLike = async () => {
    if (!user) {
      showNotification('Please login to like photos', 'info');
      return;
    }

    try {
      showLoading();
      await likesManager.toggle(photo.id);
      setLiked(!liked);
      updatePhotoStats({ type: 'like', photoId: photo.id, value: !liked ? 1 : -1 });
      onPhotoAction?.('like', photo.id);
    } catch (error) {
      showNotification('Failed to like photo', 'error');
      console.error('Error toggling like:', error);
    } finally {
      hideLoading();
    }
  };

  const handleDownload = async () => {
    if (!user) {
      showNotification('Please login to download photos', 'info');
      return;
    }

    try {
      showLoading();
      await downloadsManager.downloadPhoto(photo.id);
      updatePhotoStats({ type: 'download', photoId: photo.id, value: 1 });
      onPhotoAction?.('download', photo.id);
      showNotification('Photo downloaded successfully', 'success');
    } catch (error) {
      showNotification('Failed to download photo', 'error');
      console.error('Error downloading photo:', error);
    } finally {
      hideLoading();
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (!user) {
      showNotification('Please login to comment', 'info');
      return;
    }

    try {
      showLoading();
      const response = await commentsManager.addComment(photo.id, comment.trim());
      setComments(prev => [response, ...prev]);
      setComment('');
      updatePhotoStats({ type: 'comment', photoId: photo.id, value: 1 });
      onPhotoAction?.('comment', photo.id);
    } catch (error) {
      showNotification('Failed to add comment', 'error');
      console.error('Error adding comment:', error);
    } finally {
      hideLoading();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-4xl border-2 border-black max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b-2 border-black sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-black">{photo.title || 'Photo Details'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:text-gray-600"
            aria-label="Close modal"
          >
            <FaTimes className="w-5 h-5 text-black" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left side - Photo */}
          <div className="p-4 border-b-2 md:border-b-0 md:border-r-2 border-black">
            <div className="relative">
              <img
                src={photo.image}
                alt={photo.title || 'Photo'}
                className="w-full h-auto border-2 border-black"
              />
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-black">{photo.title}</h3>
                  {photo.description && (
                    <p className="mt-2 text-black">{photo.description}</p>
                  )}
                </div>
                <PhotoStats 
                  photo={photo}
                  liked={liked}
                  onLike={handleLike}
                  onDownload={handleDownload}
                />
              </div>

              <PhotoTags tags={photo.ai_tags} />

              <div className="mt-4 text-sm text-gray-500">
                <p>Uploaded by: {photo.username}</p>
                <p>Upload date: {new Date(photo.upload_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Right side - Comments */}
          <div className="flex flex-col h-full">
            <div className="flex-1 p-4 overflow-y-auto">
              <h4 className="font-bold text-black mb-4">Comments</h4>
              <div className="space-y-4">
                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            </div>

            <div className="p-4 border-t-2 border-black mt-auto">
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border-2 border-black focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-all duration-300"
                >
                  Post
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetailScreen; 