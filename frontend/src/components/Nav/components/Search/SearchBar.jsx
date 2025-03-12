import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

const SearchBar = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle search logic here
    console.log("Searching for:", searchTerm);
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-black shadow-lg">
      <form onSubmit={handleSubmit} className="flex items-center p-2 gap-2">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="flex-1 px-3 py-2 text-sm border-2 border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
        />
        <button
          type="submit"
          className="flex items-center justify-center w-10 h-10 border-2 border-black hover:bg-black hover:text-white transition-all duration-300"
          aria-label="Search"
        >
          <FaSearch className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center w-10 h-10 border-2 border-black hover:bg-black hover:text-white transition-all duration-300"
          aria-label="Close search"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
