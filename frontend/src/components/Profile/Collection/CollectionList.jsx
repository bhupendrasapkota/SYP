import React from "react";
import CollectionItem from "./CollectionItem";

const CollectionList = () => {
  // Static data for UI demonstration
  const collections = [
    {
      id: "1",
      name: "Nature Photography",
      description: "A collection of beautiful nature photos.",
      likes_count: 120,
      followers_count: 80,
      slug: "nature-photography",
    },
    {
      id: "2",
      name: "Urban Exploration",
      description: "Exploring the hidden gems of the city.",
      likes_count: 95,
      followers_count: 60,
      slug: "urban-exploration",
    },
    {
      id: "3",
      name: "Portraits",
      description: "Capturing the essence of people.",
      likes_count: 150,
      followers_count: 100,
      slug: "portraits",
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">My Collections</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((collection) => (
          <CollectionItem key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  );
};

export default CollectionList;
