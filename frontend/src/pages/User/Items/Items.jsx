import React from "react";
import { Link } from "react-router-dom";
import Masonry from "react-masonry-css";

const Items = () => {
  // Define Masonry breakpoints for 4 columns
  const breakpointColumns = {
    default: 4,
    1200: 3,
    900: 2,
    600: 1,
  };

  // Sample users data for UI layout
  const sampleUsers = [
    {
      id: 1,
      username: "ArtisticSoul",
      bio: "Digital artist passionate about colors",
      profile_picture: "/sample/profile1.jpg",
      recent_posts: [
        "/sample/art1.jpg",
        "/sample/art2.jpg",
        "/sample/art3.jpg",
      ],
    },
    {
      id: 2,
      username: "CreativeMinds",
      bio: "Photography enthusiast",
      profile_picture: "/sample/profile2.jpg",
      recent_posts: [
        "/sample/photo1.jpg",
        "/sample/photo2.jpg",
        "/sample/photo3.jpg",
      ],
    },
    {
      id: 3,
      username: "DesignMaster",
      bio: "UI/UX Designer",
      profile_picture: null,
      recent_posts: [],
    },
  ];

  return (
    <section className="p-10">
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex gap-6"
        columnClassName="masonry-column space-y-6"
      >
        {sampleUsers.map((user) => (
          <div
            key={user.id}
            className="border shadow-lg p-4 w-full text-center hover:border-black"
          >
            {/* Profile Section */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 overflow-hidden flex items-center justify-center">
                {user.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold">No Image</span>
                )}
              </div>
              <div className="text-left">
                <h2 className="font-bold text-lg">{user.username}</h2>
                <p className="text-gray-500">
                  {user.bio || "No bio available"}
                </p>
              </div>
            </div>

            {/* Recent Posts Section */}
            <div className="flex gap-2 my-3">
              {user.recent_posts.length > 0 ? (
                user.recent_posts.map((post, index) => (
                  <div
                    key={index}
                    className="w-1/3 h-24 bg-gray-300 overflow-hidden"
                  >
                    <img
                      src={post}
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 w-full">No posts available</p>
              )}
            </div>

            {/* View Profile Button */}
            <Link to={`/user/${user.username}`}>
              <button className="w-full py-1 bg-white border hover:border-black font-mono text-zinc-500 hover:text-black">
                View profile
              </button>
            </Link>
          </div>
        ))}
      </Masonry>
    </section>
  );
};

export default Items;
