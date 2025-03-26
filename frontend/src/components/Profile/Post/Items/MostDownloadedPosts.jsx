import React, { useState, useEffect, useCallback } from 'react';
import Masonry from 'react-masonry-css';
import { useUIState } from '../../../../context/UIStateContext';
import { useAuth } from '../../../../context/AuthContext';
import { useDataSync } from '../../../../context/DataSyncContext';
import { downloadsManager } from '../../../../api/features/downloads/manage';
import PostCard from '../../../Screen/Ui/PostCard';

const MostDownloadedPosts = ({ user, onPhotoClick }) => {
  const [downloadedPosts, setDownloadedPosts] = useState(new Map());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const { showNotification } = useUIState();
  const { isAuthenticated } = useAuth();
  const { triggerSync } = useDataSync();

  const fetchDownloadedPosts = useCallback(async (pageNum) => {
    if (isLoading || !hasMore) return;

    try {
      setIsLoading(true);
      const response = await downloadsManager.getDownloadHistory(user.id, pageNum);

      if (Array.isArray(response) && response.length > 0) {
        setDownloadedPosts(prevPosts => {
          const newPosts = new Map(prevPosts);
          response.forEach(item => {
            newPosts.set(item.photo.id, {
              ...item.photo,
              downloaded_at: item.downloaded_at,
              download_id: item.id
            });
          });
          return newPosts;
        });
        
        setHasMore(response.length === 10);
        setPage(pageNum + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      showNotification('Error fetching downloaded posts', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user.id, hasMore, isLoading, showNotification]);

  useEffect(() => {
    setPage(1);
    setDownloadedPosts(new Map());
    setHasMore(true);
    fetchDownloadedPosts(1);
  }, [user.id, fetchDownloadedPosts]);

  const handleLoadMore = () => {
    fetchDownloadedPosts(page);
  };

  const handleRemoveFromDownloads = async (postId) => {
    try {
      setIsRemoving(true);
      await downloadsManager.removeDownload(postId);
      setDownloadedPosts(prevPosts => {
        const updatedPosts = new Map(prevPosts);
        updatedPosts.delete(postId);
        return updatedPosts;
      });
      showNotification('Photo removed from downloads', 'success');
      triggerSync();
    } catch (error) {
      showNotification('Error removing from downloads', 'error');
    } finally {
      setIsRemoving(false);
    }
  };

  const posts = Array.from(downloadedPosts.values());

  if (!posts.length && !isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-500 text-lg font-medium">No downloaded photos yet</p>
        <p className="text-gray-400 text-sm">Your downloaded photos will appear here</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="relative min-h-[200px]">
        <Masonry
          breakpointCols={{
            default: 4,
            1100: 3,
            700: 2,
            500: 1
          }}
          className="flex -ml-4 w-auto"
          columnClassName="pl-4 bg-clip-padding"
        >
          {posts.map(post => (
            <div key={post.id} className="mb-4 transform transition-transform duration-200 hover:-translate-y-1">
              <PostCard
                post={post}
                user={user}
                onPostDeleted={handleRemoveFromDownloads}
                isDownloadedPhoto={true}
                isAuthenticated={isAuthenticated}
                onClick={() => onPhotoClick?.(post)}
                className="shadow-lg rounded-lg overflow-hidden"
                isLoading={isRemoving}
              />
            </div>
          ))}
        </Masonry>
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8 pb-8">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="px-8 py-3 border-2 border-black text-black hover:bg-black hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Loading...</span>
              </div>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default MostDownloadedPosts; 