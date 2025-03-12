import React from "react";
import Masonry from "react-masonry-css";
import { FaHeart, FaDownload, FaPlus, FaComment } from "react-icons/fa";

const Pagination = () => {
  const breakpointColumns = {
    default: 4,
    1100: 3,
    768: 2,
    500: 1,
  };

  // Sample posts data for UI layout
  const samplePosts = [
    {
      id: 1,
      image: "/sample/image1.jpg",
      profile_picture: "/sample/profile1.jpg",
      user: "John Doe",
      description: "Beautiful landscape",
    },
    {
      id: 2,
      image: "/sample/image2.jpg",
      profile_picture: "/sample/profile2.jpg",
      user: "Jane Smith",
      description: "Urban photography",
    },
    {
      id: 3,
      image: "/sample/image3.jpg",
      profile_picture: "/sample/profile3.jpg",
      user: "Mike Johnson",
      description: "Abstract art",
    },
  ];

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="flex gap-4"
      columnClassName="masonry-column space-y-4"
    >
      {samplePosts.map((post) => (
        <div
          key={post.id}
          className="border-2 border-black bg-white shadow-lg group transition-transform duration-300 hover:scale-105"
        >
          <img
            src={post.image}
            alt={post.description || "Post Image"}
            className="w-full h-64 object-cover border-b-2 border-black"
          />
          <div className="p-4">
            <h3 className="font-bold mb-2">{post.user}</h3>
            <p className="text-gray-600 mb-4">{post.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex gap-4">
                <span className="flex items-center gap-1">
                  <FaHeart /> 42
                </span>
                <span className="flex items-center gap-1">
                  <FaComment /> 5
                </span>
                <span className="flex items-center gap-1">
                  <FaDownload /> 12
                </span>
              </div>
              <span>03/12/2024</span>
            </div>
          </div>
        </div>
      ))}
    </Masonry>
  );
};

export default Pagination;
