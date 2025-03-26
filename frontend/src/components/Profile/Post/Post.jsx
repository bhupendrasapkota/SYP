import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { FaTimes } from "react-icons/fa";
import photosManager from "../../../api/features/photos/manage";
import { useAuth } from "../../../context/AuthContext";
import { useLoading } from "../../../context/LoadingContext";
import { useUIState } from "../../../context/UIStateContext";
import { useDataSync } from "../../../context/DataSyncContext";
import { useNavigate } from 'react-router-dom';
import AllPosts from './Items/AllPosts';
import MostDownloadedPosts from './Items/MostDownloadedPosts';
import PhotoDetailScreen from '../../Screen/Photo/PhotoDetailScreen';

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

const Post = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all");
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const { user } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const { updatePostsList, removePost } = useDataSync();
  const { showNotification } = useUIState();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) {
        showNotification('Please login to view your posts', 'info');
        navigate('/login');
        return;
      }

      if (currentFilter === 'downloads') return;

      try {
        showLoading();
        const result = await photoManager.getUserGallery(user.id, page, 10);
        if (result) {
          setPosts(prev => page === 1 ? result : [...prev, ...result]);
          setHasMore(result.length === 10);
        }
      } catch (error) {
        showNotification(error.response?.data?.error || 'Failed to load posts. Please try again.', 'error');
      } finally {
        hideLoading();
      }
    };

    fetchPosts();
  }, [currentFilter, page, showLoading, hideLoading, showNotification, user, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      showNotification("Image size should be less than 5MB", "error");
      return;
    }
    setSelectedImage(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "title") setTitle(value);
    if (name === "tags") setTags(value);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    setTitle("");
    setTags("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      showNotification("Please select an image", "error");
      return;
    }

    try {
      showLoading();
      const formData = new FormData();
      formData.append("photo", selectedImage);
      formData.append("title", title);
      formData.append("tags", tags);

      const response = await photoManager.uploadPhoto(formData);
      updatePostsList(response.data);
      showNotification("Photo uploaded successfully!", "success");
      handleCloseModal();
    } catch (error) {
      showNotification(error.message || "Failed to upload photo", "error");
    } finally {
      hideLoading();
    }
  };

  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
    setPage(1);
    setPosts([]);
    setHasMore(true);
  };

  const handlePostDeleted = (postId) => {
    removePost(postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handlePhotoClick = (post) => {
    setSelectedPost(post);
  };

  const handleClosePhotoDetail = () => {
    setSelectedPost(null);
  };

  const handleLoadMore = () => {
    if (!hasMore) return;
    setPage(prev => prev + 1);
  };

  return (
    <div className="w-full bg-white px-2 py-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">My Posts</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1 border-2 border-black transition-all duration-300 ${
              currentFilter === 'all' 
                ? 'bg-black text-white' 
                : 'hover:bg-black hover:text-white'
            }`}
          >
            All Posts
          </button>
          <button
            onClick={() => handleFilterChange('downloads')}
            className={`px-3 py-1 border-2 border-black transition-all duration-300 ${
              currentFilter === 'downloads' 
                ? 'bg-black text-white' 
                : 'hover:bg-black hover:text-white'
            }`}
          >
            Most Downloaded
          </button>
          {user && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1 border-2 border-black hover:bg-black hover:text-white transition-all duration-300"
            >
              Create Post
            </button>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        className="fixed inset-0 flex items-center justify-center p-4 z-[50]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-[49]"
        style={modalStyles}
      >
        <div className="w-full bg-white border-2 border-black overflow-y-scroll no-scrollbar">
          <div className="flex justify-between items-center p-4 border-b-2 border-black sticky z-10 top-0 bg-white">
            <h2 className="text-xl font-bold text-black">Create New Post</h2>
            <button
              onClick={handleCloseModal}
              className="p-2 hover:text-gray-600"
              aria-label="Close modal"
            >
              <FaTimes className="w-5 h-5 text-black" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-bold text-black">
                  Image
                  <div className="mt-1 border-2 border-black p-4 flex flex-col items-center justify-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      required
                    />
                  </div>
                </label>
              </div>

              <div>
                <label className="block mb-2 font-bold text-black">
                  Title
                  <input
                    type="text"
                    name="title"
                    value={title}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 border-2 border-black focus:outline-none text-black placeholder-gray-500"
                    required
                  />
                </label>
              </div>

              <div>
                <label className="block mb-2 font-bold text-black">
                  Tags
                  <input
                    type="text"
                    name="tags"
                    value={tags}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 border-2 border-black focus:outline-none text-black placeholder-gray-500"
                    required
                  />
                </label>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full sm:w-auto px-4 py-2 border-2 border-black text-black hover:bg-black hover:text-white transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-all duration-300"
              >
                Create Post
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {selectedPost && (
        <PhotoDetailScreen
          photo={selectedPost}
          onClose={handleClosePhotoDetail}
          onPhotoAction={(type, id) => {
            if (type === 'delete') {
              handlePostDeleted(id);
            }
          }}
        />
      )}

      {currentFilter === 'all' ? (
        <AllPosts 
          posts={posts} 
          user={user} 
          onPostDeleted={handlePostDeleted}
          onPhotoClick={handlePhotoClick}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
      ) : currentFilter === 'downloads' ? (
        <MostDownloadedPosts 
          posts={posts} 
          user={user} 
          onPostDeleted={handlePostDeleted}
          onPhotoClick={handlePhotoClick}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
      ) : null}
    </div>
  );
};

export default Post;