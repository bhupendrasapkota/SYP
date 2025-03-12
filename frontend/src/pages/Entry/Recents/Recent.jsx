import React from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import genres from "../../../Data/genres.json";

const Recent = () => {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Recent Articles</h2>
            <p className="text-gray-400 mt-2">
              Discover our latest artworks and stories
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
          >
            All Articles
            <FaArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {genres.slice(0, 6).map((genre, index) => (
            <div key={index} className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="relative">
                <img
                  src={genre.image}
                  alt={genre.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 transition-opacity hover:bg-opacity-20" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  {genre.title}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">{genre.games} Items</span>
                  <FaArrowRight className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recent;
