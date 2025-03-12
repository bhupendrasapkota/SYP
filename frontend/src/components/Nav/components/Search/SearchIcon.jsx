import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import SearchBar from "./SearchBar";

const SearchIcon = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className="flex items-center justify-center w-10 h-10 border-2 border-black hover:bg-black hover:text-white transition-all duration-300"
        aria-label="Toggle search"
      >
        <FaSearch className="w-4 h-4 bg-transparent" />
      </button>

      {isSearchOpen && <SearchBar onClose={() => setIsSearchOpen(false)} />}
    </div>
  );
};

export default SearchIcon;
