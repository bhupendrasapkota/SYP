import Masonry from "react-masonry-css";
import { useEffect, useState } from "react";
import { FaHeart, FaDownload, FaPlus, FaComment } from "react-icons/fa";

const Items = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // TODO: Implement actual posts fetching
    const mockPosts = [
      {
        id: 1,
        title: "Sample Post 1",
        description: "Beautiful nature scene",
        image: "",
      },
      {
        id: 2,
        title: "Sample Post 2",
        description: "Urban architecture",
        image: "/sample2.jpg",
      },
      // Add more mock posts as needed
    ];

    setPosts(mockPosts);
  }, []);

  const breakpointColumns = {
    default: 4,
    1100: 3,
    768: 2,
    500: 1,
  };

  const downloadImage = (imageUrl) => {
    // TODO: Implement actual download functionality
    console.log("Downloading image:", imageUrl);
    alert("Download feature will be implemented soon!");
  };

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="flex gap-4"
      columnClassName="masonry-column space-y-4"
    >
      {posts.map((post) => (
        <div
          key={post.id}
          className="border-2 border-black bg-white shadow-lg group transition-transform duration-300 hover:scale-105"
        >
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-64 object-cover border-b-2 border-black"
          />
          <div className="p-4">
            <h3 className="font-bold mb-2">{post.title}</h3>
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

export default Items;
