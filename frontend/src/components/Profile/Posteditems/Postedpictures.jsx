import React, { useState } from "react";
import Masonry from "react-masonry-css";
import {
  FaHeart,
  FaComment,
  FaDownload,
  FaShare,
  FaEye,
  FaTags,
} from "react-icons/fa";

const Postedpictures = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedPost, setSelectedPost] = useState(null);

  const breakpointColumns = {
    default: 3,
    1024: 2,
    640: 1,
  };

  // Sample posts matching backend model
  const posts = [
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
    // Add more sample posts as needed
  ];

  const filters = [
    { id: "all", label: "All Posts" },
    { id: "popular", label: "Most Popular" },
    { id: "recent", label: "Recent" },
    { id: "downloads", label: "Most Downloaded" },
  ];

  const filteredPosts = () => {
    switch (selectedFilter) {
      case "popular":
        return [...posts].sort((a, b) => b.likes_count - a.likes_count);
      case "recent":
        return [...posts].sort(
          (a, b) => new Date(b.upload_date) - new Date(a.upload_date)
        );
      case "downloads":
        return [...posts].sort((a, b) => b.downloads_count - a.downloads_count);
      default:
        return posts;
    }
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  return (
    <div className="w-full bg-white px-2 py-4">
      <h2 className="text-xl font-bold mb-4">Posted Pictures</h2>
      <div className="flex gap-4 mb-6 overflow-x-auto">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id)}
            className={`px-4 py-2 border-2 ${
              selectedFilter === filter.id
                ? "bg-black text-white border-black"
                : "border-black hover:bg-black hover:text-white"
            } transition-all duration-300 whitespace-nowrap`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPosts().map((post) => (
          <div
            key={post.id}
            className="border-2 border-black cursor-pointer"
            onClick={() => setSelectedPost(post)}
          >
            <div className="relative group">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                <div className="hidden group-hover:flex gap-6 text-white">
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
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Post Details Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl border-2 border-black">
            <div className="flex">
              {/* Image Section */}
              <div className="w-2/3 border-r-2 border-black">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className="w-full h-[600px] object-contain"
                />
              </div>
              {/* Details Section */}
              <div className="w-1/3 p-4">
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 text-black hover:text-gray-600"
                >
                  ✕
                </button>
                <h3 className="text-xl font-bold mb-2">{selectedPost.title}</h3>
                <p className="text-gray-600 mb-4">{selectedPost.description}</p>

                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    Uploaded on{" "}
                    {new Date(selectedPost.upload_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedPost.width} × {selectedPost.height} •{" "}
                    {selectedPost.format.toUpperCase()}
                  </p>
                </div>

                <div className="flex gap-6 mb-4">
                  <span className="flex items-center gap-1">
                    <FaHeart /> {selectedPost.likes_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaComment /> {selectedPost.comments_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaDownload /> {selectedPost.downloads_count}
                  </span>
                </div>

                {selectedPost.ai_tags.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <FaTags /> AI Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPost.ai_tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-sm border-2 border-black"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button className="w-full px-4 py-2 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-all duration-300">
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Postedpictures;
