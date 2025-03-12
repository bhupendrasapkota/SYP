import React, { useState } from "react";
import {
  FaEdit,
  FaMapMarkerAlt,
  FaLink,
  FaTwitter,
  FaInstagram,
  FaGithub,
  FaHeart,
  FaShare,
} from "react-icons/fa";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("posts");

  // This will be connected to backend later
  const profile = {
    name: "John Doe",
    username: "@johndoe",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    bio: "Digital artist and creative developer passionate about creating unique experiences.",
    location: "New York, USA",
    website: "www.johndoe.com",
    social: {
      twitter: "johndoe",
      instagram: "johndoe.art",
      github: "johndoe",
    },
    stats: {
      posts: 245,
      followers: 18200,
      following: 843,
    },
  };

  // Dummy data for posts
  const posts = Array(6)
    .fill(null)
    .map((_, i) => ({
      id: i,
      image: `https://picsum.photos/600/400?random=${i}`,
      likes: Math.floor(Math.random() * 1000),
      title: `Artwork ${i + 1}`,
      description: "Digital Art",
    }));

  const tabs = [
    { id: "posts", label: "Posts" },
    { id: "collections", label: "Collections" },
    { id: "liked", label: "Liked" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-64 rounded-xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1510784722466-f2aa9c52fff6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80"
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Profile Info */}
          <div className="relative px-4 -mt-20">
            <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full border-4 border-black"
                />
                <button className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full hover:bg-blue-600 transition-colors">
                  <FaEdit className="text-white" />
                </button>
              </div>

              {/* Name and Bio */}
              <div className="md:ml-6 text-center md:text-left flex-grow">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <p className="text-gray-400">{profile.username}</p>
                <p className="mt-2 max-w-2xl">{profile.bio}</p>
              </div>

              {/* Edit Profile Button */}
              <button className="px-6 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors">
                Edit Profile
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 flex flex-wrap gap-6">
              <div className="flex items-center text-gray-400">
                <FaMapMarkerAlt className="mr-2" />
                {profile.location}
              </div>
              <div className="flex items-center text-gray-400">
                <FaLink className="mr-2" />
                <a
                  href={`https://${profile.website}`}
                  className="hover:text-blue-400 transition-colors"
                >
                  {profile.website}
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-4 flex gap-4">
              <a
                href={`https://twitter.com/${profile.social.twitter}`}
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <FaTwitter className="text-xl" />
              </a>
              <a
                href={`https://instagram.com/${profile.social.instagram}`}
                className="text-gray-400 hover:text-pink-400 transition-colors"
              >
                <FaInstagram className="text-xl" />
              </a>
              <a
                href={`https://github.com/${profile.social.github}`}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <FaGithub className="text-xl" />
              </a>
            </div>

            {/* Stats */}
            <div className="mt-6 flex justify-center md:justify-start space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold">{profile.stats.posts}</div>
                <div className="text-gray-400">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {profile.stats.followers}
                </div>
                <div className="text-gray-400">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {profile.stats.following}
                </div>
                <div className="text-gray-400">Following</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="flex justify-center border-b border-gray-800">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="mt-8">
            {activeTab === "posts" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="group relative bg-gray-900 rounded-lg overflow-hidden"
                  >
                    <div className="relative aspect-w-4 aspect-h-3">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white font-bold">{post.title}</h3>
                          <p className="text-gray-300 text-sm">
                            {post.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 text-white">
                              <FaHeart />
                              <span>{post.likes}</span>
                            </div>
                            <button className="p-2 text-white hover:text-blue-400 transition-colors">
                              <FaShare />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "collections" && (
              <div className="text-center text-gray-400 py-12">
                No collections yet
              </div>
            )}

            {activeTab === "liked" && (
              <div className="text-center text-gray-400 py-12">
                No liked posts yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
