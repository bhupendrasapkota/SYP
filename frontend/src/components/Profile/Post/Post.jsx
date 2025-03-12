import React, { useState } from "react";
import Modal from "react-modal";
import {
  FaImage,
  FaTimes,
  FaUpload,
  FaTags,
  FaHeart,
  FaComment,
  FaDownload,
} from "react-icons/fa";

Modal.setAppElement("#root");

const Post = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ai_tags: [],
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    setPreviewUrl(null);
    setFormData({
      title: "",
      description: "",
      ai_tags: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // This will be connected to the backend API
    console.log("Form data:", { ...formData, image: selectedImage });
    handleCloseModal();
  };

  // Sample posts matching backend model
  const samplePosts = [
    {
      id: "uuid-1",
      user: {
        id: "user-uuid",
        username: "johndoe",
      },
      image: "https://source.unsplash.com/random/800x600?nature",
      title: "Morning Mist",
      description: "Captured this beautiful morning scene",
      width: 800,
      height: 600,
      format: "jpg",
      ai_tags: ["nature", "landscape", "morning", "mist"],
      upload_date: "2024-03-12T08:00:00Z",
      likes_count: 42,
      comments_count: 5,
      downloads_count: 12,
    },
  ];

  return (
    <div className="w-full bg-white px-2 py-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Posts</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-all duration-300"
        >
          Create Post
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        className="fixed inset-0 flex items-center justify-center p-2"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white w-full max-w-2xl border-2 border-black">
          <div className="flex justify-between items-center p-4 border-b-2 border-black">
            <h2 className="text-xl font-bold">Create New Post</h2>
            <button
              onClick={handleCloseModal}
              className="p-2 hover:text-gray-600"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4">
            <div className="mb-4">
              <label className="block mb-2 font-bold">
                Image
                <div className="mt-1 border-2 border-black p-4 flex flex-col items-center justify-center cursor-pointer">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-64 w-auto object-contain"
                    />
                  ) : (
                    <>
                      <FaImage className="w-8 h-8 mb-2" />
                      <p>Click or drag to upload image</p>
                    </>
                  )}
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

            <div className="mb-4">
              <label className="block mb-2 font-bold">
                Title
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 border-2 border-black focus:outline-none"
                  required
                />
              </label>
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-bold">
                Description
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 border-2 border-black focus:outline-none resize-none h-32"
                  required
                />
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-all duration-300"
              >
                Create Post
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {samplePosts.map((post) => (
          <div key={post.id} className="border-2 border-black">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <h3 className="font-bold mb-2">{post.title}</h3>
              <p className="text-gray-600 mb-4">{post.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1">
                    <FaHeart /> {post.likes_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaComment /> {post.comments_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaDownload /> {post.downloads_count}
                  </span>
                </div>
                <span>{new Date(post.upload_date).toLocaleDateString()}</span>
              </div>
              {post.ai_tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.ai_tags.map((tag, index) => (
                    <span key={index} className="text-xs text-gray-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Post;
