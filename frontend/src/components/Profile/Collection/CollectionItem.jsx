import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaUserPlus, FaUserMinus } from "react-icons/fa";

const CollectionItem = ({ collection }) => {
  // Static data for photos in the collection
  const photos = [
    {
      id: "photo-1",
      url: "https://source.unsplash.com/random/100x100?sig=1",
      title: "Sunset Over Mountains",
    },
    {
      id: "photo-2",
      url: "https://source.unsplash.com/random/100x100?sig=2",
      title: "City Skyline",
    },
    {
      id: "photo-3",
      url: "https://source.unsplash.com/random/100x100?sig=3",
      title: "Forest Path",
    },
  ];

  const [liked, setLiked] = useState(false);
  const [followed, setFollowed] = useState(false);

  const toggleLike = () => setLiked(!liked);
  const toggleFollow = () => setFollowed(!followed);

  return (
    <div className="border-2 border-black p-4 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-lg font-bold mb-2 text-black">{collection.name}</h3>
      <p className="text-gray-800 mb-4">{collection.description}</p>
      <div className="flex justify-between items-center text-sm text-gray-800">
        <span>{collection.likes_count} Likes</span>
        <span>{collection.followers_count} Followers</span>
      </div>
      <div className="text-sm text-gray-800 mt-2">
        <span>{collection.is_public ? "Public" : "Private"}</span>
        <span className="ml-4">
          Created on {new Date(collection.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Engagement Buttons */}
      <div className="mt-4 flex gap-4">
        <button
          onClick={toggleLike}
          className="flex items-center gap-1 text-black hover:text-gray-600"
        >
          {liked ? <FaHeart /> : <FaRegHeart />} {liked ? "Unlike" : "Like"}
        </button>
        <button
          onClick={toggleFollow}
          className="flex items-center gap-1 text-black hover:text-gray-600"
        >
          {followed ? <FaUserMinus /> : <FaUserPlus />}{" "}
          {followed ? "Unfollow" : "Follow"}
        </button>
      </div>

      {/* Photos in Collection */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="w-full h-24 bg-gray-200">
            <img
              src={photo.url}
              alt={photo.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <Link
        to={`/collections/${collection.slug}`}
        className="mt-4 inline-block px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-all duration-300"
      >
        View Collection
      </Link>
    </div>
  );
};

export default CollectionItem;
