import React from 'react';
import Masonry from 'react-masonry-css';
import PostCard from '../../../../components/Screen/Ui/PostCard';
import photoManager from '../../../../api/features/photos/manage';
import { useUIState } from '../../../../context/UIStateContext';
import { useLoading } from '../../../../context/LoadingContext';
import { useDataSync } from '../../../../context/DataSyncContext';

const AllPosts = ({ posts, user, onPostDeleted, onPhotoClick, hasMore, onLoadMore }) => {
  const { showNotification } = useUIState();
  const { showLoading, hideLoading } = useLoading();
  const { removePost } = useDataSync();

  const handleDelete = async (postId) => {
    if (!postId) {
      showNotification('Invalid photo ID', 'error');
      return;
    }

    try {
      showLoading();
      await photoManager.deletePhoto(postId);
      removePost(postId);
      onPostDeleted?.(postId);
      showNotification('Photo deleted successfully', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to delete photo', 'error');
    } finally {
      hideLoading();
    }
  };

  const validPosts = posts.filter(post => post?.id && post?.image);

  return (
    <div>
      <Masonry
        breakpointCols={{
          default: 3,
          1100: 2,
          700: 1
        }}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {validPosts.map((post, index) => (
          <PostCard
            key={`${post.id}-${index}`}
            post={post}
            user={user}
            onDelete={handleDelete}
            onPhotoClick={() => onPhotoClick(post)}
          />
        ))}
      </Masonry>
      {hasMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors duration-200"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default AllPosts; 