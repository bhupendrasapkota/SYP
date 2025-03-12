import React, { useState } from "react";
import {
  FaMapMarkerAlt,
  FaGlobe,
  FaTwitter,
  FaInstagram,
  FaGithub,
  FaEdit,
} from "react-icons/fa";
import EditProfile from "./EditProfile";
import CollectionList from "../Collection/CollectionList";

const Profile = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // This will be replaced with actual API data matching backend model
  const profile = {
    id: "uuid-here",
    username: "johndoe",
    email: "john@example.com",
    full_name: "John Doe",
    bio: "Professional photographer with a passion for capturing life's beautiful moments",
    profile_picture: "https://source.unsplash.com/random/150x150",
    about:
      "I specialize in landscape and portrait photography. With over 5 years of experience, I strive to create stunning visuals that tell compelling stories.",
    contact: {
      website: "www.johndoe.com",
      location: "New York, USA",
      social: {
        twitter: "@johndoe",
        instagram: "@johndoe.photo",
        github: "johndoe",
      },
    },
    followers_count: 1234,
    following_count: 567,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-03-12T00:00:00Z",
  };

  return (
    <div className="w-full bg-white font-">
      {/* Cover Image */}
      <div className="w-full h-64 bg-gradient-to-r from-gray-900 to-black relative">
        <div className="absolute -bottom-16 left-2 border-4 border-white">
          <img
            src={profile.profile_picture}
            alt={profile.username}
            className="w-32 h-32 object-cover"
          />
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-20 px-2">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{profile.full_name}</h1>
            <p className="text-gray-600">@{profile.username}</p>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="border-2 border-black px-3 py-2 hover:bg-black hover:text-white transition-all duration-300"
          >
            <FaEdit className="w-5 h-5 bg-transparent" />
          </button>
        </div>

        <p className="mt-4 text-gray-800">{profile.bio}</p>

        {/* Contact Info */}
        <div className="mt-6 space-y-2">
          {profile.contact?.location && (
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-gray-600" />
              <span>{profile.contact.location}</span>
            </div>
          )}
          {profile.contact?.website && (
            <div className="flex items-center gap-2">
              <FaGlobe className="text-gray-600" />
              <a
                href={`https://${profile.contact.website}`}
                className="text-blue-600 hover:underline"
              >
                {profile.contact.website}
              </a>
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="mt-6 flex gap-4">
          {profile.contact?.social?.twitter && (
            <a
              href={`https://twitter.com/${profile.contact.social.twitter}`}
              className="text-gray-600 hover:text-black"
            >
              <FaTwitter className="w-6 h-6" />
            </a>
          )}
          {profile.contact?.social?.instagram && (
            <a
              href={`https://instagram.com/${profile.contact.social.instagram}`}
              className="text-gray-600 hover:text-black"
            >
              <FaInstagram className="w-6 h-6" />
            </a>
          )}
          {profile.contact?.social?.github && (
            <a
              href={`https://github.com/${profile.contact.social.github}`}
              className="text-gray-600 hover:text-black"
            >
              <FaGithub className="w-6 h-6" />
            </a>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 flex gap-6 border-b-2 border-black pt-4">
          <div>
            <span className="font-bold text-lg">{profile.followers_count}</span>
            <p className="text-gray-600">Followers</p>
          </div>
          <div>
            <span className="font-bold text-lg">{profile.following_count}</span>
            <p className="text-gray-600">Following</p>
          </div>
        </div>

        {/* About Section */}
        {profile.about && (
          <div className="mt-8 pt-4">
            <h2 className="text-xl font-bold mb-2">About</h2>
            <p className="text-gray-800">{profile.about}</p>
          </div>
        )}

        {/* Collections Section */}
        <div className="mt-8 pt-4">
          <CollectionList />
        </div>

        {/* Member Since */}
        <div className="mt-8 pt-4 text-sm text-gray-600">
          Member since {new Date(profile.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfile
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
      />
    </div>
  );
};

export default Profile;
