import React from "react";
import { Link } from "react-router-dom";

const AuthButtons = () => {
  return (
    <div className="flex items-center gap-2 h-full">
      <Link
        to="/login"
        className="px-4 py-2 text-sm font-medium border-2 border-black text-black hover:bg-black hover:text-white transition-all duration-300"
      >
        Login
      </Link>
      <Link
        to="/signup"
        className="px-4 py-2 text-sm font-medium bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-all duration-300"
      >
        Sign Up
      </Link>
    </div>
  );
};

export default AuthButtons;
