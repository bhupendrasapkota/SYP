import React from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaHeart, FaShare } from "react-icons/fa";
import genres from "../../../Data/genres.json";

const Recentlyart = () => {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">
              Recently Added Art
            </h2>
            <p className="text-gray-400 mt-2">
              Fresh artworks from our community
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
          >
            View All
            <FaArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {genres.slice(0, 6).map((genre, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-lg overflow-hidden group"
            >
              <div className="relative">
                <img
                  src={genre.image}
                  alt={genre.title}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex justify-between items-center text-white">
                      <div className="flex items-center gap-2">
                        <FaHeart />
                        <span>{Math.floor(Math.random() * 100) + 10}</span>
                      </div>
                      <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <FaShare />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  {genre.title}
                </h3>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">{genre.games} Items</span>
                  <FaArrowRight className="text-white" />
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-white text-black py-2 px-4 hover:bg-gray-200 transition-colors text-sm">
                    PORTFOLIO
                  </button>
                  <button className="flex-1 border border-white text-white py-2 px-4 hover:bg-white hover:text-black transition-colors text-sm">
                    CONTACT
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recentlyart;
