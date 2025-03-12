import React from "react";
import { FaArrowRight } from "react-icons/fa";

const Article = () => {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-4">ARTWORK</h2>
            <p className="text-lg text-gray-300 mb-8">SHOWCASE ME</p>
            <p className="text-gray-400">FOR CREATIVE DESIGNERS</p>
          </div>
          <div className="text-white">
            <h3 className="text-2xl font-bold mb-4">
              100+ Premium Art Mockups
            </h3>
            <p className="text-gray-300 mb-8">
              50+ Creative Art Mockups for your next project. Perfect for
              showcasing your artwork in a professional way.
            </p>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 px-6 py-2 bg-white text-black hover:bg-gray-200 transition-colors">
                PORTFOLIO
                <FaArrowRight />
              </button>
              <button className="flex items-center gap-2 px-6 py-2 border border-white text-white hover:bg-white hover:text-black transition-colors">
                CONTACT
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Article;
